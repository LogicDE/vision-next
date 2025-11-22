package com.example.vision_next2.data.network.auth

data class ProfileResponse(
    val id: Int,
    val nombre: String,
    val email: String,
    val rol: String,
    val firstName: String?,
    val lastName: String?,
    val username: String?,
    val telephone: String?,
    val status: String?,
    val enterprise: EnterpriseSummary?
)

data class EnterpriseSummary(
    val id: Int?,
    val name: String?
)

