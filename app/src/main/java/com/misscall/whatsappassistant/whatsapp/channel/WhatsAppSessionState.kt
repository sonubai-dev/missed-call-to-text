package com.misscall.whatsappassistant.whatsapp.channel

enum class WhatsAppSessionState {
    DISCONNECTED,
    CONNECTING,
    QR_REQUIRED,
    CONNECTED,
    RECONNECTING,
    EXPIRED,
    ERROR
}

