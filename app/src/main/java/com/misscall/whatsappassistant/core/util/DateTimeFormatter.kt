package com.misscall.whatsappassistant.core.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DateTimeUtils {

    private val fullDateTimeFormat = SimpleDateFormat("MMM dd, yyyy hh:mm a", Locale.getDefault())
    private val timeOnlyFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
    private val dateOnlyFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    private val hourMinute24Format = SimpleDateFormat("HH:mm", Locale.getDefault())

    fun formatFull(timestamp: Long): String {
        return fullDateTimeFormat.format(Date(timestamp))
    }

    fun formatTime(timestamp: Long): String {
        return timeOnlyFormat.format(Date(timestamp))
    }

    fun formatDate(timestamp: Long): String {
        return dateOnlyFormat.format(Date(timestamp))
    }

    fun formatRelative(timestamp: Long): String {
        val now = java.util.Calendar.getInstance()
        val callCal = java.util.Calendar.getInstance().apply { timeInMillis = timestamp }

        val timeStr = timeOnlyFormat.format(Date(timestamp))

        val isToday = now.get(java.util.Calendar.YEAR) == callCal.get(java.util.Calendar.YEAR) &&
                now.get(java.util.Calendar.DAY_OF_YEAR) == callCal.get(java.util.Calendar.DAY_OF_YEAR)

        val isYesterday = now.get(java.util.Calendar.YEAR) == callCal.get(java.util.Calendar.YEAR) &&
                now.get(java.util.Calendar.DAY_OF_YEAR) - callCal.get(java.util.Calendar.DAY_OF_YEAR) == 1

        return when {
            isToday -> "Today, $timeStr"
            isYesterday -> "Yesterday, $timeStr"
            else -> formatFull(timestamp)
        }
    }

    fun formatHourMinute24(hour: Int, minute: Int): String {
        return String.format(Locale.US, "%02d:%02d", hour, minute)
    }

    fun isTimeWithinRange(
        currentTimestamp: Long,
        startHour: Int,
        startMinute: Int,
        endHour: Int,
        endMinute: Int
    ): Boolean {
        val date = Date(currentTimestamp)
        val cal = java.util.Calendar.getInstance().apply { time = date }
        val currentMinutes = cal.get(java.util.Calendar.HOUR_OF_DAY) * 60 + cal.get(java.util.Calendar.MINUTE)
        val startMinutes = startHour * 60 + startMinute
        val endMinutes = endHour * 60 + endMinute

        return if (startMinutes <= endMinutes) {
            currentMinutes in startMinutes..endMinutes
        } else {
            // Overrides midnight (e.g. 20:00 to 06:00)
            currentMinutes >= startMinutes || currentMinutes <= endMinutes
        }
    }
}
