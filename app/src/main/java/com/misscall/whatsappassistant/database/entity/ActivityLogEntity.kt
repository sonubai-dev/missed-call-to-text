package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ActivityStatus
import com.misscall.whatsappassistant.domain.model.ChannelType

@Entity(
    tableName = "activity_logs",
    indices = [
        Index(value = ["dispatched_at"]),
        Index(value = ["status"]),
        Index(value = ["channel_type"])
    ]
)
data class ActivityLogEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "call_event_id")
    val callEventId: Long = 0,
    @ColumnInfo(name = "rule_id")
    val ruleId: Long? = null,
    @ColumnInfo(name = "rule_name")
    val ruleName: String = "",
    @ColumnInfo(name = "channel_type")
    val channelType: String = ChannelType.WHATSAPP.name,
    @ColumnInfo(name = "recipient")
    val recipient: String,
    @ColumnInfo(name = "message_content")
    val messageContent: String,
    @ColumnInfo(name = "subject")
    val subject: String = "",
    @ColumnInfo(name = "status")
    val status: String = ActivityStatus.PENDING.name,
    @ColumnInfo(name = "error_reason")
    val errorReason: String? = null,
    @ColumnInfo(name = "dispatched_at")
    val dispatchedAt: Long = System.currentTimeMillis()
) {
    fun toDomainModel(): ActivityLog {
        return ActivityLog(
            id = id,
            callEventId = callEventId,
            ruleId = ruleId,
            ruleName = ruleName,
            channelType = try { ChannelType.valueOf(channelType) } catch (e: Exception) { ChannelType.WHATSAPP },
            recipient = recipient,
            messageContent = messageContent,
            subject = subject,
            status = try { ActivityStatus.valueOf(status) } catch (e: Exception) { ActivityStatus.PENDING },
            errorReason = errorReason,
            dispatchedAt = dispatchedAt
        )
    }

    companion object {
        fun fromDomain(log: ActivityLog): ActivityLogEntity {
            return ActivityLogEntity(
                id = log.id,
                callEventId = log.callEventId,
                ruleId = log.ruleId,
                ruleName = log.ruleName,
                channelType = log.channelType.name,
                recipient = log.recipient,
                messageContent = log.messageContent,
                subject = log.subject,
                status = log.status.name,
                errorReason = log.errorReason,
                dispatchedAt = log.dispatchedAt
            )
        }
    }
}
