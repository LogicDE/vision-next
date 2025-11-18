package com.example.vision_next2.ui.components

import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Text

@Composable
fun BottomNavigationBar(navController: NavController) {
    BottomAppBar {
        NavigationBarItem(
            selected = false,
            onClick = { navController.navigate("health") },
            icon = { Icon(Icons.Default.Favorite, contentDescription = null) },
            label = { Text("Salud") }
        )
        NavigationBarItem(
            selected = false,
            onClick = { navController.navigate("mental") },
            icon = { Icon(Icons.Default.Home, contentDescription = null) }, // reemplaza Brain
            label = { Text("Mental") }
        )
        NavigationBarItem(
            selected = false,
            onClick = { navController.navigate("ai") },
            icon = { Icon(Icons.Default.Info, contentDescription = null) }, // reemplaza Lightbulb
            label = { Text("IA") }
        )
        NavigationBarItem(
            selected = false,
            onClick = { navController.navigate("alerts") },
            icon = { Icon(Icons.Default.Notifications, contentDescription = null) },
            label = { Text("Alertas") }
        )
        NavigationBarItem(
            selected = false,
            onClick = { navController.navigate("settings") },
            icon = { Icon(Icons.Default.Settings, contentDescription = null) },
            label = { Text("Config") }
        )
    }
}
