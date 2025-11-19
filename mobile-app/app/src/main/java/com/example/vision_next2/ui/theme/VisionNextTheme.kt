package com.example.vision_next2.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    background = Slate950,
    surface = Slate900,
    primary = Blue500,
    secondary = Purple500,
    tertiary = Pink500,
    onBackground = Color.White,
    onSurface = Gray300
)

@Composable
fun VisionNextTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
