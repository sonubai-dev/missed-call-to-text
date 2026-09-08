package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "crm_activities",
    indices = [
        Index(value = ["customer_id"]),
        Index(value = ["call_event_id"]),
        Index(value = ["message_id"]),
        Index(value = ["webhook_event_id"]),
        Index(value = ["type"]),
        Index(value = ["timestamp"])
    ]
)
data class CrmActivityEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    @ColumnInfo(name = "customer_id")
    val customerId: Long,
    @ColumnInfo(name = "call_event_id")
    val callEventId: String? = null,
    @ColumnInfo(name = "message_id")
    val messageId: String? = null,
    @ColumnInfo(name = "webhook_event_id")
    val webhookEventId: String? = null,
    @ColumnInfo(name = "type")
    val type: String,
    @ColumnInfo(name = "message")
    val message: String,
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "metadata")
    val metadata: String = "{}"
)
