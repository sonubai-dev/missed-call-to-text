package com.misscall.whatsappassistant.whatsapp.channel

import kotlinx.coroutines.flow.Flow

interface WhatsAppChannel {
    suspend fun connect(phoneNumber: String)
    suspend fun disconnect()
    fun getStatusFlow(): Flow<WhatsAppSessionState>
    suspend fun sendMessage(messageId: String, idempotencyKey: String, phoneNumber: String, content: String): ChannelSendResult
    suspend fun getConnectionInfo(): ConnectionInfo
}

