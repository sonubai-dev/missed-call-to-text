package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "whatsapp_queue",
    indices = [
        Index(value = ["idempotency_key"], unique = true),
        Index(value = ["status", "next_retry_at"])
    ]
)
data class WhatsAppMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "message_id")
    val messageId: String,
    @ColumnInfo(name = "idempotency_key")
    val idempotencyKey: String,
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    @ColumnInfo(name = "content")
    val content: String,
    @ColumnInfo(name = "status")
    val status: String = "QUEUED", // QUEUED, SENDING, SENT, FAILED, CANCELLED
    @ColumnInfo(name = "retry_count")
    val retryCount: Int = 0,
    @ColumnInfo(name = "next_retry_at")
    val nextRetryAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "last_error")
    val lastError: String? = null
)

