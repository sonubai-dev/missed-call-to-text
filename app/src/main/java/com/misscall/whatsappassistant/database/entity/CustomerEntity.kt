package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "customers",
    indices = [
        Index(value = ["phone_number"], unique = true),
        Index(value = ["is_vip"]),
        Index(value = ["is_blacklisted"]),
        Index(value = ["business_status"])
    ]
)
data class CustomerEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,
    @ColumnInfo(name = "name")
    val name: String? = null,
    @ColumnInfo(name = "company")
    val company: String? = null,
    @ColumnInfo(name = "notes")
    val notes: String = "",
    @ColumnInfo(name = "is_vip")
    val isVip: Boolean = false,
    @ColumnInfo(name = "is_blacklisted")
    val isBlacklisted: Boolean = false,
    @ColumnInfo(name = "is_whitelisted")
    val isWhitelisted: Boolean = false,
    @ColumnInfo(name = "total_missed_calls")
    val totalMissedCalls: Int = 1,
    @ColumnInfo(name = "last_call_timestamp")
    val lastCallTimestamp: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "business_status", defaultValue = "'NEW'")
    val businessStatus: String = "NEW",
    @ColumnInfo(name = "source", defaultValue = "'MISSED_CALL'")
    val source: String = "MISSED_CALL",
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
