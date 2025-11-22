package com.example.vision_next2.data.simulator

import android.util.Log
import com.example.vision_next2.data.simulator.HealthMetricSnapshot
import com.example.vision_next2.data.simulator.MetricHistoryEntry
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import org.json.JSONArray
import java.time.LocalDate
import java.time.Instant
import java.time.LocalTime
import java.util.Random

data class WearableBaselineConfig(
    val restingHrMin: Int = 55,
    val restingHrMax: Int = 75,
    val hrvRmssdMin: Int = 20,
    val hrvRmssdMax: Int = 80,
    val skinTempMin: Double = 32.0,
    val skinTempMax: Double = 35.0,
    val respRateMin: Int = 10,
    val respRateMax: Int = 18,
    val spo2Min: Int = 96,
    val spo2Max: Int = 99,

    // Continuous EDA baseline (µS)
    val edaMin: Double = 0.1,
    val edaMax: Double = 5.0,

    // Sleep summary baselines
    val sleepTstMinHours: Double = 6.0,
    val sleepTstMaxHours: Double = 9.0,
    val sleepLatencyMinMinutes: Double = 5.0,
    val sleepLatencyMaxMinutes: Double = 45.0,
    val sleepEfficiencyMinPct: Double = 75.0,
    val sleepEfficiencyMaxPct: Double = 95.0,
    val sleepTibOverheadMinMinutes: Double = 10.0,
    val sleepTibOverheadMaxMinutes: Double = 60.0,

    // Time-of-day modulation offsets (applied based on configured ranges below)
    val nightHrOffset: Double = -5.0,
    val nightHrvOffset: Double = 10.0,
    val workHrOffset: Double = 5.0,
    val workHrvOffset: Double = -5.0,

    // Time ranges (local time) for sleep and work periods
    // Defaults: Sleep 23:00–07:00, Work 09:00–17:00
    val sleepStartHour: Int = 23,
    val sleepStartMinute: Int = 0,
    val sleepEndHour: Int = 7,
    val sleepEndMinute: Int = 0,
    val workStartHour: Int = 9,
    val workStartMinute: Int = 0,
    val workEndHour: Int = 17,
    val workEndMinute: Int = 0,

    // Default endpoint assumes Android emulator talking to host machine
    val endpointBaseUrl: String = "http://10.0.2.2:9000"
)

object WearableSimulator {

    private const val TAG = "WearableSimulator"
    private const val CMS_BASE_URL = "http://10.0.2.2:8000"

    private val client = OkHttpClient()
    private val rng = Random()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // State for occasional stress events
    private var stressTicksRemaining: Int = 0
    @Volatile
    private var lastSleepSummaryDay: LocalDate? = null
    @Volatile
    private var lastSleepSummary: SleepSummary? = null
    @Volatile
    private var lastSample: WearableSample? = null

    // Global simulator state
    @Volatile
    private var currentConfig: WearableBaselineConfig = WearableBaselineConfig()

    @Volatile
    private var isActive: Boolean = false

    @Volatile
    private var currentUserId: Int? = null

    @Volatile
    private var currentAccessToken: String? = null

    @Volatile
    private var currentRefreshToken: String? = null

    private var job: Job? = null
    private val metricHistoryMap = mutableMapOf<String, ArrayDeque<MetricHistoryEntry>>()
    private val _metricHistoryFlow = MutableStateFlow<Map<String, List<MetricHistoryEntry>>>(emptyMap())
    private val _healthMetricsFlow = MutableStateFlow<HealthMetricSnapshot?>(null)

    fun healthMetrics(): StateFlow<HealthMetricSnapshot?> = _healthMetricsFlow.asStateFlow()
    fun metricsHistory(): StateFlow<Map<String, List<MetricHistoryEntry>>> = _metricHistoryFlow.asStateFlow()

    fun updateConfig(config: WearableBaselineConfig) {
        currentConfig = config
        Log.d(TAG, "Config updated: $config")
    }

    fun setActiveFlag(active: Boolean) {
        isActive = active
        Log.d(TAG, "setActiveFlag active=$active userId=$currentUserId")
        if (!active) {
            stopInternal()
        } else {
            startIfReady()
        }
    }

    fun isActive(): Boolean = isActive

    fun onUserLoggedIn(userId: Int?, accessToken: String?, refreshToken: String?) {
        Log.d(TAG, "onUserLoggedIn userId=$userId accessTokenNull=${accessToken.isNullOrBlank()} refreshTokenNull=${refreshToken.isNullOrBlank()}")
        currentUserId = userId
        currentAccessToken = accessToken
        currentRefreshToken = refreshToken
        if (userId != null) {
            scope.launch {
                preloadHistoricalData(userId, accessToken, refreshToken)
            }
        }
        startIfReady()
    }

    fun onUserLoggedOut() {
        currentUserId = null
        currentAccessToken = null
        currentRefreshToken = null
        Log.d(TAG, "onUserLoggedOut – stopping simulator")
        stopInternal()
        _healthMetricsFlow.value = null
        _metricHistoryFlow.value = emptyMap()
        metricHistoryMap.clear()
    }

    private fun startIfReady() {
        val userId = currentUserId
        Log.d(TAG, "startIfReady called isActive=$isActive userId=$userId")
        if (!isActive || userId == null) {
            Log.d(TAG, "startIfReady aborted (isActive=$isActive, userId=$userId)")
            return
        }
        startInternal(currentConfig, userId)
    }

    private fun startInternal(config: WearableBaselineConfig, userId: Int) {
        Log.d(TAG, "startInternal: starting loop for userId=$userId endpoint=${config.endpointBaseUrl}")
        job?.cancel()
        job = scope.launch {
            // Send a sample every 5 seconds
            val intervalMs = 5_000L
            while (isActive) {
                val now = LocalTime.now()
                val sample = generateSample(now, config, userId)
                lastSample = sample
                Log.d(TAG, "Loop tick at $now, sending sample: $sample")
                sendSample(sample, config.endpointBaseUrl)
                publishSampleMetrics(sample)
                maybeSendSleepSummary(config, userId, config.endpointBaseUrl, now)
                delay(intervalMs)
            }
            Log.d(TAG, "Simulator loop stopped (isActive=$isActive)")
        }
    }

    private fun stopInternal() {
        Log.d(TAG, "stopInternal called – cancelling job")
        job?.cancel()
        job = null
    }

    private data class WearableSample(
        val userId: Int,
        val hrBpm: Int,
        val hrvRmssdMs: Double,
        val skinTempC: Double,
        val respRateBpm: Double,
        val spo2Pct: Double,
        val edaMicrosiemens: Double
    )

    private fun generateSample(time: LocalTime, config: WearableBaselineConfig, userId: Int): WearableSample {
        // Baseline means (midpoints)
        var hrMean = (config.restingHrMin + config.restingHrMax) / 2.0
        var hrvMean = (config.hrvRmssdMin + config.hrvRmssdMax) / 2.0
        var skinTempMean = (config.skinTempMin + config.skinTempMax) / 2.0
        var edaMean = (config.edaMin + config.edaMax) / 2.0

        // Time-of-day modulation based on configured ranges
        val isNight = isInTimeRange(
            time,
            config.sleepStartHour,
            config.sleepStartMinute,
            config.sleepEndHour,
            config.sleepEndMinute
        )
        val isWorkHours = isInTimeRange(
            time,
            config.workStartHour,
            config.workStartMinute,
            config.workEndHour,
            config.workEndMinute
        )
        val hour = time.hour
        val isPostLunch = hour in 13..15

        if (isNight) {
            // Lower HR, higher HRV at night (configurable offsets)
            hrMean += config.nightHrOffset
            hrvMean += config.nightHrvOffset
        } else if (isWorkHours) {
            // Slightly higher HR, slightly lower HRV (configurable offsets)
            hrMean += config.workHrOffset
            hrvMean += config.workHrvOffset
        }

        if (isPostLunch) {
            // Slight HR increase post-lunch
            hrMean += 3
        }

        // Occasional stress events (Poisson-like)
        if (stressTicksRemaining <= 0) {
            // Roughly 2 stress episodes per hour → probability per 5s tick ≈ 2 / (3600/5)
            val eventProbabilityPerTick = 2.0 / 720.0
            if (rng.nextDouble() < eventProbabilityPerTick) {
                stressTicksRemaining = 6 + rng.nextInt(12) // 30–90 segundos aprox. (6-18 ticks)
            }
        }

        if (stressTicksRemaining > 0) {
            // Apply stress: HR up, HRV down
            hrMean += 20
            hrvMean -= 15
            // Under stress, increase EDA baseline
            edaMean *= 1.6
            stressTicksRemaining--
        }

        // Add random noise (normal distribution)
        val hrWithNoise = normal(hrMean, 5.0)
        val hrvWithNoise = normal(hrvMean, 10.0)
        val skinWithNoise = normal(skinTempMean, 0.2)
        val edaStd = (config.edaMax - config.edaMin).coerceAtLeast(0.5) / 6.0
        val edaWithNoise = normal(edaMean, edaStd)

        // Clamp to physiological ranges and configured ranges
        val hrClamped = hrWithNoise.coerceIn(45.0, 140.0)
            .coerceIn(config.restingHrMin.toDouble(), config.restingHrMax.toDouble())
        val hrvClamped = hrvWithNoise.coerceIn(5.0, 200.0)
            .coerceIn(config.hrvRmssdMin.toDouble(), config.hrvRmssdMax.toDouble())
        val skinClamped = skinWithNoise.coerceIn(30.0, 38.0)
            .coerceIn(config.skinTempMin, config.skinTempMax)
        val edaClamped = edaWithNoise.coerceIn(config.edaMin, config.edaMax)

        val respRateMean = (config.respRateMin + config.respRateMax) / 2.0
        val respRate = normal(respRateMean, 1.0)
            .coerceIn(config.respRateMin.toDouble(), config.respRateMax.toDouble())

        val spo2Mean = (config.spo2Min + config.spo2Max) / 2.0
        val spo2 = normal(spo2Mean, 0.5)
            .coerceIn(config.spo2Min.toDouble(), config.spo2Max.toDouble())

        return WearableSample(
            userId = userId,
            hrBpm = hrClamped.toInt(),
            hrvRmssdMs = hrvClamped,
            skinTempC = skinClamped,
            respRateBpm = respRate,
            spo2Pct = spo2,
            edaMicrosiemens = edaClamped
        )
    }

    private fun publishSampleMetrics(sample: WearableSample) {
        val sleepSummary = lastSleepSummary
        val snapshot = HealthMetricSnapshot(
            timestamp = System.currentTimeMillis(),
            restingHeartRate = sample.hrBpm.toDouble(),
            hrvRmssd = sample.hrvRmssdMs,
            skinTemperature = sample.skinTempC,
            respirationRate = sample.respRateBpm,
            spo2 = sample.spo2Pct,
            eda = sample.edaMicrosiemens,
            totalSleepMinutes = sleepSummary?.totalSleepSeconds?.div(60.0),
            sleepEfficiency = sleepSummary?.efficiencyPct,
            sleepLatencyMinutes = sleepSummary?.sleepLatencySeconds?.div(60.0)
        )
        _healthMetricsFlow.value = snapshot

        recordMetric("resting_hr", sample.hrBpm.toDouble())
        recordMetric("hrv_rmssd", sample.hrvRmssdMs)
        recordMetric("skin_temp", sample.skinTempC)
        recordMetric("respiration", sample.respRateBpm)
        recordMetric("spo2", sample.spo2Pct)
        recordMetric("eda", sample.edaMicrosiemens)

        if (sleepSummary != null) {
            recordMetric("sleep_total", sleepSummary.totalSleepSeconds / 60.0)
            recordMetric("sleep_efficiency", sleepSummary.efficiencyPct)
            recordMetric("sleep_latency", sleepSummary.sleepLatencySeconds / 60.0)
        }
    }

    private fun recordMetric(key: String, value: Double) {
        val deque = metricHistoryMap.getOrPut(key) { ArrayDeque() }
        deque.addLast(MetricHistoryEntry(System.currentTimeMillis(), value))
        while (deque.size > 30) {
            deque.removeFirst()
        }
        metricHistoryMap[key] = deque
        _metricHistoryFlow.value = metricHistoryMap.mapValues { it.value.toList() }
    }

    private suspend fun preloadHistoricalData(userId: Int, accessToken: String?, refreshToken: String?) {
        if (accessToken.isNullOrBlank() || refreshToken.isNullOrBlank()) return
        val baseUrl = currentConfig.endpointBaseUrl.trimEnd('/')
        val url = "$baseUrl/api/biometric/history?user_id=$userId&window=30d&limit=30"
        val request = Request.Builder()
            .url(url)
            .get()
            .addHeader("Authorization", "Bearer $accessToken")
            .addHeader("X-Refresh-Token", refreshToken)
            .build()

        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "History fetch failed code=${response.code}")
                    return
                }
                val body = response.body?.string() ?: return
                val payload = JSONObject(body)

                val historyJson = payload.optJSONObject("history")
                if (historyJson != null) {
                    val parsedHistory = mutableMapOf<String, List<MetricHistoryEntry>>()
                    val keys = historyJson.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        val entries = parseHistoryArray(key, historyJson.optJSONArray(key))
                        if (entries.isNotEmpty()) {
                            parsedHistory[key] = entries
                        }
                    }
                    if (parsedHistory.isNotEmpty()) {
                        metricHistoryMap.clear()
                        parsedHistory.forEach { (metricKey, entries) ->
                            val deque = ArrayDeque<MetricHistoryEntry>()
                            entries.forEach { deque.addLast(it) }
                            metricHistoryMap[metricKey] = deque
                        }
                        _metricHistoryFlow.value = parsedHistory
                    }
                }

                val latestJson = payload.optJSONObject("latest")
                if (latestJson != null) {
                    val snapshot = HealthMetricSnapshot(
                        timestamp = parseIsoMillis(latestJson.optString("timestamp")),
                        restingHeartRate = normalizeMetricValue("resting_hr", latestJson.optDoubleOrNull("resting_hr")),
                        hrvRmssd = normalizeMetricValue("hrv_rmssd", latestJson.optDoubleOrNull("hrv_rmssd")),
                        skinTemperature = normalizeMetricValue("skin_temp", latestJson.optDoubleOrNull("skin_temp")),
                        respirationRate = normalizeMetricValue("respiration", latestJson.optDoubleOrNull("respiration")),
                        spo2 = normalizeMetricValue("spo2", latestJson.optDoubleOrNull("spo2")),
                        eda = normalizeMetricValue("eda", latestJson.optDoubleOrNull("eda")),
                        totalSleepMinutes = normalizeMetricValue("sleep_total", latestJson.optDoubleOrNull("sleep_total")),
                        sleepEfficiency = normalizeMetricValue("sleep_efficiency", latestJson.optDoubleOrNull("sleep_efficiency")),
                        sleepLatencyMinutes = normalizeMetricValue("sleep_latency", latestJson.optDoubleOrNull("sleep_latency"))
                    )
                    _healthMetricsFlow.value = snapshot
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error fetching biometric history: ${e.message}")
        }
    }

    private fun parseHistoryArray(metricKey: String, array: JSONArray?): List<MetricHistoryEntry> {
        if (array == null || array.length() == 0) return emptyList()
        val entries = mutableListOf<MetricHistoryEntry>()
        for (i in 0 until array.length()) {
            val obj = array.optJSONObject(i) ?: continue
            val rawValue = obj.optDoubleOrNull("value") ?: continue
            val normalized = normalizeMetricValue(metricKey, rawValue) ?: continue
            val timestamp = parseIsoMillis(obj.optString("timestamp"))
            entries.add(MetricHistoryEntry(timestamp, normalized))
        }
        return entries
    }

    private fun normalizeMetricValue(metricKey: String, rawValue: Double?): Double? {
        if (rawValue == null) return null
        return when (metricKey) {
            "sleep_total", "sleep_latency" -> rawValue / 60.0
            else -> rawValue
        }
    }

    private fun parseIsoMillis(value: String?): Long {
        if (value.isNullOrBlank()) return System.currentTimeMillis()
        return try {
            Instant.parse(value).toEpochMilli()
        } catch (_: Exception) {
            System.currentTimeMillis()
        }
    }

    private fun JSONObject.optDoubleOrNull(key: String): Double? =
        if (!has(key) || isNull(key)) null else runCatching { getDouble(key) }.getOrNull()

    private fun normal(mean: Double, stdDev: Double): Double {
        return mean + rng.nextGaussian() * stdDev
    }

    /**
     * Check if a given time is within a [start, end] range in minutes since midnight.
     * Supports ranges that cross midnight (e.g. 23:00–07:00).
     */
    private fun isInTimeRange(
        time: LocalTime,
        startHour: Int,
        startMinute: Int,
        endHour: Int,
        endMinute: Int
    ): Boolean {
        val t = time.hour * 60 + time.minute
        val start = (startHour.coerceIn(0, 23)) * 60 + startMinute.coerceIn(0, 59)
        val end = (endHour.coerceIn(0, 23)) * 60 + endMinute.coerceIn(0, 59)

        return if (start <= end) {
            t in start..end
        } else {
            // Range wraps past midnight (e.g. 23:00–07:00)
            t >= start || t <= end
        }
    }

    private data class SleepSummary(
        val userId: Int,
        val totalSleepSeconds: Int,
        val timeInBedSeconds: Int,
        val efficiencyPct: Double,
        val sleepLatencySeconds: Int
    )

    private fun maybeSendSleepSummary(
        config: WearableBaselineConfig,
        userId: Int,
        endpointBaseUrl: String,
        now: LocalTime
    ) {
        val today = LocalDate.now()
        // Simple rule: send once per day shortly after 7 AM
        if (now.hour == 7 && lastSleepSummaryDay != today) {
            val summary = generateSleepSummary(config, userId)
            sendSleepSummary(summary, endpointBaseUrl)
            lastSleepSummary = summary
            lastSleepSummaryDay = today
            recordMetric("sleep_total", summary.totalSleepSeconds / 60.0)
            recordMetric("sleep_efficiency", summary.efficiencyPct)
            recordMetric("sleep_latency", summary.sleepLatencySeconds / 60.0)
            lastSample?.let { publishSampleMetrics(it) }
        }
    }

    private fun generateSleepSummary(config: WearableBaselineConfig, userId: Int): SleepSummary {
        // Total sleep time in seconds
        val tstHours = uniform(config.sleepTstMinHours, config.sleepTstMaxHours)
        val totalSleepSeconds = (tstHours * 3600).toInt()

        // Sleep efficiency as percentage
        val efficiency = uniform(config.sleepEfficiencyMinPct, config.sleepEfficiencyMaxPct)

        // Sleep latency in seconds
        val latencyMinutes = uniform(config.sleepLatencyMinMinutes, config.sleepLatencyMaxMinutes)
        val sleepLatencySeconds = (latencyMinutes * 60).toInt()

        // Time in bed = total sleep + overhead
        val tibOverheadMinutes = uniform(config.sleepTibOverheadMinMinutes, config.sleepTibOverheadMaxMinutes)
        val timeInBedSeconds = totalSleepSeconds + (tibOverheadMinutes * 60).toInt()

        return SleepSummary(
            userId = userId,
            totalSleepSeconds = totalSleepSeconds,
            timeInBedSeconds = timeInBedSeconds,
            efficiencyPct = efficiency,
            sleepLatencySeconds = sleepLatencySeconds
        )
    }

    private fun uniform(min: Double, max: Double): Double {
        if (max <= min) return min
        return min + rng.nextDouble() * (max - min)
    }

    private fun sendSleepSummary(summary: SleepSummary, endpointBaseUrl: String) {
        val url = endpointBaseUrl.trimEnd('/') + "/api/biometric"

        val json = JSONObject().apply {
            put("user_id", summary.userId)
            put("device_id", "simulated_device")
            put("total_sleep_s", summary.totalSleepSeconds)
            put("time_in_bed_s", summary.timeInBedSeconds)
            put("sleep_efficiency_pct", summary.efficiencyPct)
            put("sleep_latency_s", summary.sleepLatencySeconds)
        }

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toString().toRequestBody(mediaType)
        val builder = Request.Builder()
            .url(url)
            .post(body)

        val access = currentAccessToken
        if (!access.isNullOrBlank()) {
            builder.addHeader("Authorization", "Bearer $access")
        }
        val refresh = currentRefreshToken
        if (!refresh.isNullOrBlank()) {
            builder.addHeader("X-Refresh-Token", refresh)
        }

        val request = builder.build()

        try {
            client.newCall(request).execute().use { /* ignore body */ }
        } catch (_: Exception) {
            // ignore in simulator
        }
    }

    private fun refreshTokensIfNeeded(): Boolean {
        val refresh = currentRefreshToken ?: run {
            Log.w(TAG, "No refresh token available; cannot refresh access token")
            return false
        }

        val url = CMS_BASE_URL.trimEnd('/') + "/auth/refresh"
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val json = JSONObject().apply {
            put("refreshToken", refresh)
        }
        val body = json.toString().toRequestBody(mediaType)
        val request = Request.Builder()
            .url(url)
            .post(body)
            .build()

        return try {
            Log.d(TAG, "Attempting token refresh via $url")
            client.newCall(request).execute().use { response ->
                val code = response.code
                val bodyStr = response.body?.string()
                Log.d(TAG, "Refresh response code=$code body=$bodyStr")

                if (!response.isSuccessful || bodyStr.isNullOrBlank()) {
                    return false
                }

                val obj = JSONObject(bodyStr)
                val newAccess = obj.optString("accessToken", "")
                val newRefresh = obj.optString("refreshToken", refresh)

                if (newAccess.isBlank()) {
                    Log.w(TAG, "Refresh response missing accessToken")
                    return false
                }

                currentAccessToken = newAccess
                currentRefreshToken = newRefresh
                Log.d(TAG, "Token refresh succeeded; new access token set")
                true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error refreshing token", e)
            false
        }
    }

    private fun sendSample(sample: WearableSample, endpointBaseUrl: String, allowRefresh: Boolean = true) {
        val url = endpointBaseUrl.trimEnd('/') + "/api/biometric"

        // Map sample to the biometric microservice schema
        val json = JSONObject().apply {
            put("user_id", sample.userId)
            put("device_id", "simulated_device")
            put("heart_rate", sample.hrBpm)
            put("hrv", sample.hrvRmssdMs)
            put("temperature", sample.skinTempC)
            put("resp_rate", sample.respRateBpm)
            put("spo2_pct", sample.spo2Pct)
            put("eda_microsiemens", sample.edaMicrosiemens)
        }

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toString().toRequestBody(mediaType)
        val builder = Request.Builder()
            .url(url)
            .post(body)

        val access = currentAccessToken
        if (!access.isNullOrBlank()) {
            builder.addHeader("Authorization", "Bearer $access")
        }
        val refresh = currentRefreshToken
        if (!refresh.isNullOrBlank()) {
            builder.addHeader("X-Refresh-Token", refresh)
        }

        val request = builder.build()

        try {
            Log.d(TAG, "Sending biometric sample to $url headersAuth=${!access.isNullOrBlank()} headersRefresh=${!refresh.isNullOrBlank()}")
            client.newCall(request).execute().use { response ->
                val code = response.code
                Log.d(TAG, "Biometric sample response code=$code")

                if (code == 401 && allowRefresh) {
                    // Try to refresh tokens once, then retry this sample
                    if (refreshTokensIfNeeded()) {
                        Log.d(TAG, "Retrying biometric sample after successful token refresh")
                        sendSample(sample, endpointBaseUrl, allowRefresh = false)
                    } else {
                        Log.w(TAG, "Token refresh failed; sample not retried")
                    }
                }
            }
        } catch (e: Exception) {
            // Log but don't crash the app
            Log.e(TAG, "Error sending biometric sample", e)
        }
    }
}


