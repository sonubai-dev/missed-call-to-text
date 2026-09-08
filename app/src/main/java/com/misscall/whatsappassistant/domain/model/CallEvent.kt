package com.misscall.whatsappassistant.domain.model

enum class CallDirection {
    INCOMING,
    OUTGOING,
    UNKNOWN
}

enum class CallStatus {
    RINGING,
    ANSWERED,
    MISSED,
    REJECTED,
    UNKNOWN
}

enum class CallDetectionSource {
    CALL_SCREENING,
    TELEPHONY_CALLBACK,
    CALL_LOG,
    SIMULATOR
}

enum class WhatsAppFollowUpStatus {
    PENDING,
    SCHEDULED,
    SENT,
    IGNORED,
    FAILED,
    SKIPPED
}

data class CallEvent(
    val id: Long = 0,
    val idempotencyKey: String? = null,
    val phoneNumber: String,
    val normalizedPhoneNumber: String,
    val callerName: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val direction: CallDirection = CallDirection.INCOMING,
    val status: CallStatus = CallStatus.UNKNOWN,
    val source: CallDetectionSource = CallDetectionSource.CALL_SCREENING,
    val processed: Boolean = false,
    val whatsappStatus: WhatsAppFollowUpStatus = WhatsAppFollowUpStatus.PENDING,
    val templateId: Long? = null,
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
