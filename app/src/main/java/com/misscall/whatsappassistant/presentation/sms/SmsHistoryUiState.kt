package com.misscall.whatsappassistant.presentation.sms

import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.telephony.sms.SimInfo

data class SmsHistoryUiState(
    val messages: List<SmsMessage> = emptyList(),
    val filteredMessages: List<SmsMessage> = emptyList(),
    val selectedFilter: SmsMessageStatus? = null,
    val availableSims: List<SimInfo> = emptyList(),
    val totalCount: Int = 0,
    val sentCount: Int = 0,
    val failedCount: Int = 0,
    val scheduledCount: Int = 0,
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
