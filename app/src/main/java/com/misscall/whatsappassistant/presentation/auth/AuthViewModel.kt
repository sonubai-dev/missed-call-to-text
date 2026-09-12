package com.misscall.whatsappassistant.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.data.remote.model.LoginRequest
import com.misscall.whatsappassistant.data.remote.model.RegisterRequest
import com.misscall.whatsappassistant.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object Success : AuthState()
    data class Error(val message: String) : AuthState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state.asStateFlow()

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            val result = authRepository.login(LoginRequest(email, pass))
            if (result.isSuccess) {
                _state.value = AuthState.Success
            } else {
                _state.value = AuthState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }

    fun register(email: String, pass: String, businessName: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            val result = authRepository.register(RegisterRequest(email, pass, businessName))
            if (result.isSuccess) {
                _state.value = AuthState.Success
            } else {
                _state.value = AuthState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }
}
