package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "call_events",
    indices = [
        Index(value = ["normalized_phone_number"]),
        Index(value = ["timestamp"]),
        Index(value = ["status"]),
        Index(value = ["whatsapp_status"]),
        Index(value = ["processed"]),
        Index(value = ["idempotency_key"], unique = true)
    ]
)
data class CallEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "idempotency_key")
    val idempotencyKey: String? = null,
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    @ColumnInfo(name = "normalized_phone_number")
    val normalizedPhoneNumber: String,
    @ColumnInfo(name = "caller_name")
    val callerName: String? = null,
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "direction")
    val direction: String = "INCOMING", // INCOMING, OUTGOING, UNKNOWN
    @ColumnInfo(name = "status")
    val status: String = "UNKNOWN", // RINGING, ANSWERED, MISSED, REJECTED, UNKNOWN
    @ColumnInfo(name = "source")
    val source: String = "CALL_SCREENING", // CALL_SCREENING, TELEPHONY_CALLBACK, CALL_LOG, SIMULATOR
    @ColumnInfo(name = "processed")
    val processed: Boolean = false,
    @ColumnInfo(name = "whatsapp_status")
    val whatsappStatus: String = "PENDING", // PENDING, SCHEDULED, SENT, IGNORED, FAILED, SKIPPED
    @ColumnInfo(name = "template_id")
    val templateId: Long? = null,
    @ColumnInfo(name = "notes")
    val notes: String = "",
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)

