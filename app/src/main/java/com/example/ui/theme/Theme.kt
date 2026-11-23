package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val HeartShayriDarkColorScheme =
  darkColorScheme(
    primary = NeonCyan,
    onPrimary = PureBlack,
    secondary = NeonPink,
    onSecondary = TextWhite,
    background = PureBlack,
    onBackground = TextWhite,
    surface = DarkSurface,
    onSurface = TextWhite,
    onSurfaceVariant = TextMuted,
  )

@Composable
fun HeartShayriTheme(content: @Composable () -> Unit) {
  MaterialTheme(
    colorScheme = HeartShayriDarkColorScheme,
    typography = Typography,
    content = content,
  )
}
