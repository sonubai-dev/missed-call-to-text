package com.misscall.whatsappassistant.presentation.missedcalls

import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.telephony.sms.SimInfo

enum class CallFilter {
    ALL,
    PENDING,
    SENT,
    IGNORED
}

data class MissedCallsUiState(
    val calls: List<CallEvent> = emptyList(),
    val filteredCalls: List<CallEvent> = emptyList(),
    val templates: List<MessageTemplate> = emptyList(),
    val availableSims: List<SimInfo> = emptyList(),
    val defaultSubId: Int? = null,
    val activeFilter: CallFilter = CallFilter.ALL,
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
