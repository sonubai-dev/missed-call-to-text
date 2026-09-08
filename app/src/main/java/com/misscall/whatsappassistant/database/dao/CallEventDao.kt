package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.CallEventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CallEventDao {

    @Query("SELECT * FROM call_events ORDER BY timestamp DESC")
    fun getAllCallEventsFlow(): Flow<List<CallEventEntity>>

    @Query("SELECT * FROM call_events WHERE status = :status ORDER BY timestamp DESC")
    fun getCallEventsByStatusFlow(status: String): Flow<List<CallEventEntity>>

    @Query("SELECT * FROM call_events WHERE id = :id")
    suspend fun getCallEventById(id: Long): CallEventEntity?

    @Query("SELECT * FROM call_events WHERE normalized_phone_number = :normalizedNumber ORDER BY timestamp DESC LIMIT 1")
    suspend fun getLatestCallEventForNumber(normalizedNumber: String): CallEventEntity?

    @Query("SELECT * FROM call_events WHERE normalized_phone_number = :normalizedNumber AND timestamp >= :sinceTimestamp ORDER BY timestamp DESC LIMIT 1")
    suspend fun findRecentEventForNumber(normalizedNumber: String, sinceTimestamp: Long): CallEventEntity?

    @Query("SELECT * FROM call_events WHERE processed = 0 AND status = 'MISSED' ORDER BY timestamp ASC")
    suspend fun getUnprocessedMissedCalls(): List<CallEventEntity>

    @Query("SELECT * FROM call_events WHERE status = 'RINGING' ORDER BY timestamp DESC")
    suspend fun getActiveRingingCalls(): List<CallEventEntity>

    @Query("SELECT * FROM call_events WHERE idempotency_key = :key LIMIT 1")
    suspend fun getEventByIdempotencyKey(key: String): CallEventEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCallEvent(callEvent: CallEventEntity): Long

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertCallEventIgnore(callEvent: CallEventEntity): Long

    @Update
    suspend fun updateCallEvent(callEvent: CallEventEntity)

    @Query("UPDATE call_events SET status = :status, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateCallStatus(id: Long, status: String, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE call_events SET whatsapp_status = :whatsappStatus, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateWhatsAppStatus(id: Long, whatsappStatus: String, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE call_events SET processed = :processed, updated_at = :updatedAt WHERE id = :id")
    suspend fun markProcessed(id: Long, processed: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM call_events WHERE id = :id")
    suspend fun deleteCallEvent(id: Long)

    @Query("DELETE FROM call_events")
    suspend fun clearAllCallEvents()

    @Query("SELECT COUNT(*) FROM call_events WHERE status = 'MISSED'")
    fun getTotalMissedCallCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM call_events WHERE status = 'MISSED' AND timestamp >= :sinceTimestamp")
    fun getMissedCallCountSinceFlow(sinceTimestamp: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM call_events WHERE whatsapp_status = 'SENT' AND timestamp >= :sinceTimestamp")
    fun getSentCountSinceFlow(sinceTimestamp: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM call_events WHERE status = 'MISSED' AND whatsapp_status = 'PENDING'")
    fun getPendingFollowUpCountFlow(): Flow<Int>
}
