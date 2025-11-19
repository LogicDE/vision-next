package com.example.vision_next2.data.local

import android.content.Context
import com.example.vision_next2.data.simulator.WearableBaselineConfig

class SimulatorStorage(context: Context) {

    private val prefs = context.getSharedPreferences("simulator_prefs", Context.MODE_PRIVATE)

    fun saveConfig(config: WearableBaselineConfig, isActive: Boolean) {
        prefs.edit()
            .putInt("restingHrMin", config.restingHrMin)
            .putInt("restingHrMax", config.restingHrMax)
            .putInt("hrvRmssdMin", config.hrvRmssdMin)
            .putInt("hrvRmssdMax", config.hrvRmssdMax)
            .putFloat("skinTempMin", config.skinTempMin.toFloat())
            .putFloat("skinTempMax", config.skinTempMax.toFloat())
            .putInt("respRateMin", config.respRateMin)
            .putInt("respRateMax", config.respRateMax)
            .putInt("spo2Min", config.spo2Min)
            .putInt("spo2Max", config.spo2Max)
            .putFloat("edaMin", config.edaMin.toFloat())
            .putFloat("edaMax", config.edaMax.toFloat())
            .putFloat("sleepTstMinHours", config.sleepTstMinHours.toFloat())
            .putFloat("sleepTstMaxHours", config.sleepTstMaxHours.toFloat())
            .putFloat("sleepLatencyMinMinutes", config.sleepLatencyMinMinutes.toFloat())
            .putFloat("sleepLatencyMaxMinutes", config.sleepLatencyMaxMinutes.toFloat())
            .putFloat("sleepEfficiencyMinPct", config.sleepEfficiencyMinPct.toFloat())
            .putFloat("sleepEfficiencyMaxPct", config.sleepEfficiencyMaxPct.toFloat())
            .putFloat("sleepTibOverheadMinMinutes", config.sleepTibOverheadMinMinutes.toFloat())
            .putFloat("sleepTibOverheadMaxMinutes", config.sleepTibOverheadMaxMinutes.toFloat())
            .putFloat("nightHrOffset", config.nightHrOffset.toFloat())
            .putFloat("nightHrvOffset", config.nightHrvOffset.toFloat())
            .putFloat("workHrOffset", config.workHrOffset.toFloat())
            .putFloat("workHrvOffset", config.workHrvOffset.toFloat())
            .putInt("sleepStartHour", config.sleepStartHour)
            .putInt("sleepStartMinute", config.sleepStartMinute)
            .putInt("sleepEndHour", config.sleepEndHour)
            .putInt("sleepEndMinute", config.sleepEndMinute)
            .putInt("workStartHour", config.workStartHour)
            .putInt("workStartMinute", config.workStartMinute)
            .putInt("workEndHour", config.workEndHour)
            .putInt("workEndMinute", config.workEndMinute)
            .putString("endpointBaseUrl", config.endpointBaseUrl)
            .putBoolean("isActive", isActive)
            .apply()
    }

    fun loadConfig(): Pair<WearableBaselineConfig, Boolean> {
        val cfg = WearableBaselineConfig(
            restingHrMin = prefs.getInt("restingHrMin", 55),
            restingHrMax = prefs.getInt("restingHrMax", 75),
            hrvRmssdMin = prefs.getInt("hrvRmssdMin", 20),
            hrvRmssdMax = prefs.getInt("hrvRmssdMax", 80),
            skinTempMin = prefs.getFloat("skinTempMin", 32.0f).toDouble(),
            skinTempMax = prefs.getFloat("skinTempMax", 35.0f).toDouble(),
            respRateMin = prefs.getInt("respRateMin", 10),
            respRateMax = prefs.getInt("respRateMax", 18),
            spo2Min = prefs.getInt("spo2Min", 96),
            spo2Max = prefs.getInt("spo2Max", 99),
            edaMin = prefs.getFloat("edaMin", 0.1f).toDouble(),
            edaMax = prefs.getFloat("edaMax", 5.0f).toDouble(),
            sleepTstMinHours = prefs.getFloat("sleepTstMinHours", 6.0f).toDouble(),
            sleepTstMaxHours = prefs.getFloat("sleepTstMaxHours", 9.0f).toDouble(),
            sleepLatencyMinMinutes = prefs.getFloat("sleepLatencyMinMinutes", 5.0f).toDouble(),
            sleepLatencyMaxMinutes = prefs.getFloat("sleepLatencyMaxMinutes", 45.0f).toDouble(),
            sleepEfficiencyMinPct = prefs.getFloat("sleepEfficiencyMinPct", 75.0f).toDouble(),
            sleepEfficiencyMaxPct = prefs.getFloat("sleepEfficiencyMaxPct", 95.0f).toDouble(),
            sleepTibOverheadMinMinutes = prefs.getFloat("sleepTibOverheadMinMinutes", 10.0f).toDouble(),
            sleepTibOverheadMaxMinutes = prefs.getFloat("sleepTibOverheadMaxMinutes", 60.0f).toDouble(),
            nightHrOffset = prefs.getFloat("nightHrOffset", -5.0f).toDouble(),
            nightHrvOffset = prefs.getFloat("nightHrvOffset", 10.0f).toDouble(),
            workHrOffset = prefs.getFloat("workHrOffset", 5.0f).toDouble(),
            workHrvOffset = prefs.getFloat("workHrvOffset", -5.0f).toDouble(),
            sleepStartHour = prefs.getInt("sleepStartHour", 23),
            sleepStartMinute = prefs.getInt("sleepStartMinute", 0),
            sleepEndHour = prefs.getInt("sleepEndHour", 7),
            sleepEndMinute = prefs.getInt("sleepEndMinute", 0),
            workStartHour = prefs.getInt("workStartHour", 9),
            workStartMinute = prefs.getInt("workStartMinute", 0),
            workEndHour = prefs.getInt("workEndHour", 17),
            workEndMinute = prefs.getInt("workEndMinute", 0),
            endpointBaseUrl = prefs.getString("endpointBaseUrl", "http://10.0.2.2:9000") ?: "http://10.0.2.2:9000"
        )

        val active = prefs.getBoolean("isActive", false)
        return cfg to active
    }
}


