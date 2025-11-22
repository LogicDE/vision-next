package com.example.vision_next2

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.local.SimulatorStorage
import com.example.vision_next2.data.network.NetworkModule
import com.example.vision_next2.data.repository.AuthRepository
import com.example.vision_next2.data.simulator.WearableSimulator
import com.example.vision_next2.ui.components.BottomNavigationBar
import com.example.vision_next2.ui.components.TopHeader
import com.example.vision_next2.ui.components.VisionBackground
import com.example.vision_next2.ui.screens.*
import com.example.vision_next2.ui.theme.VisionNextTheme
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import com.example.vision_next2.ui.viewmodel.AuthViewModelFactory
import com.example.vision_next2.notifications.EventPollingWorker
import com.example.vision_next2.notifications.EventNotificationManager

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val tokenStorage = TokenStorage(this)
        val authApi = NetworkModule.provideAuthApiWithClient(tokenStorage)
        val repo = AuthRepository(authApi, tokenStorage)
        val viewModel = AuthViewModelFactory(repo).create(AuthViewModel::class.java)

        // Load persisted simulator configuration and active flag once at startup
        val simulatorStorage = SimulatorStorage(this)
        val (initialSimulatorConfig, initialSimulatorActive) = simulatorStorage.loadConfig()
        WearableSimulator.updateConfig(initialSimulatorConfig)
        WearableSimulator.setActiveFlag(initialSimulatorActive)
        
        // Inicializar canal de notificaciones
        EventNotificationManager.initializeNotificationChannel(this)

        setContent {
            VisionNextTheme {
                // Always start in logged-out state on fresh app start; user must log in again
                var isLoggedIn by rememberSaveable { mutableStateOf(false) }
                var showWearableConfig by rememberSaveable { mutableStateOf(false) }
                var currentUserEmail by rememberSaveable { mutableStateOf<String?>(null) }

                if (!isLoggedIn) {
                    if (showWearableConfig) {
                        WearableConfigScreen(
                            onBack = { showWearableConfig = false }
                        )
                    } else {
                        LoginScreen(
                            viewModel = viewModel,
                            onLoggedIn = { user ->
                                currentUserEmail = user?.email
                                isLoggedIn = true
                                val accessToken = tokenStorage.getAccessToken()
                                val refreshToken = tokenStorage.getRefreshToken()
                                WearableSimulator.onUserLoggedIn(user?.id, accessToken, refreshToken)
                                // Iniciar polling de eventos cuando el usuario inicia sesión
                                EventPollingWorker.startPeriodicPolling(this@MainActivity)
                            },
                            onConfigureWearable = {
                                showWearableConfig = true
                            }
                        )
                    }

                } else {
                    MainScreen(
                        viewModel = viewModel,
                        onLogout = {
                            isLoggedIn = false
                            currentUserEmail = null
                            WearableSimulator.onUserLoggedOut()
                            // Detener polling de eventos cuando el usuario cierra sesión
                            EventPollingWorker.stopPeriodicPolling(this@MainActivity)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun MainScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val navController = rememberNavController()

    androidx.compose.foundation.layout.Box {
        VisionBackground() // 👈 Fondo futurista

        Scaffold(
            topBar = { TopHeader(userName = "Carlos") },
            bottomBar = { BottomNavigationBar(navController = navController) }
        ) { paddingValues ->
            LaunchedEffect(Unit) {
                viewModel.loadProfile()
            }
            NavHost(
                navController = navController,
                startDestination = "health",
                modifier = Modifier.padding(paddingValues)
            ) {
                composable("health") { HealthScreen() }
                composable("surveys") { SurveysScreen(viewModel) }
                composable("events") { EventsScreen(viewModel) }
                composable("interventions") { InterventionsScreen(viewModel) }

                // Pantalla de Configuración con logout integrado
                composable("settings") {
                    UserSettingsScreen(
                        viewModel = viewModel,
                        onLogout = onLogout
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewMainScreen() {
    // Para preview, usamos placeholders
    // (no pasa el viewModel real aquí)
    MainScreen(
        viewModel = AuthViewModelFactory(
            AuthRepository(
                authApi = NetworkModule.provideAuthApiWithClient(TokenStorage(androidx.compose.ui.platform.LocalContext.current)),
                tokenStorage = TokenStorage(androidx.compose.ui.platform.LocalContext.current)
            )
        ).create(AuthViewModel::class.java),
        onLogout = {}
    )
}
