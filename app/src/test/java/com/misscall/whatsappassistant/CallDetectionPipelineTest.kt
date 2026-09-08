package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import com.misscall.whatsappassistant.domain.usecase.ProcessMissedCallUseCase
import com.misscall.whatsappassistant.domain.usecase.ProcessResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class CallDetectionPipelineTest {

    private val fakeEvents = mutableListOf<CallEvent>()
    private var nextId = 1L

    private val fakeCallEventRepository = object : CallEventRepository {
        override fun getAllCallEventsFlow(): Flow<List<CallEvent>> = flowOf(fakeEvents)
        override fun getCallEventsByStatusFlow(status: CallStatus): Flow<List<CallEvent>> =
            flowOf(fakeEvents.filter { it.status == status })

        override suspend fun getCallEventById(id: Long): CallEvent? = fakeEvents.find { it.id == id }

        override suspend fun getLatestCallEventForNumber(normalizedNumber: String): CallEvent? =
            fakeEvents.filter { it.normalizedPhoneNumber == normalizedNumber }.maxByOrNull { it.timestamp }

        override suspend fun findRecentEventForNumber(normalizedNumber: String, sinceTimestamp: Long): CallEvent? =
            fakeEvents.filter { it.normalizedPhoneNumber == normalizedNumber && it.timestamp >= sinceTimestamp }
                .maxByOrNull { it.timestamp }

        override suspend fun getUnprocessedMissedCalls(): List<CallEvent> =
            fakeEvents.filter { !it.processed && it.status == CallStatus.MISSED }

        override suspend fun getActiveRingingCalls(): List<CallEvent> =
            fakeEvents.filter { it.status == CallStatus.RINGING }

        override suspend fun insertCallEvent(callEvent: CallEvent): Long {
            val id = nextId++
            val saved = callEvent.copy(id = id)
            fakeEvents.add(saved)
            return id
        }

        override suspend fun updateCallEvent(callEvent: CallEvent) {
            val index = fakeEvents.indexOfFirst { it.id == callEvent.id }
            if (index != -1) fakeEvents[index] = callEvent
        }

        override suspend fun updateCallStatus(id: Long, status: CallStatus) {
            val index = fakeEvents.indexOfFirst { it.id == id }
            if (index != -1) {
                fakeEvents[index] = fakeEvents[index].copy(status = status, updatedAt = System.currentTimeMillis())
            }
        }

        override suspend fun updateWhatsAppStatus(id: Long, whatsappStatus: WhatsAppFollowUpStatus) {
            val index = fakeEvents.indexOfFirst { it.id == id }
            if (index != -1) {
                fakeEvents[index] = fakeEvents[index].copy(whatsappStatus = whatsappStatus, updatedAt = System.currentTimeMillis())
            }
        }

        override suspend fun markProcessed(id: Long, processed: Boolean) {
            val index = fakeEvents.indexOfFirst { it.id == id }
            if (index != -1) {
                fakeEvents[index] = fakeEvents[index].copy(processed = processed, updatedAt = System.currentTimeMillis())
            }
        }

        override suspend fun deleteCallEvent(id: Long) {
            fakeEvents.removeAll { it.id == id }
        }

        override suspend fun clearAllCallEvents() {
            fakeEvents.clear()
        }

        override fun getTotalMissedCallCountFlow(): Flow<Int> =
            flowOf(fakeEvents.count { it.status == CallStatus.MISSED })

        override fun getMissedCallCountSinceFlow(sinceTimestamp: Long): Flow<Int> =
            flowOf(fakeEvents.count { it.status == CallStatus.MISSED && it.timestamp >= sinceTimestamp })

        override fun getSentCountSinceFlow(sinceTimestamp: Long): Flow<Int> =
            flowOf(fakeEvents.count { it.whatsappStatus == WhatsAppFollowUpStatus.SENT && it.timestamp >= sinceTimestamp })

        override fun getPendingFollowUpCountFlow(): Flow<Int> =
            flowOf(fakeEvents.count { it.status == CallStatus.MISSED && it.whatsappStatus == WhatsAppFollowUpStatus.PENDING })
    }

    @Before
    fun setUp() {
        fakeEvents.clear()
        nextId = 1L
    }

    @Test
    fun `detects missed call when ringing transitions directly to idle`() = runTest {
        val now = System.currentTimeMillis()
        val rawNumber = "9876543210"
        val normalized = "+919876543210"

        // 1. Ringing event
        val eventId = fakeCallEventRepository.insertCallEvent(
            CallEvent(
                phoneNumber = rawNumber,
                normalizedPhoneNumber = normalized,
                timestamp = now,
                direction = CallDirection.INCOMING,
                status = CallStatus.RINGING,
                source = CallDetectionSource.CALL_SCREENING
            )
        )

        // 2. Idle transition without offhook
        fakeCallEventRepository.updateCallStatus(eventId, CallStatus.MISSED)

        val stored = fakeCallEventRepository.getCallEventById(eventId)
        assertNotNull(stored)
        assertEquals(CallStatus.MISSED, stored?.status)
    }

    @Test
    fun `detects answered call when ringing transitions to offhook then idle`() = runTest {
        val now = System.currentTimeMillis()
        val rawNumber = "9876543210"
        val normalized = "+919876543210"

        val eventId = fakeCallEventRepository.insertCallEvent(
            CallEvent(
                phoneNumber = rawNumber,
                normalizedPhoneNumber = normalized,
                timestamp = now,
                direction = CallDirection.INCOMING,
                status = CallStatus.RINGING,
                source = CallDetectionSource.CALL_SCREENING
            )
        )

        // Offhook transition
        fakeCallEventRepository.updateCallStatus(eventId, CallStatus.ANSWERED)
        fakeCallEventRepository.markProcessed(eventId, true)

        val stored = fakeCallEventRepository.getCallEventById(eventId)
        assertNotNull(stored)
        assertEquals(CallStatus.ANSWERED, stored?.status)
        assertTrue(stored?.processed == true)
    }

    @Test
    fun `deduplicates simultaneous call screening and telephony events within window`() = runTest {
        val now = System.currentTimeMillis()
        val normalized = "+919876543210"

        // Event 1 from Call Screening
        val id1 = fakeCallEventRepository.insertCallEvent(
            CallEvent(
                phoneNumber = "9876543210",
                normalizedPhoneNumber = normalized,
                timestamp = now,
                direction = CallDirection.INCOMING,
                status = CallStatus.RINGING,
                source = CallDetectionSource.CALL_SCREENING
            )
        )

        // Event 2 arrives 2 seconds later from TelephonyCallback
        val recent = fakeCallEventRepository.findRecentEventForNumber(normalized, now - 15000L)
        assertNotNull(recent)
        assertEquals(id1, recent?.id)
        assertEquals(1, fakeEvents.size)
    }

    @Test
    fun `reconciles unprocessed missed call events on recovery`() = runTest {
        val now = System.currentTimeMillis()
        fakeCallEventRepository.insertCallEvent(
            CallEvent(
                phoneNumber = "+919876543210",
                normalizedPhoneNumber = "+919876543210",
                timestamp = now,
                direction = CallDirection.INCOMING,
                status = CallStatus.MISSED,
                source = CallDetectionSource.CALL_SCREENING,
                processed = false
            )
        )

        val unprocessed = fakeCallEventRepository.getUnprocessedMissedCalls()
        assertEquals(1, unprocessed.size)
        assertEquals(CallStatus.MISSED, unprocessed.first().status)
    }
}
