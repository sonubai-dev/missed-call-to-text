package com.misscall.whatsappassistant.presentation.templates

import com.misscall.whatsappassistant.domain.model.MessageTemplate

data class TemplatesUiState(
    val templates: List<MessageTemplate> = emptyList(),
    val defaultTemplate: MessageTemplate? = null,
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
