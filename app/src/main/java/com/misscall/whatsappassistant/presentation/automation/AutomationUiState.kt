package com.misscall.whatsappassistant.presentation.automation

import com.misscall.whatsappassistant.core.preferences.UserPreferences

data class AutomationUiState(
    val preferences: UserPreferences = UserPreferences(),
    val simulationResult: String? = null,
    val isSimulating: Boolean = false,
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
