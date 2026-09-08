package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.MessageLog
import kotlinx.coroutines.flow.Flow

interface MessageLogRepository {
    fun getAllMessageLogsFlow(): Flow<List<MessageLog>>
    fun getMessageLogsForNumberFlow(phoneNumber: String): Flow<List<MessageLog>>
    suspend fun getMessageLogForCallEvent(callEventId: Long): MessageLog?
    suspend fun insertMessageLog(log: MessageLog): Long
    fun getSuccessfulMessagesCountFlow(): Flow<Int>
    suspend fun clearAllLogs()
}
