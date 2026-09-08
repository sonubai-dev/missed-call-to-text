package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class SmsDuplicateProtectionTest {

    private val fakeSmsList = mutableListOf<SmsMessage>()
    private var nextId = 1L

    private val fakeSmsRepository = object : SmsMessageRepository {
        override suspend fun insertSms(sms: SmsMessage): Long {
            val id = nextId++
            val saved = sms.copy(id = id)
            fakeSmsList.add(saved)
            return id
        }

        override suspend fun updateSms(sms: SmsMessage) {
            val idx = fakeSmsList.indexOfFirst { it.id == sms.id }
            if (idx != -1) fakeSmsList[idx] = sms
        }

        override suspend fun getSmsById(id: Long): SmsMessage? = fakeSmsList.find { it.id == id }

        override fun getAllSmsFlow(): Flow<List<SmsMessage>> = flowOf(fakeSmsList)

        override fun getSmsByStatusFlow(status: SmsMessageStatus): Flow<List<SmsMessage>> =
            flowOf(fakeSmsList.filter { it.status == status })

        override suspend fun getPendingScheduledSms(): List<SmsMessage> =
            fakeSmsList.filter { it.status == SmsMessageStatus.SCHEDULED }

        override suspend fun findRecentActiveOrSentSmsForNumber(phoneNumber: String, sinceTimestamp: Long): SmsMessage? {
            val activeStatuses = setOf(
                SmsMessageStatus.SCHEDULED,
                SmsMessageStatus.SENDING,
                SmsMessageStatus.SENT,
                SmsMessageStatus.DELIVERED
            )
            return fakeSmsList.filter {
                it.phoneNumber == phoneNumber &&
                        it.status in activeStatuses &&
                        it.createdAt >= sinceTimestamp
            }.maxByOrNull { it.createdAt }
        }

        override suspend fun updateStatus(id: Long, status: SmsMessageStatus) {
            val idx = fakeSmsList.indexOfFirst { it.id == id }
            if (idx != -1) fakeSmsList[idx] = fakeSmsList[idx].copy(status = status, updatedAt = System.currentTimeMillis())
        }

        override suspend fun updateSentResult(id: Long, status: SmsMessageStatus, sentAt: Long?, failureReason: String?) {
            val idx = fakeSmsList.indexOfFirst { it.id == id }
            if (idx != -1) fakeSmsList[idx] = fakeSmsList[idx].copy(status = status, sentAt = sentAt, failureReason = failureReason, updatedAt = System.currentTimeMillis())
        }

        override suspend fun updateDeliveredResult(id: Long, status: SmsMessageStatus, deliveredAt: Long) {
            val idx = fakeSmsList.indexOfFirst { it.id == id }
            if (idx != -1) fakeSmsList[idx] = fakeSmsList[idx].copy(status = status, deliveredAt = deliveredAt, updatedAt = System.currentTimeMillis())
        }

        override suspend fun deleteSmsById(id: Long) {
            fakeSmsList.removeAll { it.id == id }
        }

        override suspend fun clearAllSms() {
            fakeSmsList.clear()
        }

        override fun getTotalSmsCountFlow(): Flow<Int> = flowOf(fakeSmsList.size)
        override fun getSentCountFlow(): Flow<Int> = flowOf(fakeSmsList.count { it.status == SmsMessageStatus.SENT || it.status == SmsMessageStatus.DELIVERED })
        override fun getFailedCountFlow(): Flow<Int> = flowOf(fakeSmsList.count { it.status == SmsMessageStatus.FAILED })
        override fun getScheduledCountFlow(): Flow<Int> = flowOf(fakeSmsList.count { it.status == SmsMessageStatus.SCHEDULED })
        override fun getSkippedCountFlow(): Flow<Int> = flowOf(fakeSmsList.count { it.status == SmsMessageStatus.SKIPPED })
    }

    @Before
    fun setUp() {
        fakeSmsList.clear()
        nextId = 1L
    }

    @Test
    fun `first missed call successfully queues scheduled SMS`() = runTest {
        val phoneNumber = "+919876543210"
        val now = System.currentTimeMillis()

        val id = fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 101L,
                phoneNumber = phoneNumber,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SCHEDULED,
                createdAt = now
            )
        )

        assertEquals(1L, id)
        val sms = fakeSmsRepository.getSmsById(id)
        assertNotNull(sms)
        assertEquals(SmsMessageStatus.SCHEDULED, sms?.status)
    }

    @Test
    fun `subsequent missed call from same customer within 24h cooldown is skipped`() = runTest {
        val phoneNumber = "+919876543210"
        val now = System.currentTimeMillis()
        val cooldownHours = 24
        val cooldownWindowMs = cooldownHours * 3600 * 1000L
        val sinceTimestamp = now - cooldownWindowMs

        // 1. First call creates and sends SMS
        val firstId = fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 101L,
                phoneNumber = phoneNumber,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SENT,
                createdAt = now - 60000L // 1 minute ago
            )
        )
        assertNotNull(fakeSmsRepository.getSmsById(firstId))

        // 2. Second missed call occurs 5 minutes later
        val recentSms = fakeSmsRepository.findRecentActiveOrSentSmsForNumber(phoneNumber, sinceTimestamp)
        assertNotNull(recentSms)
        assertEquals(firstId, recentSms?.id)

        // 3. Since recent SMS exists, subsequent SMS is skipped with duplicate protection reason
        val secondId = fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 102L,
                phoneNumber = phoneNumber,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SKIPPED,
                failureReason = "DUPLICATE_PROTECTION: Follow-up already sent within 24h",
                createdAt = now
            )
        )

        val secondSms = fakeSmsRepository.getSmsById(secondId)
        assertEquals(SmsMessageStatus.SKIPPED, secondSms?.status)
        assertTrue(secondSms?.failureReason?.contains("DUPLICATE_PROTECTION") == true)
    }

    @Test
    fun `missed call from different customer is not skipped`() = runTest {
        val customerA = "+919876543210"
        val customerB = "+919876543211"
        val now = System.currentTimeMillis()
        val sinceTimestamp = now - (24 * 3600 * 1000L)

        // Customer A was sent an SMS
        fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 101L,
                phoneNumber = customerA,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SENT,
                createdAt = now - 3600000L // 1 hour ago
            )
        )

        // Customer B calls
        val recentForB = fakeSmsRepository.findRecentActiveOrSentSmsForNumber(customerB, sinceTimestamp)
        assertNull(recentForB)

        // Customer B gets scheduled SMS
        val bId = fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 102L,
                phoneNumber = customerB,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SCHEDULED,
                createdAt = now
            )
        )
        val smsB = fakeSmsRepository.getSmsById(bId)
        assertEquals(SmsMessageStatus.SCHEDULED, smsB?.status)
    }

    @Test
    fun `missed call after duplicate protection window expires is allowed`() = runTest {
        val phoneNumber = "+919876543210"
        val now = System.currentTimeMillis()
        val cooldownHours = 24
        val cooldownWindowMs = cooldownHours * 3600 * 1000L
        val sinceTimestamp = now - cooldownWindowMs

        // Previous call was 25 hours ago (expired)
        fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 101L,
                phoneNumber = phoneNumber,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SENT,
                createdAt = now - (25 * 3600 * 1000L)
            )
        )

        val recentSms = fakeSmsRepository.findRecentActiveOrSentSmsForNumber(phoneNumber, sinceTimestamp)
        assertNull("Previous SMS is outside cooldown window, so recentSms should be null", recentSms)

        // New SMS can be scheduled
        val newId = fakeSmsRepository.insertSms(
            SmsMessage(
                callEventId = 103L,
                phoneNumber = phoneNumber,
                message = "Hi, sorry we missed your call.",
                status = SmsMessageStatus.SCHEDULED,
                createdAt = now
            )
        )
        val newSms = fakeSmsRepository.getSmsById(newId)
        assertEquals(SmsMessageStatus.SCHEDULED, newSms?.status)
    }
}
