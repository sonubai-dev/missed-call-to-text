package com.misscall.whatsappassistant.domain.model

enum class ChannelType {
    WHATSAPP,
    SMS,
    EMAIL
}

enum class CallerCondition {
    ALL_CALLERS,
    UNKNOWN_ONLY,
    CONTACTS_ONLY,
    SPECIFIC_NUMBERS,
    VIP_ONLY
}

data class TimeWindow(
    val enabled: Boolean = false,
    val startHour: Int = 9,
    val startMinute: Int = 0,
    val endHour: Int = 18,
    val endMinute: Int = 0,
    val activeDays: List<Int> = listOf(1, 2, 3, 4, 5) // 1=Mon, 7=Sun
)
