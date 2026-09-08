package com.misscall.whatsappassistant.telephony.sms

sealed class SmsResult {
    data class Success(
        val partsCount: Int,
        val smsMessageId: Long? = null
    ) : SmsResult()

    data class Failure(
        val reason: String,
        val errorCode: Int? = null,
        val isPermissionDenied: Boolean = false,
        val isSimUnavailable: Boolean = false,
        val smsMessageId: Long? = null
    ) : SmsResult()
}

interface SmsSender {
    suspend fun send(
        phoneNumber: String,
        message: String,
        subscriptionId: Int? = null,
        smsMessageId: Long? = null
    ): SmsResult
}
