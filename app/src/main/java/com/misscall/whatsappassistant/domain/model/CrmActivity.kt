package com.misscall.whatsappassistant.domain.model

enum class CustomerBusinessStatus {
    NEW,
    CONTACTED,
    FOLLOW_UP,
    INTERESTED,
    CONVERTED,
    LOST
}

enum class CrmActivityType {
    MISSED_CALL,
    WHATSAPP_SENT,
    SMS_SENT,
    CALL_BACK,
    CUSTOM_MESSAGE,
    CUSTOMER_REPLY,
    FOLLOW_UP_CREATED
}

data class CrmActivity(
    val id: Long = 0L,
    val customerId: Long,
    val type: CrmActivityType,
    val message: String,
    val timestamp: Long = System.currentTimeMillis(),
    val metadata: Map<String, String> = emptyMap()
)
