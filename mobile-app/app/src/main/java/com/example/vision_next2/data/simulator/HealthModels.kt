package com.example.vision_next2.data.simulator

data class HealthMetricSnapshot(
    val timestamp: Long,
    val restingHeartRate: Double?,
    val hrvRmssd: Double?,
    val skinTemperature: Double?,
    val respirationRate: Double?,
    val spo2: Double?,
    val eda: Double?,
    val totalSleepMinutes: Double?,
    val sleepEfficiency: Double?,
    val sleepLatencyMinutes: Double?
)

data class MetricHistoryEntry(
    val timestamp: Long,
    val value: Double
)

