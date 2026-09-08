package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallEventRepositoryImpl @Inject constructor(
    private val callEventDao: CallEventDao
) : CallEventRepository {

    override fun getAllCallEventsFlow(): Flow<List<CallEvent>> {
        return callEventDao.getAllCallEventsFlow().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override fun getCallEventsByStatusFlow(status: CallStatus): Flow<List<CallEvent>> {
        return callEventDao.getCallEventsByStatusFlow(status.name).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun getCallEventById(id: Long): CallEvent? {
        return callEventDao.getCallEventById(id)?.toDomain()
    }

    override suspend fun getLatestCallEventForNumber(normalizedNumber: String): CallEvent? {
        return callEventDao.getLatestCallEventForNumber(normalizedNumber)?.toDomain()
    }

    override suspend fun findRecentEventForNumber(normalizedNumber: String, sinceTimestamp: Long): CallEvent? {
        return callEventDao.findRecentEventForNumber(normalizedNumber, sinceTimestamp)?.toDomain()
    }

    override suspend fun getUnprocessedMissedCalls(): List<CallEvent> {
        return callEventDao.getUnprocessedMissedCalls().map { it.toDomain() }
    }

    override suspend fun getActiveRingingCalls(): List<CallEvent> {
        return callEventDao.getActiveRingingCalls().map { it.toDomain() }
    }

    override suspend fun insertCallEvent(callEvent: CallEvent): Long {
        return callEventDao.insertCallEvent(callEvent.toEntity())
    }

    override suspend fun updateCallEvent(callEvent: CallEvent) {
        callEventDao.updateCallEvent(callEvent.toEntity())
    }

    override suspend fun updateCallStatus(id: Long, status: CallStatus) {
        callEventDao.updateCallStatus(id, status.name)
    }

    override suspend fun updateWhatsAppStatus(id: Long, whatsappStatus: WhatsAppFollowUpStatus) {
        callEventDao.updateWhatsAppStatus(id, whatsappStatus.name)
    }

    override suspend fun markProcessed(id: Long, processed: Boolean) {
        callEventDao.markProcessed(id, processed)
    }

    override suspend fun deleteCallEvent(id: Long) {
        callEventDao.deleteCallEvent(id)
    }

    override suspend fun clearAllCallEvents() {
        callEventDao.clearAllCallEvents()
    }

    override fun getTotalMissedCallCountFlow(): Flow<Int> {
        return callEventDao.getTotalMissedCallCountFlow()
    }

    override fun getMissedCallCountSinceFlow(sinceTimestamp: Long): Flow<Int> {
        return callEventDao.getMissedCallCountSinceFlow(sinceTimestamp)
    }

    override fun getSentCountSinceFlow(sinceTimestamp: Long): Flow<Int> {
        return callEventDao.getSentCountSinceFlow(sinceTimestamp)
    }

    override fun getPendingFollowUpCountFlow(): Flow<Int> {
        return callEventDao.getPendingFollowUpCountFlow()
    }
}
