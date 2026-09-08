package com.misscall.whatsappassistant.domain.model

data class DashboardStats(
    val totalMissedCallsToday: Int = 0,
    val followUpsPendingToday: Int = 0,
    val messagesSentToday: Int = 0,
    val repliesReceivedToday: Int = 0,
    val totalCustomers: Int = 0,
    val isAutoReplyActive: Boolean = false,
    val isMonitoringActive: Boolean = true
)
