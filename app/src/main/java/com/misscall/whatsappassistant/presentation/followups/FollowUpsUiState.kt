package com.misscall.whatsappassistant.presentation.followups

import com.misscall.whatsappassistant.domain.model.CallEvent

enum class FollowUpFilter { PENDING, SENT, ALL }

data class FollowUpItem(
    val callEvent: CallEvent,
    val suggestedMessage: String,
    val customerName: String?
)

data class FollowUpsUiState(
    val isLoading: Boolean = false,
    val items: List<FollowUpItem> = emptyList(),
    val activeFilter: FollowUpFilter = FollowUpFilter.PENDING,
    val pendingCount: Int = 0,
    val sentCount: Int = 0,
    val totalCount: Int = 0,
    val userMessage: String? = null
)
