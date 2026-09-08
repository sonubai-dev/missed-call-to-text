package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import kotlinx.coroutines.flow.Flow

interface SmsMessageRepository {
    suspend fun insertSms(sms: SmsMessage): Long
    suspend fun updateSms(sms: SmsMessage)
    suspend fun getSmsById(id: Long): SmsMessage?
    fun getAllSmsFlow(): Flow<List<SmsMessage>>
    fun getSmsByStatusFlow(status: SmsMessageStatus): Flow<List<SmsMessage>>
    suspend fun getPendingScheduledSms(): List<SmsMessage>
    suspend fun findRecentActiveOrSentSmsForNumber(phoneNumber: String, sinceTimestamp: Long): SmsMessage?
    suspend fun updateStatus(id: Long, status: SmsMessageStatus)
    suspend fun updateSentResult(id: Long, status: SmsMessageStatus, sentAt: Long?, failureReason: String?)
    suspend fun updateDeliveredResult(id: Long, status: SmsMessageStatus, deliveredAt: Long)
    suspend fun deleteSmsById(id: Long)
    suspend fun clearAllSms()
    fun getTotalSmsCountFlow(): Flow<Int>
    fun getSentCountFlow(): Flow<Int>
    fun getFailedCountFlow(): Flow<Int>
    fun getScheduledCountFlow(): Flow<Int>
    fun getSkippedCountFlow(): Flow<Int>
}
