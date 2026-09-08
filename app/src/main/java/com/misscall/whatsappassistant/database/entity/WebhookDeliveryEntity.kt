package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "webhook_deliveries",
    indices = [
        Index(value = ["event_id"]),
        Index(value = ["status"]),
        Index(value = ["created_at"])
    ]
)
data class WebhookDeliveryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    @ColumnInfo(name = "event_id")
    val eventId: String,
    @ColumnInfo(name = "event_type")
    val eventType: String,
    @ColumnInfo(name = "url")
    val url: String,
    @ColumnInfo(name = "status")
    val status: String,
    @ColumnInfo(name = "attempt")
    val attempt: Int,
    @ColumnInfo(name = "response_code")
    val responseCode: Int? = null,
    @ColumnInfo(name = "last_error")
    val lastError: String? = null,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "delivered_at")
    val deliveredAt: Long? = null
)
