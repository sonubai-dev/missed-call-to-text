package com.misscall.whatsappassistant.domain.model

enum class MessageDeliveryStatus {
    SUCCESS,
    FAILED,
    CANCELLED
}

enum class DeliveryMethod {
    INTENT,
    WHATSAPP_BUSINESS,
    CLOUD_API
}

data class MessageLog(
    val id: Long = 0,
    val callEventId: Long? = null,
    val customerId: Long? = null,
    val phoneNumber: String,
    val messageContent: String,
    val timestamp: Long = System.currentTimeMillis(),
    val status: MessageDeliveryStatus = MessageDeliveryStatus.SUCCESS,
    val deliveryMethod: DeliveryMethod = DeliveryMethod.INTENT,
    val errorMessage: String? = null
)
