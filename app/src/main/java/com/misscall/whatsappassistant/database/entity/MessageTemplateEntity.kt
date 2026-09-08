package com.misscall.whatsappassistant.database.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.MessageTemplate

@Entity(tableName = "message_templates")
data class MessageTemplateEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "name")
    val name: String,
    @ColumnInfo(name = "content")
    val content: String,
    @ColumnInfo(name = "channel_type")
    val channelType: String = ChannelType.WHATSAPP.name,
    @ColumnInfo(name = "subject")
    val subject: String = "",
    @ColumnInfo(name = "language")
    val language: String = "en",
    @ColumnInfo(name = "is_default")
    val isDefault: Boolean = false,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun toDomainModel(): MessageTemplate {
        return MessageTemplate(
            id = id,
            name = name,
            content = content,
            channelType = try { ChannelType.valueOf(channelType) } catch (e: Exception) { ChannelType.WHATSAPP },
            subject = subject,
            language = language,
            isDefault = isDefault,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    companion object {
        fun fromDomain(template: MessageTemplate): MessageTemplateEntity {
            return MessageTemplateEntity(
                id = template.id,
                name = template.name,
                content = template.content,
                channelType = template.channelType.name,
                subject = template.subject,
                language = template.language,
                isDefault = template.isDefault,
                createdAt = template.createdAt,
                updatedAt = template.updatedAt
            )
        }
    }
}
