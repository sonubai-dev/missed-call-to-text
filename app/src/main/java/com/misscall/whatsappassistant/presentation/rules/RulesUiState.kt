package com.misscall.whatsappassistant.presentation.rules

import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.MessageTemplate

data class RulesUiState(
    val rules: List<DispatchRule> = emptyList(),
    val templates: List<MessageTemplate> = emptyList(),
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
