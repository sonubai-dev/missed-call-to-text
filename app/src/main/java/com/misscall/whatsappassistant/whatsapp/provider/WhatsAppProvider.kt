package com.misscall.whatsappassistant.whatsapp.provider

enum class WhatsAppSendingMode {
    MANUAL,
    WHATSAPP_WEB,
    CLOUD_API
}

enum class ProviderConnectionState {
    CONNECTED,
    DISCONNECTED,
    READY,
    NEEDS_SETUP,
    PAIRING_QR_REQUIRED,
    ERROR
}

data class WhatsAppProviderStatus(
    val mode: WhatsAppSendingMode,
    val state: ProviderConnectionState,
    val details: String = "",
    val connectedNumber: String? = null,
    val sessionActive: Boolean = false,
    val qrCodeData: String? = null,
    val lastCheckedTimestamp: Long = System.currentTimeMillis()
)

data class ConnectionValidationResult(
    val isValid: Boolean,
    val message: String,
    val details: Map<String, String> = emptyMap()
)

data class MessageSendResult(
    val isSuccess: Boolean,
    val messageId: String? = null,
    val errorMessage: String? = null,
    val modeUsed: WhatsAppSendingMode
)

/**
 * Provider-agnostic WhatsApp interface implemented by Manual, Web, and Cloud API modes.
 */
interface WhatsAppProvider {
    val mode: WhatsAppSendingMode

    suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult
    suspend fun getStatus(): WhatsAppProviderStatus
    suspend fun disconnect()
    suspend fun validateConnection(): ConnectionValidationResult
}
