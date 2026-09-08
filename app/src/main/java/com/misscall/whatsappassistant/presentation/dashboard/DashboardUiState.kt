package com.misscall.whatsappassistant.presentation.dashboard

import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.MessageTemplate

data class DashboardUiState(
    val isLoading: Boolean = false,
    val businessName: String = "My Business",
    val isMonitoringActive: Boolean = true,
    val missedCallsToday: Int = 0,
    val followUpsToday: Int = 0,
    val whatsAppSentToday: Int = 0,
    val smsSentToday: Int = 0,
    val pendingFollowUpsCount: Int = 0,
    val totalCustomers: Int = 0,
    val recentMissedCalls: List<CallEvent> = emptyList(),
    val customerMap: Map<String, Long> = emptyMap(),
    val defaultTemplate: MessageTemplate? = null,
    val userMessage: String? = null
)
