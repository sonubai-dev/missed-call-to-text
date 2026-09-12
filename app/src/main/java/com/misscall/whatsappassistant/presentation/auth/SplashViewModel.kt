package com.misscall.whatsappassistant.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class SplashState {
    object Loading : SplashState()
    object NavigateToLogin : SplashState()
    object NavigateToPaywall : SplashState()
    object NavigateToHome : SplashState()
}

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val preferencesRepository: UserPreferencesRepository
) : ViewModel() {

    private val _state = MutableStateFlow<SplashState>(SplashState.Loading)
    val state: StateFlow<SplashState> = _state.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            if (prefs.jwtToken.isEmpty()) {
                _state.value = SplashState.NavigateToLogin
            } else {
                val result = authRepository.checkSubscriptionStatus()
                if (result.isSuccess) {
                    val status = result.getOrNull()
                    if (status == "ACTIVE") {
                        _state.value = SplashState.NavigateToHome
                    } else {
                        _state.value = SplashState.NavigateToPaywall
                    }
                } else {
                    // Fallback to what we have locally or just show paywall if error
                    if (prefs.subscriptionStatus == "ACTIVE") {
                        _state.value = SplashState.NavigateToHome
                    } else {
                        _state.value = SplashState.NavigateToPaywall
                    }
                }
            }
        }
    }
}
