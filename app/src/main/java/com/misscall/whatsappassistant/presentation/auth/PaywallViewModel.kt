package com.misscall.whatsappassistant.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class PaywallState {
    object Idle : PaywallState()
    object Loading : PaywallState()
    object Subscribed : PaywallState()
    data class Error(val message: String) : PaywallState()
}

@HiltViewModel
class PaywallViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow<PaywallState>(PaywallState.Idle)
    val state: StateFlow<PaywallState> = _state.asStateFlow()

    fun checkStatus() {
        viewModelScope.launch {
            _state.value = PaywallState.Loading
            val result = authRepository.checkSubscriptionStatus()
            if (result.isSuccess) {
                if (result.getOrNull() == "ACTIVE") {
                    _state.value = PaywallState.Subscribed
                } else {
                    _state.value = PaywallState.Error("Subscription is not active yet.")
                }
            } else {
                _state.value = PaywallState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }
}
