package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "follow_up_suggestions",
    indices = [
        Index(value = ["call_event_id"]),
        Index(value = ["phone_number"]),
        Index(value = ["status"])
    ]
)
data class FollowUpSuggestionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "call_event_id")
    val callEventId: Long,
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    @ColumnInfo(name = "suggested_message")
    val suggestedMessage: String,
    @ColumnInfo(name = "status")
    val status: String = "PENDING", // PENDING, DRAFT, SENT, FAILED, IGNORED
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
