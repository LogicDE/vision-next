package com.example.vision_next2.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vision_next2.data.network.auth.User
import com.example.vision_next2.data.repository.AuthRepository
import com.example.vision_next2.data.network.auth.ProfileResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val user: User?) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class AuthViewModel(private val repo: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState

    private val _profile = MutableStateFlow<ProfileResponse?>(null)
    val profile: StateFlow<ProfileResponse?> = _profile

    fun login(email: String, password: String) {
        _uiState.value = LoginUiState.Loading
        viewModelScope.launch {
            val res = repo.login(email, password)
            if (res.isSuccess) {
                val body = res.getOrNull()
                _uiState.value = LoginUiState.Success(body?.user)
            } else {
                _uiState.value = LoginUiState.Error(res.exceptionOrNull()?.message ?: "Error desconocido")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repo.logoutServerSideIfNeeded()
            _uiState.value = LoginUiState.Idle
            _profile.value = null
        }
    }

    fun loadProfile(force: Boolean = false) {
        if (!force && _profile.value != null) return
        viewModelScope.launch {
            val result = repo.fetchProfile()
            if (result.isSuccess) {
                _profile.value = result.getOrNull()
            }
        }
    }
}
