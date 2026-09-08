package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus

@Entity(
    tableName = "sms_messages",
    indices = [
        Index(value = ["phone_number"]),
        Index(value = ["call_event_id"]),
        Index(value = ["status"]),
        Index(value = ["created_at"]),
        Index(value = ["scheduled_at"])
    ]
)
data class SmsMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "call_event_id")
    val callEventId: Long? = null,

    @ColumnInfo(name = "customer_id")
    val customerId: Long? = null,

    @ColumnInfo(name = "phone_number")
    val phoneNumber: String,

    @ColumnInfo(name = "message")
    val message: String,

    @ColumnInfo(name = "subscription_id")
    val subscriptionId: Int? = null,

    @ColumnInfo(name = "sim_slot")
    val simSlot: Int? = null,

    @ColumnInfo(name = "status")
    val status: String = SmsMessageStatus.DRAFT.name,

    @ColumnInfo(name = "scheduled_at")
    val scheduledAt: Long? = null,

    @ColumnInfo(name = "sent_at")
    val sentAt: Long? = null,

    @ColumnInfo(name = "delivered_at")
    val deliveredAt: Long? = null,

    @ColumnInfo(name = "failure_reason")
    val failureReason: String? = null,

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun toDomain(): SmsMessage {
        return SmsMessage(
            id = id,
            callEventId = callEventId,
            customerId = customerId,
            phoneNumber = phoneNumber,
            message = message,
            subscriptionId = subscriptionId,
            simSlot = simSlot,
            status = try {
                SmsMessageStatus.valueOf(status)
            } catch (e: Exception) {
                SmsMessageStatus.DRAFT
            },
            scheduledAt = scheduledAt,
            sentAt = sentAt,
            deliveredAt = deliveredAt,
            failureReason = failureReason,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    companion object {
        fun fromDomain(model: SmsMessage): SmsMessageEntity {
            return SmsMessageEntity(
                id = model.id,
                callEventId = model.callEventId,
                customerId = model.customerId,
                phoneNumber = model.phoneNumber,
                message = model.message,
                subscriptionId = model.subscriptionId,
                simSlot = model.simSlot,
                status = model.status.name,
                scheduledAt = model.scheduledAt,
                sentAt = model.sentAt,
                deliveredAt = model.deliveredAt,
                failureReason = model.failureReason,
                createdAt = model.createdAt,
                updatedAt = model.updatedAt
            )
        }
    }
}
