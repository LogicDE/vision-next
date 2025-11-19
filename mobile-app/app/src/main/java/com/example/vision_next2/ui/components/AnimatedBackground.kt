package com.example.vision_next2.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun VisionBackground() {
    // Gradient oscuro estilo dashboard web
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    listOf(
                        Color(0xFF020617),
                        Color(0xFF0A0E2E),
                        Color(0xFF1A0B3E)
                    )
                )
            )
    )

    // Glow azul difuso (blur tipo neon UI)
    Box(
        Modifier
            .fillMaxSize()
            .blur(90.dp)
            .background(
                Brush.radialGradient(
                    colors = listOf(Color(0xFF3B82F6).copy(alpha = 0.15f), Color.Transparent),
                    radius = 600f
                )
            )
    )
}
