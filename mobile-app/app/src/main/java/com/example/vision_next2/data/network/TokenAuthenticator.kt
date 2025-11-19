package com.example.vision_next2.data.network

import com.example.vision_next2.data.local.TokenStorage
import com.example.vision_next2.data.network.auth.AuthApi
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator(
    private val tokenStorage: TokenStorage,
    private val authApi: AuthApi
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        // Evitar bucles infinitos
        if (responseCount(response) >= 2) return null

        val refreshToken = tokenStorage.getRefreshToken() ?: return null

        return try {
            val refreshResponse = authApi.refresh("Bearer $refreshToken").execute()
            if (!refreshResponse.isSuccessful) {
                tokenStorage.clear()
                null
            } else {
                val body = refreshResponse.body() ?: return null
                val newAccess = body.accessToken
                val newRefresh = body.refreshToken ?: refreshToken
                tokenStorage.saveTokens(newAccess, newRefresh)

                // Reintentar la request original con el nuevo token
                response.request.newBuilder()
                    .header("Authorization", "Bearer $newAccess")
                    .build()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun responseCount(response: Response): Int {
        var result = 1
        var priorResponse = response.priorResponse
        while (priorResponse != null) {
            result++
            priorResponse = priorResponse.priorResponse
        }
        return result
    }
}
