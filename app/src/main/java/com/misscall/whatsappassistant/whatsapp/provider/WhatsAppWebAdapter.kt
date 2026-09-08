package com.misscall.whatsappassistant.whatsapp.provider

import com.misscall.whatsappassistant.whatsapp.channel.ChannelSendResult
import com.misscall.whatsappassistant.whatsapp.channel.ConnectionInfo
import com.misscall.whatsappassistant.whatsapp.channel.WhatsAppChannel
import com.misscall.whatsappassistant.whatsapp.channel.WhatsAppSessionState
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.GlobalScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WhatsAppWebAdapter @Inject constructor() : WhatsAppChannel {

    private val _statusFlow = MutableStateFlow(WhatsAppSessionState.DISCONNECTED)
    private var connectedNumber: String? = null
    private var lastError: String? = null
    private var qrCode: String? = null

    override suspend fun connect(phoneNumber: String) {
        _statusFlow.update { WhatsAppSessionState.CONNECTING }
        // Simulate network call to backend to fetch QR or connect
        delay(600)
        
        // Simulating that the backend returns a QR code required status
        qrCode = "DUMMY_QR_DATA_${System.currentTimeMillis()}"
        _statusFlow.update { WhatsAppSessionState.QR_REQUIRED }
        
        // In a real implementation, we would start a polling mechanism or WebSocket 
        // to listen for the QR scan event. For simulation, we wait a bit and pretend it was scanned.
        kotlinx.coroutines.GlobalScope.launch {
            delay(5000) // Pretend user scanned it in 5 seconds
            qrCode = null
            connectedNumber = phoneNumber
            _statusFlow.update { WhatsAppSessionState.CONNECTED }
        }
    }

    override suspend fun disconnect() {
        _statusFlow.update { WhatsAppSessionState.DISCONNECTED }
        connectedNumber = null
        qrCode = null
    }

    override fun getStatusFlow(): Flow<WhatsAppSessionState> {
        return _statusFlow.asStateFlow()
    }

    override suspend fun sendMessage(
        messageId: String,
        idempotencyKey: String,
        phoneNumber: String,
        content: String
    ): ChannelSendResult {
        if (_statusFlow.value != WhatsAppSessionState.CONNECTED) {
            return ChannelSendResult.Failure("Not connected to WhatsApp Web", isRetryable = true)
        }
        
        // Simulate sending to backend
        delay(400)
        
        // Randomly simulate failures for testing retry mechanism (10% chance)
        if (Math.random() < 0.1) {
            lastError = "Simulated network timeout"
            return ChannelSendResult.Failure("Network timeout", isRetryable = true)
        }
        
        return ChannelSendResult.Success(messageId = "wa_${System.currentTimeMillis()}")
    }

    override suspend fun getConnectionInfo(): ConnectionInfo {
        return ConnectionInfo(
            state = _statusFlow.value,
            connectedNumber = connectedNumber,
            qrCodeData = qrCode,
            lastError = lastError,
            lastCheckedTimestamp = System.currentTimeMillis()
        )
    }
}

