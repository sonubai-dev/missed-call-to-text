package com.misscall.whatsappassistant.domain.model

enum class ActivityStatus {
    PENDING,
    SENT,
    DELIVERED,
    FAILED,
    COOLDOWN_SKIPPED,
    NO_RULE_MATCHED
}

data class ActivityLog(
    val id: Long = 0,
    val callEventId: Long = 0,
    val ruleId: Long? = null,
    val ruleName: String = "",
    val channelType: ChannelType = ChannelType.WHATSAPP,
    val recipient: String,
    val messageContent: String,
    val subject: String = "",
    val status: ActivityStatus = ActivityStatus.PENDING,
    val errorReason: String? = null,
    val dispatchedAt: Long = System.currentTimeMillis()
)
