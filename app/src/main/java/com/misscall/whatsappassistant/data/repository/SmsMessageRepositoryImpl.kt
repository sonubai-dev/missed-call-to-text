package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.database.dao.SmsMessageDao
import com.misscall.whatsappassistant.database.entity.SmsMessageEntity
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SmsMessageRepositoryImpl @Inject constructor(
    private val smsMessageDao: SmsMessageDao
) : SmsMessageRepository {

    override suspend fun insertSms(sms: SmsMessage): Long {
        return smsMessageDao.insertSms(SmsMessageEntity.fromDomain(sms))
    }

    override suspend fun updateSms(sms: SmsMessage) {
        smsMessageDao.updateSms(SmsMessageEntity.fromDomain(sms))
    }

    override suspend fun getSmsById(id: Long): SmsMessage? {
        return smsMessageDao.getSmsById(id)?.toDomain()
    }

    override fun getAllSmsFlow(): Flow<List<SmsMessage>> {
        return smsMessageDao.getAllSmsFlow().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override fun getSmsByStatusFlow(status: SmsMessageStatus): Flow<List<SmsMessage>> {
        return smsMessageDao.getSmsByStatusFlow(status.name).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun getPendingScheduledSms(): List<SmsMessage> {
        return smsMessageDao.getPendingScheduledSms().map { it.toDomain() }
    }

    override suspend fun findRecentActiveOrSentSmsForNumber(phoneNumber: String, sinceTimestamp: Long): SmsMessage? {
        return smsMessageDao.findRecentActiveOrSentSmsForNumber(phoneNumber, sinceTimestamp)?.toDomain()
    }

    override suspend fun updateStatus(id: Long, status: SmsMessageStatus) {
        smsMessageDao.updateStatus(id, status.name)
    }

    override suspend fun updateSentResult(id: Long, status: SmsMessageStatus, sentAt: Long?, failureReason: String?) {
        smsMessageDao.updateSentResult(id, status.name, sentAt, failureReason)
    }

    override suspend fun updateDeliveredResult(id: Long, status: SmsMessageStatus, deliveredAt: Long) {
        smsMessageDao.updateDeliveredResult(id, status.name, deliveredAt)
    }

    override suspend fun deleteSmsById(id: Long) {
        smsMessageDao.deleteSmsById(id)
    }

    override suspend fun clearAllSms() {
        smsMessageDao.clearAllSms()
    }

    override fun getTotalSmsCountFlow(): Flow<Int> = smsMessageDao.getTotalSmsCountFlow()

    override fun getSentCountFlow(): Flow<Int> = smsMessageDao.getSentCountFlow()

    override fun getFailedCountFlow(): Flow<Int> = smsMessageDao.getFailedCountFlow()

    override fun getScheduledCountFlow(): Flow<Int> = smsMessageDao.getScheduledCountFlow()

    override fun getSkippedCountFlow(): Flow<Int> = smsMessageDao.getSkippedCountFlow()
}
