package com.misscall.whatsappassistant.domain.model

enum class SmsMessageStatus {
    DRAFT,
    SCHEDULED,
    SENDING,
    SENT,
    DELIVERED,
    FAILED,
    CANCELLED,
    SKIPPED
}

data class SmsMessage(
    val id: Long = 0,
    val callEventId: Long? = null,
    val customerId: Long? = null,
    val phoneNumber: String,
    val message: String,
    val subscriptionId: Int? = null,
    val simSlot: Int? = null,
    val status: SmsMessageStatus = SmsMessageStatus.DRAFT,
    val scheduledAt: Long? = null,
    val sentAt: Long? = null,
    val deliveredAt: Long? = null,
    val failureReason: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
