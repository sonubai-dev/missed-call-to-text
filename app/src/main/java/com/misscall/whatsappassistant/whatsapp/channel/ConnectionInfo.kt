package com.misscall.whatsappassistant.whatsapp.channel

data class ConnectionInfo(
    val state: WhatsAppSessionState,
    val connectedNumber: String?,
    val qrCodeData: String?,
    val lastError: String?,
    val lastCheckedTimestamp: Long
)

