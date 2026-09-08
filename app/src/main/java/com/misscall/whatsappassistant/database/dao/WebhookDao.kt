package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity
import com.misscall.whatsappassistant.database.entity.WebhookEventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WebhookDao {
    // Event Queue
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertEvent(event: WebhookEventEntity): Long

    @Query("SELECT * FROM webhook_events WHERE status = 'PENDING' AND next_retry_at <= :currentTime ORDER BY created_at ASC LIMIT :limit")
    suspend fun getPendingEvents(currentTime: Long = System.currentTimeMillis(), limit: Int = 20): List<WebhookEventEntity>

    @Query("SELECT COUNT(*) FROM webhook_events WHERE status = 'PENDING'")
    fun getPendingEventsCountFlow(): Flow<Int>

    @Query("UPDATE webhook_events SET status = :status, attempt_count = :attempts, next_retry_at = :nextRetryAt, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateEventStatus(id: String, status: String, attempts: Int, nextRetryAt: Long, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM webhook_events WHERE status = 'DELIVERED' OR (status = 'FAILED' AND attempt_count >= 5)")
    suspend fun pruneProcessedEvents()

    // Delivery Audit Log
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDelivery(delivery: WebhookDeliveryEntity): Long

    @Query("SELECT * FROM webhook_deliveries ORDER BY created_at DESC LIMIT 1")
    fun getLatestDeliveryFlow(): Flow<WebhookDeliveryEntity?>

    @Query("SELECT * FROM webhook_deliveries ORDER BY created_at DESC LIMIT :limit")
    fun getRecentDeliveriesFlow(limit: Int = 50): Flow<List<WebhookDeliveryEntity>>

    @Query("DELETE FROM webhook_deliveries")
    suspend fun deleteAllDeliveries()
}
