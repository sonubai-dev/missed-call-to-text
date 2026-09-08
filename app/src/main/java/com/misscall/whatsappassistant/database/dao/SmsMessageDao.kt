package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.SmsMessageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SmsMessageDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSms(entity: SmsMessageEntity): Long

    @Update
    suspend fun updateSms(entity: SmsMessageEntity)

    @Query("SELECT * FROM sms_messages WHERE id = :id LIMIT 1")
    suspend fun getSmsById(id: Long): SmsMessageEntity?

    @Query("SELECT * FROM sms_messages ORDER BY created_at DESC")
    fun getAllSmsFlow(): Flow<List<SmsMessageEntity>>

    @Query("SELECT * FROM sms_messages WHERE status = :status ORDER BY created_at DESC")
    fun getSmsByStatusFlow(status: String): Flow<List<SmsMessageEntity>>

    @Query("SELECT * FROM sms_messages WHERE status = 'SCHEDULED' ORDER BY scheduled_at ASC")
    suspend fun getPendingScheduledSms(): List<SmsMessageEntity>

    @Query("SELECT * FROM sms_messages WHERE phone_number = :phoneNumber AND (status = 'SENT' OR status = 'DELIVERED' OR status = 'SCHEDULED' OR status = 'SENDING') AND created_at >= :sinceTimestamp ORDER BY created_at DESC LIMIT 1")
    suspend fun findRecentActiveOrSentSmsForNumber(phoneNumber: String, sinceTimestamp: Long): SmsMessageEntity?

    @Query("UPDATE sms_messages SET status = :status, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateStatus(id: Long, status: String, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE sms_messages SET status = :status, sent_at = :sentAt, failure_reason = :failureReason, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateSentResult(id: Long, status: String, sentAt: Long?, failureReason: String?, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE sms_messages SET status = :status, delivered_at = :deliveredAt, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateDeliveredResult(id: Long, status: String, deliveredAt: Long, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM sms_messages WHERE id = :id")
    suspend fun deleteSmsById(id: Long)

    @Query("DELETE FROM sms_messages")
    suspend fun clearAllSms()

    @Query("SELECT COUNT(*) FROM sms_messages")
    fun getTotalSmsCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM sms_messages WHERE status = 'SENT' OR status = 'DELIVERED'")
    fun getSentCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM sms_messages WHERE status = 'FAILED'")
    fun getFailedCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM sms_messages WHERE status = 'SCHEDULED'")
    fun getScheduledCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM sms_messages WHERE (status = 'SENT' OR status = 'DELIVERED') AND created_at >= :since")
    fun getSentCountSinceFlow(since: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM sms_messages WHERE status = 'SKIPPED'")
    fun getSkippedCountFlow(): Flow<Int>
}
