package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.misscall.whatsappassistant.domain.model.CallerCondition
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.TimeWindow

@Entity(
    tableName = "rules",
    indices = [
        Index(value = ["priority"]),
        Index(value = ["is_active"])
    ]
)
data class RuleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "name")
    val name: String,
    @ColumnInfo(name = "priority")
    val priority: Int = 0,
    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,
    @ColumnInfo(name = "caller_condition")
    val callerCondition: String = CallerCondition.ALL_CALLERS.name,
    @ColumnInfo(name = "specific_numbers")
    val specificNumbers: String = "",
    @ColumnInfo(name = "time_window_enabled")
    val timeWindowEnabled: Boolean = false,
    @ColumnInfo(name = "time_window_start_hour")
    val timeWindowStartHour: Int = 9,
    @ColumnInfo(name = "time_window_start_minute")
    val timeWindowStartMinute: Int = 0,
    @ColumnInfo(name = "time_window_end_hour")
    val timeWindowEndHour: Int = 18,
    @ColumnInfo(name = "time_window_end_minute")
    val timeWindowEndMinute: Int = 0,
    @ColumnInfo(name = "time_window_days")
    val timeWindowDays: String = "1,2,3,4,5",
    @ColumnInfo(name = "channel_type")
    val channelType: String = ChannelType.WHATSAPP.name,
    @ColumnInfo(name = "template_id")
    val templateId: Long = 0,
    @ColumnInfo(name = "delay_seconds")
    val delaySeconds: Int = 0,
    @ColumnInfo(name = "cooldown_minutes")
    val cooldownMinutes: Int = 120,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun toDomainModel(): DispatchRule {
        val daysList = timeWindowDays.split(",").mapNotNull { it.trim().toIntOrNull() }
        return DispatchRule(
            id = id,
            name = name,
            priority = priority,
            isActive = isActive,
            callerCondition = try { CallerCondition.valueOf(callerCondition) } catch (e: Exception) { CallerCondition.ALL_CALLERS },
            specificNumbers = if (specificNumbers.isBlank()) emptyList() else specificNumbers.split(",").map { it.trim() },
            timeWindow = TimeWindow(
                enabled = timeWindowEnabled,
                startHour = timeWindowStartHour,
                startMinute = timeWindowStartMinute,
                endHour = timeWindowEndHour,
                endMinute = timeWindowEndMinute,
                activeDays = if (daysList.isEmpty()) listOf(1, 2, 3, 4, 5) else daysList
            ),
            channelType = try { ChannelType.valueOf(channelType) } catch (e: Exception) { ChannelType.WHATSAPP },
            templateId = templateId,
            delaySeconds = delaySeconds,
            cooldownMinutes = cooldownMinutes,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    companion object {
        fun fromDomain(rule: DispatchRule): RuleEntity {
            return RuleEntity(
                id = rule.id,
                name = rule.name,
                priority = rule.priority,
                isActive = rule.isActive,
                callerCondition = rule.callerCondition.name,
                specificNumbers = rule.specificNumbers.joinToString(","),
                timeWindowEnabled = rule.timeWindow.enabled,
                timeWindowStartHour = rule.timeWindow.startHour,
                timeWindowStartMinute = rule.timeWindow.startMinute,
                timeWindowEndHour = rule.timeWindow.endHour,
                timeWindowEndMinute = rule.timeWindow.endMinute,
                timeWindowDays = rule.timeWindow.activeDays.joinToString(","),
                channelType = rule.channelType.name,
                templateId = rule.templateId,
                delaySeconds = rule.delaySeconds,
                cooldownMinutes = rule.cooldownMinutes,
                createdAt = rule.createdAt,
                updatedAt = rule.updatedAt
            )
        }
    }
}
