package com.misscall.whatsappassistant.domain.model

data class DispatchRule(
    val id: Long = 0,
    val name: String,
    val priority: Int = 0,
    val isActive: Boolean = true,
    val callerCondition: CallerCondition = CallerCondition.ALL_CALLERS,
    val specificNumbers: List<String> = emptyList(),
    val timeWindow: TimeWindow = TimeWindow(),
    val channelType: ChannelType = ChannelType.WHATSAPP,
    val templateId: Long = 0,
    val delaySeconds: Int = 0,
    val cooldownMinutes: Int = 120,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
