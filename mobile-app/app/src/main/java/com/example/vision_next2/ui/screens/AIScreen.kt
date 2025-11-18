package com.example.vision_next2.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AIScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Asistente de IA", fontSize = 24.sp)
        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Interacción con IA", fontSize = 18.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Pregúntale algo a tu asistente inteligente y obtén recomendaciones sobre tu salud y estado mental.", fontSize = 14.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = { /* acción de IA */ }) {
            Text("Iniciar Conversación")
        }
    }
}
