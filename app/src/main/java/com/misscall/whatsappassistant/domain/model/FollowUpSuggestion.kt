package com.misscall.whatsappassistant.domain.model

enum class FollowUpSuggestionStatus {
    PENDING,
    DRAFT,
    SENT,
    FAILED,
    IGNORED
}

data class FollowUpSuggestion(
    val id: Long = 0,
    val callEventId: Long,
    val phoneNumber: String,
    val suggestedMessage: String,
    val status: FollowUpSuggestionStatus = FollowUpSuggestionStatus.PENDING,
    val createdAt: Long = System.currentTimeMillis()
)
