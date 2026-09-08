package com.misscall.whatsappassistant.telephony.pipeline

import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallEventDeduplicator @Inject constructor(
    private val callEventDao: CallEventDao
) {
    private val mutex = Mutex()
    
    companion object {
        private const val DEDUPLICATION_WINDOW_MS = 15_000L
        private const val TAG = "CallEventDeduplicator"
    }

    suspend fun getOrCreateCanonicalEvent(
        rawPhoneNumber: String,
        countryCode: String,
        timestamp: Long,
        source: CallDetectionSource,
        initialStatus: CallStatus,
        callerName: String? = null
    ): CallEvent? {
        return mutex.withLock {
            val normalized = NumberNormalizer.normalize(rawPhoneNumber, countryCode)
            if (normalized.isBlank()) {
                return null
            }

            // Find existing event within the window
            val existing = callEventDao.findRecentEventForNumber(normalized, timestamp - DEDUPLICATION_WINDOW_MS)
            
            if (existing != null) {
                AppLogger.d(TAG, "Duplicate detected for $normalized within window. Reusing event #${existing.id}")
                return existing.toDomain()
            }

            // Generate deterministic idempotency key for this physical call
            // Grouping by 15-second buckets based on the timestamp
            val windowBucket = timestamp / DEDUPLICATION_WINDOW_MS
            val idempotencyKey = "${normalized}_${windowBucket}"
            
            // Check by idempotency key (handles rapid concurrent requests crossing the exact MS bound)
            val byKey = callEventDao.getEventByIdempotencyKey(idempotencyKey)
            if (byKey != null) {
                AppLogger.d(TAG, "Duplicate detected via idempotency key $idempotencyKey. Reusing event #${byKey.id}")
                return byKey.toDomain()
            }

            val callEvent = CallEvent(
                idempotencyKey = idempotencyKey,
                phoneNumber = rawPhoneNumber,
                normalizedPhoneNumber = normalized,
                callerName = callerName,
                timestamp = timestamp,
                direction = CallDirection.INCOMING,
                status = initialStatus,
                source = source,
                processed = false,
                whatsappStatus = WhatsAppFollowUpStatus.PENDING,
                createdAt = timestamp,
                updatedAt = timestamp
            )
            
            val id = callEventDao.insertCallEventIgnore(callEvent.toEntity())
            if (id == -1L) {
                // Ignore means another thread inserted it via unique constraint conflict
                val finalEvent = callEventDao.getEventByIdempotencyKey(idempotencyKey)
                if (finalEvent != null) {
                    AppLogger.d(TAG, "Retrieved canonical CallEvent #${finalEvent.id} after unique constraint conflict.")
                    return finalEvent.toDomain()
                }
            }
            
            val finalId = if (id != -1L && id != 0L) id else callEventDao.getEventByIdempotencyKey(idempotencyKey)?.id ?: 0L
            AppLogger.d(TAG, "Created new canonical CallEvent #${finalId} with key $idempotencyKey")
            return callEvent.copy(id = finalId)
        }
    }
}
