package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "message_logs",
    indices = [
        Index(value = ["phone_number"]),
        Index(value = ["timestamp"])
    ]
)
data class MessageLogEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "call_event_id")
    val callEventId: Long? = null,
    @ColumnInfo(name = "customer_id")
    val customerId: Long? = null,
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    @ColumnInfo(name = "message_content")
    val messageContent: String,
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "status")
    val status: String = "SUCCESS", // SUCCESS, FAILED, CANCELLED
    @ColumnInfo(name = "delivery_method")
    val deliveryMethod: String = "INTENT", // INTENT, WHATSAPP_BUSINESS, CLOUD_API
    @ColumnInfo(name = "error_message")
    val errorMessage: String? = null
)
