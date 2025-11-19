package com.example.vision_next2.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import com.example.vision_next2.data.local.SimulatorStorage
import com.example.vision_next2.data.simulator.WearableBaselineConfig
import com.example.vision_next2.data.simulator.WearableSimulator

@Composable
fun WearableConfigScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val strongTextColor = Color(0xFF111111)
    val fieldTextStyle = TextStyle(color = strongTextColor)

    // Load persisted configuration (or defaults) once
    val storage = remember { SimulatorStorage(context) }
    val (initialConfig, initialActive) = remember { storage.loadConfig() }

    var isActive by remember { mutableStateOf(initialActive) }
    var restingHrMin by remember { mutableStateOf(initialConfig.restingHrMin.toString()) }
    var restingHrMax by remember { mutableStateOf(initialConfig.restingHrMax.toString()) }
    var hrvMin by remember { mutableStateOf(initialConfig.hrvRmssdMin.toString()) }
    var hrvMax by remember { mutableStateOf(initialConfig.hrvRmssdMax.toString()) }
    var tempMin by remember { mutableStateOf(initialConfig.skinTempMin.toString()) }
    var tempMax by remember { mutableStateOf(initialConfig.skinTempMax.toString()) }
    var respMin by remember { mutableStateOf(initialConfig.respRateMin.toString()) }
    var respMax by remember { mutableStateOf(initialConfig.respRateMax.toString()) }
    var spo2Min by remember { mutableStateOf(initialConfig.spo2Min.toString()) }
    var spo2Max by remember { mutableStateOf(initialConfig.spo2Max.toString()) }
    var edaMin by remember { mutableStateOf(initialConfig.edaMin.toString()) }
    var edaMax by remember { mutableStateOf(initialConfig.edaMax.toString()) }

    // Sleep summary baselines
    var tstMinHours by remember { mutableStateOf(initialConfig.sleepTstMinHours.toString()) }
    var tstMaxHours by remember { mutableStateOf(initialConfig.sleepTstMaxHours.toString()) }
    var sleepEffMin by remember { mutableStateOf(initialConfig.sleepEfficiencyMinPct.toString()) }
    var sleepEffMax by remember { mutableStateOf(initialConfig.sleepEfficiencyMaxPct.toString()) }
    var sleepLatMin by remember { mutableStateOf(initialConfig.sleepLatencyMinMinutes.toString()) }    // minutes
    var sleepLatMax by remember { mutableStateOf(initialConfig.sleepLatencyMaxMinutes.toString()) }
    var tibOverMin by remember { mutableStateOf(initialConfig.sleepTibOverheadMinMinutes.toString()) }    // minutes
    var tibOverMax by remember { mutableStateOf(initialConfig.sleepTibOverheadMaxMinutes.toString()) }

    // Time-of-day modulation offsets
    var nightHrOffset by remember { mutableStateOf(initialConfig.nightHrOffset.toString()) }
    var nightHrvOffset by remember { mutableStateOf(initialConfig.nightHrvOffset.toString()) }
    var workHrOffset by remember { mutableStateOf(initialConfig.workHrOffset.toString()) }
    var workHrvOffset by remember { mutableStateOf(initialConfig.workHrvOffset.toString()) }

    // Time ranges
    var sleepStart by remember { mutableStateOf("%02d:%02d".format(initialConfig.sleepStartHour, initialConfig.sleepStartMinute)) }
    var sleepEnd by remember { mutableStateOf("%02d:%02d".format(initialConfig.sleepEndHour, initialConfig.sleepEndMinute)) }
    var workStart by remember { mutableStateOf("%02d:%02d".format(initialConfig.workStartHour, initialConfig.workStartMinute)) }
    var workEnd by remember { mutableStateOf("%02d:%02d".format(initialConfig.workEndHour, initialConfig.workEndMinute)) }

    var endpoint by remember { mutableStateOf(initialConfig.endpointBaseUrl) }

    // Helper to parse times like "23:00" into hour/minute, with safe fallbacks
    fun parseTime(value: String, defaultHour: Int, defaultMinute: Int): Pair<Int, Int> {
        return try {
            val parts = value.trim().split(":")
            val h = parts.getOrNull(0)?.toIntOrNull() ?: defaultHour
            val m = parts.getOrNull(1)?.toIntOrNull() ?: defaultMinute
            h.coerceIn(0, 23) to m.coerceIn(0, 59)
        } catch (_: Exception) {
            defaultHour to defaultMinute
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Text("Configure wearable simulator")
        Spacer(Modifier.height(16.dp))

        Text("Resting heart rate (bpm)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = restingHrMin,
                onValueChange = { restingHrMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = restingHrMax,
                onValueChange = { restingHrMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(12.dp))
        Text("HRV RMSSD (ms)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = hrvMin,
                onValueChange = { hrvMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = hrvMax,
                onValueChange = { hrvMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(12.dp))
        Text("Skin temperature (°C)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = tempMin,
                onValueChange = { tempMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = tempMax,
                onValueChange = { tempMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(12.dp))
        Text("Respiration rate (breaths/min)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = respMin,
                onValueChange = { respMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = respMax,
                onValueChange = { respMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(12.dp))
        Text("SpO₂ (%)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = spo2Min,
                onValueChange = { spo2Min = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = spo2Max,
                onValueChange = { spo2Max = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(16.dp))
        Text("Endpoint base URL")
        Spacer(Modifier.height(4.dp))
        OutlinedTextField(
            value = endpoint,
            onValueChange = { endpoint = it },
            label = { Text("Biometric microservice URL", color = strongTextColor) },
            textStyle = fieldTextStyle,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))
        Text("EDA baseline (µS)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = edaMin,
                onValueChange = { edaMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = edaMax,
                onValueChange = { edaMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(16.dp))
        Text("Sleep summary baselines")
        Spacer(Modifier.height(4.dp))
        Text(
            "These values shape nightly summaries (TST, TIB, efficiency, latency).",
            style = MaterialTheme.typography.bodySmall,
            color = strongTextColor
        )
        Spacer(Modifier.height(4.dp))
        Text("Total Sleep Time (hours)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = tstMinHours,
                onValueChange = { tstMinHours = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = tstMaxHours,
                onValueChange = { tstMaxHours = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(8.dp))
        Text("Sleep efficiency (%)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = sleepEffMin,
                onValueChange = { sleepEffMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = sleepEffMax,
                onValueChange = { sleepEffMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(8.dp))
        Text("Sleep latency (minutes)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = sleepLatMin,
                onValueChange = { sleepLatMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = sleepLatMax,
                onValueChange = { sleepLatMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(8.dp))
        Text("Time-in-bed overhead (minutes)")
        Spacer(Modifier.height(4.dp))
        Text(
            "Extra minutes in bed beyond TST that increase time-in-bed.",
            style = MaterialTheme.typography.bodySmall,
            color = strongTextColor
        )
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = tibOverMin,
                onValueChange = { tibOverMin = it },
                label = { Text("Min", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = tibOverMax,
                onValueChange = { tibOverMax = it },
                label = { Text("Max", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(16.dp))
        Text("Working / sleep hour offsets")
        Spacer(Modifier.height(4.dp))
        Text(
            "Night offsets (applied on heart rate / HRV during configured sleep hours).",
            style = MaterialTheme.typography.bodySmall,
            color = strongTextColor
        )
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = nightHrOffset,
                onValueChange = { nightHrOffset = it },
                label = { Text("HR Δ", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = nightHrvOffset,
                onValueChange = { nightHrvOffset = it },
                label = { Text("HRV Δ", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(8.dp))
        Text(
            "Work-hour offsets (applied on heart rate / HRV during configured working hours).",
            style = MaterialTheme.typography.bodySmall,
            color = strongTextColor
        )
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = workHrOffset,
                onValueChange = { workHrOffset = it },
                label = { Text("HR Δ", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = workHrvOffset,
                onValueChange = { workHrvOffset = it },
                label = { Text("HRV Δ", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(24.dp))
        Text("Sleep / work time ranges")
        Spacer(Modifier.height(4.dp))
        Text(
            "Define when the person is sleeping vs working (24h format HH:MM).",
            style = MaterialTheme.typography.bodySmall,
            color = strongTextColor
        )
        Spacer(Modifier.height(4.dp))
        Text("Sleep range (start / end)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = sleepStart,
                onValueChange = { sleepStart = it },
                label = { Text("Sleep start (e.g. 23:00)", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = sleepEnd,
                onValueChange = { sleepEnd = it },
                label = { Text("Sleep end (e.g. 07:00)", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(8.dp))
        Text("Work range (start / end)")
        Spacer(Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = workStart,
                onValueChange = { workStart = it },
                label = { Text("Work start (e.g. 09:00)", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = workEnd,
                onValueChange = { workEnd = it },
                label = { Text("Work end (e.g. 17:00)", color = strongTextColor) },
                textStyle = fieldTextStyle,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = {
                val (sleepStartH, sleepStartM) = parseTime(sleepStart, 23, 0)
                val (sleepEndH, sleepEndM) = parseTime(sleepEnd, 7, 0)
                val (workStartH, workStartM) = parseTime(workStart, 9, 0)
                val (workEndH, workEndM) = parseTime(workEnd, 17, 0)

                val config = WearableBaselineConfig(
                    restingHrMin = restingHrMin.toIntOrNull() ?: 55,
                    restingHrMax = restingHrMax.toIntOrNull() ?: 75,
                    hrvRmssdMin = hrvMin.toIntOrNull() ?: 20,
                    hrvRmssdMax = hrvMax.toIntOrNull() ?: 80,
                    skinTempMin = tempMin.toDoubleOrNull() ?: 32.0,
                    skinTempMax = tempMax.toDoubleOrNull() ?: 35.0,
                    respRateMin = respMin.toIntOrNull() ?: 10,
                    respRateMax = respMax.toIntOrNull() ?: 18,
                    spo2Min = spo2Min.toIntOrNull() ?: 96,
                    spo2Max = spo2Max.toIntOrNull() ?: 99,
                    edaMin = edaMin.toDoubleOrNull() ?: 0.1,
                    edaMax = edaMax.toDoubleOrNull() ?: 5.0,
                    sleepTstMinHours = tstMinHours.toDoubleOrNull() ?: 6.0,
                    sleepTstMaxHours = tstMaxHours.toDoubleOrNull() ?: 9.0,
                    sleepLatencyMinMinutes = sleepLatMin.toDoubleOrNull() ?: 5.0,
                    sleepLatencyMaxMinutes = sleepLatMax.toDoubleOrNull() ?: 45.0,
                    sleepEfficiencyMinPct = sleepEffMin.toDoubleOrNull() ?: 75.0,
                    sleepEfficiencyMaxPct = sleepEffMax.toDoubleOrNull() ?: 95.0,
                    sleepTibOverheadMinMinutes = tibOverMin.toDoubleOrNull() ?: 10.0,
                    sleepTibOverheadMaxMinutes = tibOverMax.toDoubleOrNull() ?: 60.0,
                    nightHrOffset = nightHrOffset.toDoubleOrNull() ?: -5.0,
                    nightHrvOffset = nightHrvOffset.toDoubleOrNull() ?: 10.0,
                    workHrOffset = workHrOffset.toDoubleOrNull() ?: 5.0,
                    workHrvOffset = workHrvOffset.toDoubleOrNull() ?: -5.0,
                    sleepStartHour = sleepStartH,
                    sleepStartMinute = sleepStartM,
                    sleepEndHour = sleepEndH,
                    sleepEndMinute = sleepEndM,
                    workStartHour = workStartH,
                    workStartMinute = workStartM,
                    workEndHour = workEndH,
                    workEndMinute = workEndM,
                    endpointBaseUrl = endpoint.ifBlank { "http://10.0.2.2:9000" }
                )
                WearableSimulator.updateConfig(config)
                storage.saveConfig(config, isActive)
                Toast.makeText(context, "Configuration Set", Toast.LENGTH_SHORT).show()
            }) {
                Text("Save configuration")
            }

            Button(onClick = {
                val newActive = !isActive
                WearableSimulator.setActiveFlag(newActive)
                isActive = newActive
                // Persist latest config + active flag
                val (sleepStartH, sleepStartM) = parseTime(sleepStart, 23, 0)
                val (sleepEndH, sleepEndM) = parseTime(sleepEnd, 7, 0)
                val (workStartH, workStartM) = parseTime(workStart, 9, 0)
                val (workEndH, workEndM) = parseTime(workEnd, 17, 0)

                val currentConfig = WearableBaselineConfig(
                    restingHrMin = restingHrMin.toIntOrNull() ?: 55,
                    restingHrMax = restingHrMax.toIntOrNull() ?: 75,
                    hrvRmssdMin = hrvMin.toIntOrNull() ?: 20,
                    hrvRmssdMax = hrvMax.toIntOrNull() ?: 80,
                    skinTempMin = tempMin.toDoubleOrNull() ?: 32.0,
                    skinTempMax = tempMax.toDoubleOrNull() ?: 35.0,
                    respRateMin = respMin.toIntOrNull() ?: 10,
                    respRateMax = respMax.toIntOrNull() ?: 18,
                    spo2Min = spo2Min.toIntOrNull() ?: 96,
                    spo2Max = spo2Max.toIntOrNull() ?: 99,
                    edaMin = edaMin.toDoubleOrNull() ?: 0.1,
                    edaMax = edaMax.toDoubleOrNull() ?: 5.0,
                    sleepTstMinHours = tstMinHours.toDoubleOrNull() ?: 6.0,
                    sleepTstMaxHours = tstMaxHours.toDoubleOrNull() ?: 9.0,
                    sleepLatencyMinMinutes = sleepLatMin.toDoubleOrNull() ?: 5.0,
                    sleepLatencyMaxMinutes = sleepLatMax.toDoubleOrNull() ?: 45.0,
                    sleepEfficiencyMinPct = sleepEffMin.toDoubleOrNull() ?: 75.0,
                    sleepEfficiencyMaxPct = sleepEffMax.toDoubleOrNull() ?: 95.0,
                    sleepTibOverheadMinMinutes = tibOverMin.toDoubleOrNull() ?: 10.0,
                    sleepTibOverheadMaxMinutes = tibOverMax.toDoubleOrNull() ?: 60.0,
                    nightHrOffset = nightHrOffset.toDoubleOrNull() ?: -5.0,
                    nightHrvOffset = nightHrvOffset.toDoubleOrNull() ?: 10.0,
                    workHrOffset = workHrOffset.toDoubleOrNull() ?: 5.0,
                    workHrvOffset = workHrvOffset.toDoubleOrNull() ?: -5.0,
                    sleepStartHour = sleepStartH,
                    sleepStartMinute = sleepStartM,
                    sleepEndHour = sleepEndH,
                    sleepEndMinute = sleepEndM,
                    workStartHour = workStartH,
                    workStartMinute = workStartM,
                    workEndHour = workEndH,
                    workEndMinute = workEndM,
                    endpointBaseUrl = endpoint.ifBlank { "http://10.0.2.2:9000" }
                )
                storage.saveConfig(currentConfig, newActive)

                val msg = if (newActive) "Activate" else "Deactivate"
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            }) {
                Text(if (isActive) "Deactivate" else "Activate")
            }
        }

        Spacer(Modifier.height(16.dp))
        TextButton(onClick = onBack) {
            Text("Back to login")
        }
    }
}


