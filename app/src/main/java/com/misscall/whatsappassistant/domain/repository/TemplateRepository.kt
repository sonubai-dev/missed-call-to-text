package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.MessageTemplate
import kotlinx.coroutines.flow.Flow

interface TemplateRepository {
    fun getAllTemplatesFlow(): Flow<List<MessageTemplate>>
    fun getDefaultTemplateFlow(): Flow<MessageTemplate?>
    suspend fun getDefaultTemplate(): MessageTemplate?
    suspend fun getTemplateById(id: Long): MessageTemplate?
    suspend fun insertTemplate(template: MessageTemplate): Long
    suspend fun updateTemplate(template: MessageTemplate)
    suspend fun setDefaultTemplate(id: Long)
    suspend fun incrementUsageCount(id: Long)
    suspend fun deleteTemplate(id: Long)
}
