package com.example.vision_next2.data.network.auth

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST


interface AuthApi {

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse

    @POST("/auth/refresh")
    fun refresh(
        @Header("Authorization") refreshHeader: String
    ):Call<RefreshResponse>

}