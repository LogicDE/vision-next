package com.example.vision_next2.data.network

import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.auth.AuthApi
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {

    private const val BASE_URL = "http://34.10.72.6:8000" // 🔧 ajusta según tu backend

    fun provideRetrofit(tokenStorage: TokenStorage): Retrofit {
        val authApi = provideAuthApi(BASE_URL)

        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor(tokenStorage))
            .authenticator(TokenAuthenticator(tokenStorage, authApi))
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    private fun provideAuthApi(baseUrl: String): AuthApi {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

    fun provideAuthApiWithClient(tokenStorage: TokenStorage): AuthApi {
        return provideRetrofit(tokenStorage).create(AuthApi::class.java)
    }
}
