package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.WhatsAppMessageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WhatsAppMessageDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertMessage(message: WhatsAppMessageEntity): Long

    @Update
    suspend fun updateMessage(message: WhatsAppMessageEntity)

    @Query("SELECT * FROM whatsapp_queue WHERE status = 'QUEUED' AND next_retry_at <= :currentTime AND retry_count < 3 ORDER BY created_at ASC")
    suspend fun getPendingMessages(currentTime: Long): List<WhatsAppMessageEntity>

    @Query("SELECT * FROM whatsapp_queue WHERE idempotency_key = :key LIMIT 1")
    suspend fun getMessageByIdempotencyKey(key: String): WhatsAppMessageEntity?

    @Query("SELECT COUNT(*) FROM whatsapp_queue WHERE status = 'QUEUED'")
    fun getQueuedCountFlow(): Flow<Int>

    @Query("SELECT * FROM whatsapp_queue ORDER BY created_at DESC LIMIT 50")
    fun getRecentMessagesFlow(): Flow<List<WhatsAppMessageEntity>>
}

