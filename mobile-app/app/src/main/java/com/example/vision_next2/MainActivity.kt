package com.example.vision_next2

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.NetworkModule
import com.example.vision_next2.data.repository.AuthRepository
import com.example.vision_next2.ui.components.BottomNavigationBar
import com.example.vision_next2.ui.components.TopHeader
import com.example.vision_next2.ui.components.VisionBackground
import com.example.vision_next2.ui.screens.*
import com.example.vision_next2.ui.theme.VisionNextTheme
import com.example.vision_next2.ui.viewmodel.AuthViewModel
import com.example.vision_next2.ui.viewmodel.AuthViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val tokenStorage = TokenStorage(this)
        val authApi = NetworkModule.provideAuthApiWithClient(tokenStorage)
        val repo = AuthRepository(authApi, tokenStorage)
        val viewModel = AuthViewModelFactory(repo).create(AuthViewModel::class.java)

        setContent {
            VisionNextTheme {
                var isLoggedIn by remember { mutableStateOf(tokenStorage.getAccessToken() != null) }

                if (!isLoggedIn) {
                    LoginScreen(
                        viewModel = viewModel,
                        onLoggedIn = {
                            isLoggedIn = true
                        }
                    )
                } else {
                    MainScreen(
                        viewModel = viewModel,
                        onLogout = {
                            isLoggedIn = false
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
            NavHost(
                navController = navController,
                startDestination = "health",
                modifier = Modifier.padding(paddingValues)
            ) {
                composable("health") { HealthScreen() }
                composable("mental") { MentalScreen() }
                composable("ai") { AIScreen() }
                composable("alerts") { NotificationsPanelScreen() }

                // 🔴 Pantalla de Configuración con logout integrado
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
