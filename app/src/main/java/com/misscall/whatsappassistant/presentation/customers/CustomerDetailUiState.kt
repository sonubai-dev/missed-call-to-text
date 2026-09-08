package com.misscall.whatsappassistant.presentation.customers

import com.misscall.whatsappassistant.domain.model.Customer

data class TimelineItem(
    val id: Long,
    val type: TimelineType,
    val title: String,
    val subtitle: String = "",
    val timestamp: Long,
    val status: String = ""
)

enum class TimelineType {
    MISSED_CALL, WHATSAPP_SENT, SMS_SENT, WHATSAPP_FAILED, SMS_FAILED,
    CALL_BACK, CUSTOM_MESSAGE, CUSTOMER_REPLY, FOLLOW_UP_CREATED
}

data class CustomerDetailUiState(
    val isLoading: Boolean = true,
    val customer: Customer? = null,
    val suggestedMessage: String = "",
    val timeline: List<TimelineItem> = emptyList(),
    val userMessage: String? = null
)
