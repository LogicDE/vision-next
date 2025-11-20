package com.example.vision_next2.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.vision_next2.data.network.auth.User
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import com.example.vision_next2.ui.viewmodel.LoginUiState

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onLoggedIn: (User?) -> Unit,
    onConfigureWearable: () -> Unit

) {
    val uiState by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Iniciar Sesión", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Correo") }
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation()
        )
        Spacer(Modifier.height(16.dp))
        Button(onClick = { viewModel.login(email, password) }) {
            Text("Entrar")
        }

        Spacer(Modifier.height(12.dp))

        // Botón para configurar el simulador de wearable
        TextButton(onClick = onConfigureWearable) {
            Text("Configure wearable")
        }

        Spacer(Modifier.height(8.dp))
        when (val state = uiState) {
            is LoginUiState.Loading -> CircularProgressIndicator()
            is LoginUiState.Error -> Text(
                "Error: ${state.message}",
                color = MaterialTheme.colorScheme.error
            )

            is LoginUiState.Success -> {
                LaunchedEffect(Unit) { onLoggedIn(state.user) }
            }

            else -> {}
        }
    }
}