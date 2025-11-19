package com.example.vision_next2.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NotificationsPanelScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Alertas y Notificaciones", fontSize = 24.sp)
        Spacer(modifier = Modifier.height(16.dp))

        val notifications = listOf(
            "Recordatorio: Toma tu medicación",
            "Nuevo análisis disponible",
            "Actividad física recomendada",
            "Revisión de salud mental"
        )

        notifications.forEach { notification ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE0F2FE))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp)
                ) {
                    Text(notification, fontSize = 14.sp, color = Color(0xFF1E3A8A))
                }
            }
        }
    }
}
