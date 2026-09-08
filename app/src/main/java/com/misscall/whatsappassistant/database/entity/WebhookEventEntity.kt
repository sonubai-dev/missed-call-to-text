package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "webhook_events",
    indices = [
        Index(value = ["status"]),
        Index(value = ["created_at"])
    ]
)
data class WebhookEventEntity(
    @PrimaryKey
    val id: String, // Unique Idempotency Key (UUID)
    @ColumnInfo(name = "event_type")
    val eventType: String,
    @ColumnInfo(name = "payload_json")
    val payloadJson: String,
    @ColumnInfo(name = "status")
    val status: String = "PENDING", // PENDING, PROCESSING, DELIVERED, FAILED
    @ColumnInfo(name = "attempt_count")
    val attemptCount: Int = 0,
    @ColumnInfo(name = "next_retry_at")
    val nextRetryAt: Long = 0L,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
