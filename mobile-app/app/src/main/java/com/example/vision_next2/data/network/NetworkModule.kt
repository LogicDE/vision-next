package com.example.vision_next2.data.network

import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.auth.AuthApi
import com.example.vision_next2.data.network.employee.EmployeeApi
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    // Base URL of the CMS backend that the mobile app talks to.
    // When running the backend locally with docker-compose and using the Android emulator,
    // the host machine is reachable at 10.0.2.2.
    private const val BASE_URL = "http://10.0.2.2:8000/"  // was http://34.10.72.6:8000

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

    private fun provideAuthApi(baseUrl: String): AuthApi =
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)

    fun provideAuthApiWithClient(tokenStorage: TokenStorage): AuthApi {
        return provideRetrofit(tokenStorage).create(AuthApi::class.java)
    }

    fun provideEmployeeApi(tokenStorage: TokenStorage): EmployeeApi {
        return provideRetrofit(tokenStorage).create(EmployeeApi::class.java)
    }
}
