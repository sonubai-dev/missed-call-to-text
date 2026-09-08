package com.misscall.whatsappassistant.domain.model

data class MessageTemplate(
    val id: Long = 0,
    val name: String,
    val content: String,
    val channelType: ChannelType = ChannelType.WHATSAPP,
    val subject: String = "",
    val language: String = "en",
    val isDefault: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    val title: String get() = name
}
