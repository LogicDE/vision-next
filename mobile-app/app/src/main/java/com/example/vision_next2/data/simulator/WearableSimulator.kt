package com.example.vision_next2.data.simulator

import android.util.Log
import kotlinx.coroutines.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.time.LocalDate
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
        startIfReady()
    }

    fun onUserLoggedOut() {
        currentUserId = null
        currentAccessToken = null
        currentRefreshToken = null
        Log.d(TAG, "onUserLoggedOut – stopping simulator")
        stopInternal()
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
                Log.d(TAG, "Loop tick at $now, sending sample: $sample")
                sendSample(sample, config.endpointBaseUrl)
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
                stressTicksRemaining = rng.nextInt(6, 18) // 30–90 seconds at 5s per tick
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
            lastSleepSummaryDay = today
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


