package com.example.vision_next2.data.repository

import com.example.vision_next2.data.network.auth.AuthApi
import com.example.vision_next2.data.network.auth.LoginRequest
import com.example.vision_next2.data.network.auth.LoginResponse
import com.example.vision_next2.data.local.TokenStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException

class AuthRepository(
    private val authApi: AuthApi,
    private val tokenStorage: TokenStorage
) {
    /**
     * Realiza login de manera síncrona en IO dispatcher (usa suspend).
     * Guarda access+refresh token en TokenStorage al tener éxito.
     * Devuelve Result<LoginResponse>
     */
    suspend fun login(email: String, password: String): Result<LoginResponse> =
        withContext(Dispatchers.IO) {
            try {
                val request = LoginRequest(email = email, password = password)
                val response = authApi.login(request) // suspend function
                // Si llega aquí sin excepción, response es LoginResponse válido
                tokenStorage.saveTokens(response.accessToken, response.refreshToken)
                Result.success(response)
            } catch (e: HttpException) {
                Result.failure(Exception("Login failed: ${e.code()} ${e.message()}"))
            } catch (e: IOException) {
                Result.failure(Exception("Network error: ${e.message}"))
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Logout local: borra tokens. Opcionalmente llama al backend para invalidar refresh token.
     */
    suspend fun logoutServerSideIfNeeded(authApiForLogout: AuthApi? = null) {
        // opcional: si tienes /auth/logout implementado y quieres llamar al servidor, hacerlo aquí.
        // ejemplo: authApiForLogout?.logout()  // si definiste logout en AuthApi (no obligatorio)
        tokenStorage.clear()
    }
}
