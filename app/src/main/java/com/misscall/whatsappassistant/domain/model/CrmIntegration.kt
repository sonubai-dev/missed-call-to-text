package com.misscall.whatsappassistant.domain.model

data class CrmConnection(
    val isEnabled: Boolean = false,
    val webhookUrl: String = "",
    val secret: String = "",
    val enabledEvents: Set<String> = setOf(
        "missed_call",
        "customer_created",
        "whatsapp_sent",
        "sms_sent",
        "followup_completed"
    )
)

data class CrmContact(
    val id: Long,
    val name: String?,
    val phoneNumber: String,
    val businessStatus: CustomerBusinessStatus,
    val source: String,
    val createdAt: Long,
    val updatedAt: Long
)

data class WebhookDelivery(
    val id: Long = 0L,
    val eventId: String,
    val eventType: String,
    val url: String,
    val status: String,
    val attempt: Int,
    val responseCode: Int?,
    val lastError: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val deliveredAt: Long? = null
)
