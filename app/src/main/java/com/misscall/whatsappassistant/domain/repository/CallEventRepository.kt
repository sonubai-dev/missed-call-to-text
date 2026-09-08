package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import kotlinx.coroutines.flow.Flow

interface CallEventRepository {
    fun getAllCallEventsFlow(): Flow<List<CallEvent>>
    fun getCallEventsByStatusFlow(status: CallStatus): Flow<List<CallEvent>>
    suspend fun getCallEventById(id: Long): CallEvent?
    suspend fun getLatestCallEventForNumber(normalizedNumber: String): CallEvent?
    suspend fun findRecentEventForNumber(normalizedNumber: String, sinceTimestamp: Long): CallEvent?
    suspend fun getUnprocessedMissedCalls(): List<CallEvent>
    suspend fun getActiveRingingCalls(): List<CallEvent>
    suspend fun insertCallEvent(callEvent: CallEvent): Long
    suspend fun updateCallEvent(callEvent: CallEvent)
    suspend fun updateCallStatus(id: Long, status: CallStatus)
    suspend fun updateWhatsAppStatus(id: Long, whatsappStatus: WhatsAppFollowUpStatus)
    suspend fun markProcessed(id: Long, processed: Boolean)
    suspend fun deleteCallEvent(id: Long)
    suspend fun clearAllCallEvents()
    fun getTotalMissedCallCountFlow(): Flow<Int>
    fun getMissedCallCountSinceFlow(sinceTimestamp: Long): Flow<Int>
    fun getSentCountSinceFlow(sinceTimestamp: Long): Flow<Int>
    fun getPendingFollowUpCountFlow(): Flow<Int>
}
