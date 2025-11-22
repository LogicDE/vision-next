package com.example.vision_next2.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.dp
import com.example.vision_next2.data.simulator.HealthMetricSnapshot
import com.example.vision_next2.data.simulator.MetricHistoryEntry
import com.example.vision_next2.data.simulator.WearableSimulator
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.pow

@Composable
fun HealthScreen() {
    val metrics by WearableSimulator.healthMetrics().collectAsState(initial = null)
    val history by WearableSimulator.metricsHistory().collectAsState(initial = emptyMap())

    val metricDefinitions = remember {
        listOf(
            MetricDefinition(
                key = "resting_hr",
                title = "Frecuencia cardiaca en reposo",
                unit = "bpm",
                valueExtractor = { it.restingHeartRate }
            ),
            MetricDefinition(
                key = "hrv_rmssd",
                title = "HRV RMSSD",
                unit = "ms",
                valueExtractor = { it.hrvRmssd }
            ),
            MetricDefinition(
                key = "skin_temp",
                title = "Temperatura de la piel",
                unit = "°C",
                valueExtractor = { it.skinTemperature }
            ),
            MetricDefinition(
                key = "respiration",
                title = "Frecuencia respiratoria",
                unit = "rpm",
                valueExtractor = { it.respirationRate }
            ),
            MetricDefinition(
                key = "spo2",
                title = "SpO₂",
                unit = "%",
                valueExtractor = { it.spo2 }
            ),
            MetricDefinition(
                key = "eda",
                title = "EDA",
                unit = "µS",
                valueExtractor = { it.eda }
            ),
            MetricDefinition(
                key = "sleep_total",
                title = "Tiempo total de sueño",
                unit = "min",
                valueExtractor = { it.totalSleepMinutes }
            ),
            MetricDefinition(
                key = "sleep_efficiency",
                title = "Eficiencia del sueño",
                unit = "%",
                valueExtractor = { it.sleepEfficiency }
            ),
            MetricDefinition(
                key = "sleep_latency",
                title = "Latencia del sueño",
                unit = "min",
                valueExtractor = { it.sleepLatencyMinutes }
            )
        )
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background.copy(alpha = 0.98f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                text = "Panel de salud personal",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (metrics == null) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Aún no hay datos del wearable. Activa el simulador para comenzar a recibir métricas en tiempo real.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(horizontal = 24.dp)
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(metricDefinitions) { definition ->
                        MetricCard(
                            definition = definition,
                            snapshot = metrics,
                            historyPoints = history[definition.key].orEmpty()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricCard(
    definition: MetricDefinition,
    snapshot: HealthMetricSnapshot?,
    historyPoints: List<MetricHistoryEntry>
) {
    val currentValue = snapshot?.let { definition.valueExtractor(it) }
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.85f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = definition.title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = currentValue?.let { "${definition.format(it)} ${definition.unit}" } ?: "Sin datos",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(12.dp))
            SparklineChart(
                points = historyPoints,
                unitLabel = definition.unit,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
            )
        }
    }
}

@Composable
private fun SparklineChart(
    points: List<MetricHistoryEntry>,
    unitLabel: String,
    modifier: Modifier = Modifier,
    lineColor: Color = MaterialTheme.colorScheme.primary
) {
    if (points.isEmpty()) {
        Text(
            text = "Sin historial disponible",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        return
    }

    val sortedPoints = points.sortedBy { it.timestamp }
    val minVal = sortedPoints.minOf { it.value }
    val maxVal = sortedPoints.maxOf { it.value }
    val ticks = remember(minVal, maxVal) { generateTicks(minVal, maxVal) }
    val axisColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)

    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(90.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .padding(top = 4.dp, bottom = 4.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                ticks.reversed().forEach { value ->
                    Text(
                        text = value.toString(),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Canvas(
                modifier = modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                val range = max(0.1, maxVal - minVal)
                val stepX = if (sortedPoints.size <= 1) size.width else size.width / (sortedPoints.size - 1)

                // Y axis ticks
                ticks.forEach { tick ->
                    val ratio = if (range == 0.0) 0.0 else (tick - minVal) / range
                    val y = size.height - (ratio * size.height).toFloat()
                    drawLine(
                        color = axisColor.copy(alpha = 0.2f),
                        start = androidx.compose.ui.geometry.Offset(0f, y),
                        end = androidx.compose.ui.geometry.Offset(size.width, y),
                        strokeWidth = 1f
                    )
                }

                // Axes
                drawLine(
                    color = axisColor,
                    start = androidx.compose.ui.geometry.Offset(0f, 0f),
                    end = androidx.compose.ui.geometry.Offset(0f, size.height),
                    strokeWidth = 2f
                )
                drawLine(
                    color = axisColor,
                    start = androidx.compose.ui.geometry.Offset(0f, size.height),
                    end = androidx.compose.ui.geometry.Offset(size.width, size.height),
                    strokeWidth = 2f
                )

                val path = Path().apply {
                    sortedPoints.forEachIndexed { index, entry ->
                        val x = stepX * index
                        val ratio = if (range == 0.0) 0.5 else (entry.value - minVal) / range
                        val y = size.height - (ratio * size.height).toFloat()
                        if (index == 0) moveTo(x, y) else lineTo(x, y)
                    }
                }

                drawPath(
                    path = path,
                    color = lineColor,
                    style = androidx.compose.ui.graphics.drawscope.Stroke(width = 4f)
                )
            }
        }
        Spacer(modifier = Modifier.height(4.dp))

        val labelRange = remember(sortedPoints) {
            buildXAxisLabels(sortedPoints)
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            labelRange.forEach { label ->
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        Text(
            text = "Unidad: $unitLabel",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

private fun generateTicks(min: Double, max: Double, steps: Int = 4): List<Double> {
    if (max.isNaN() || min.isNaN()) return listOf(0.0)
    if (max == min) return listOf(min, min + 1)
    val range = max - min
    val rawStep = range / steps
    val magnitude = 10.0.pow(floor(ln(rawStep) / ln(10.0)))
    val normalized = rawStep / magnitude
    val niceNormalized = when {
        normalized < 1.5 -> 1.0
        normalized < 3 -> 2.0
        normalized < 7 -> 5.0
        else -> 10.0
    }
    val step = niceNormalized * magnitude
    val start = floor(min / step) * step
    val end = ceil(max / step) * step
    val ticks = mutableListOf<Double>()
    var value = start
    while (value <= end + 1e-6) {
        ticks.add(value)
        value += step
    }
    return if (ticks.isEmpty()) listOf(min, max) else ticks
}

private fun buildXAxisLabels(points: List<MetricHistoryEntry>): List<String> {
    val formatterShort = DateTimeFormatter.ofPattern("HH:mm")
    val formatterLong = DateTimeFormatter.ofPattern("dd MMM")
    val start = points.first().timestamp
    val end = points.last().timestamp
    val duration = end - start
    val mid = start + duration / 2
    val formatter = when {
        duration < 3_600_000 -> formatterShort
        duration < 86_400_000 -> formatterShort
        else -> formatterLong
    }
    val labels = listOf(start, mid, end).distinct()
    return labels.map { ts ->
        try {
            Instant.ofEpochMilli(ts).atZone(ZoneId.systemDefault()).format(formatter)
        } catch (_: Exception) {
            ""
        }
    }.ifEmpty { listOf("") }
}

private data class MetricDefinition(
    val key: String,
    val title: String,
    val unit: String,
    val valueExtractor: (HealthMetricSnapshot) -> Double?,
    val formatter: (Double) -> String = { value -> "%.1f".format(value) }
) {
    fun format(value: Double) = formatter(value)
}
