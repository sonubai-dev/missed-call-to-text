package com.misscall.whatsappassistant.whatsapp.channel

sealed class ChannelSendResult {
    data class Success(val messageId: String) : ChannelSendResult()
    data class Failure(val reason: String, val isRetryable: Boolean) : ChannelSendResult()
}

