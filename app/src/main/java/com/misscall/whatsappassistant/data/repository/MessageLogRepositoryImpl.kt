package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.domain.model.MessageLog
import com.misscall.whatsappassistant.domain.repository.MessageLogRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageLogRepositoryImpl @Inject constructor(
    private val messageLogDao: MessageLogDao
) : MessageLogRepository {

    override fun getAllMessageLogsFlow(): Flow<List<MessageLog>> {
        return messageLogDao.getAllMessageLogsFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getMessageLogsForNumberFlow(phoneNumber: String): Flow<List<MessageLog>> {
        return messageLogDao.getMessageLogsForNumberFlow(phoneNumber).map { list -> list.map { it.toDomain() } }
    }

    override suspend fun getMessageLogForCallEvent(callEventId: Long): MessageLog? {
        return messageLogDao.getMessageLogForCallEvent(callEventId)?.toDomain()
    }

    override suspend fun insertMessageLog(log: MessageLog): Long {
        return messageLogDao.insertMessageLog(log.toEntity())
    }

    override fun getSuccessfulMessagesCountFlow(): Flow<Int> {
        return messageLogDao.getSuccessfulMessagesCountFlow()
    }

    override suspend fun clearAllLogs() {
        messageLogDao.clearAllLogs()
    }
}
