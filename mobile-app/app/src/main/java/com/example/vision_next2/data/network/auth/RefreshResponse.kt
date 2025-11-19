package com.example.vision_next2.data.network.auth

data class RefreshResponse(
    val accessToken: String,
    val refreshToken: String?
)
