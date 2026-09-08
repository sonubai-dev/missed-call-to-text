package com.misscall.whatsappassistant.presentation.activity

import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ChannelType

data class ActivityLogUiState(
    val logs: List<ActivityLog> = emptyList(),
    val filteredLogs: List<ActivityLog> = emptyList(),
    val selectedChannel: ChannelType? = null,
    val successCount: Int = 0,
    val failureCount: Int = 0,
    val isLoading: Boolean = false,
    val userMessage: String? = null
)
