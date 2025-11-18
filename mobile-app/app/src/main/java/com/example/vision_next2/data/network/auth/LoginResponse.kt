package com.example.vision_next2.data.network.auth

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: User
)
