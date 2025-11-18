package com.example.vision_next2.data.network

import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.auth.AuthApi
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    fun create(baseUrl: String, tokenStorage: TokenStorage): AuthApi {
        // Retrofit sin interceptor para Authenticator (evita loops)
        val baseRetrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val authApi = baseRetrofit.create(AuthApi::class.java)

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenStorage))
            .authenticator(TokenAuthenticator(tokenStorage, authApi))
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(AuthApi::class.java)
    }
}
