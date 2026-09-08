package com.misscall.whatsappassistant.presentation.whatsapp

import com.misscall.whatsappassistant.core.preferences.UserPreferences
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestion
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.whatsapp.provider.ConnectionValidationResult
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderStatus

data class WhatsAppUiState(
    val preferences: UserPreferences = UserPreferences(),
    val templates: List<MessageTemplate> = emptyList(),
    val defaultTemplate: MessageTemplate? = null,
    val missedCalls: List<CallEvent> = emptyList(),
    val pendingFollowUps: List<FollowUpSuggestion> = emptyList(),
    val providerStatus: WhatsAppProviderStatus? = null,
    val validationResult: ConnectionValidationResult? = null,
    val isValidating: Boolean = false,
    val isWhatsAppInstalled: Boolean = false,
    val isWhatsAppBusinessInstalled: Boolean = false,
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
