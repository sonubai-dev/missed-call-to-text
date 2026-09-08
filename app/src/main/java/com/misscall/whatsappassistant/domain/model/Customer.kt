package com.misscall.whatsappassistant.domain.model

data class Customer(
    val id: Long = 0,
    val phoneNumber: String,
    val name: String? = null,
    val company: String? = null,
    val notes: String = "",
    val isVip: Boolean = false,
    val isBlacklisted: Boolean = false,
    val isWhitelisted: Boolean = false,
    val totalMissedCalls: Int = 1,
    val lastCallTimestamp: Long = System.currentTimeMillis(),
    val businessStatus: CustomerBusinessStatus = CustomerBusinessStatus.NEW,
    val source: String = "MISSED_CALL",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
