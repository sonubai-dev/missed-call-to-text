package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TemplateRepositoryImpl @Inject constructor(
    private val messageTemplateDao: MessageTemplateDao
) : TemplateRepository {

    override fun getAllTemplatesFlow(): Flow<List<MessageTemplate>> {
        return messageTemplateDao.getAllTemplatesFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getDefaultTemplateFlow(): Flow<MessageTemplate?> {
        return messageTemplateDao.getDefaultTemplateFlow().map { it?.toDomain() }
    }

    override suspend fun getDefaultTemplate(): MessageTemplate? {
        return messageTemplateDao.getDefaultTemplate()?.toDomain()
    }

    override suspend fun getTemplateById(id: Long): MessageTemplate? {
        return messageTemplateDao.getTemplateById(id)?.toDomain()
    }

    override suspend fun insertTemplate(template: MessageTemplate): Long {
        return messageTemplateDao.insertTemplate(template.toEntity())
    }

    override suspend fun updateTemplate(template: MessageTemplate) {
        messageTemplateDao.updateTemplate(template.toEntity())
    }

    override suspend fun setDefaultTemplate(id: Long) {
        messageTemplateDao.setDefaultTemplate(id)
    }

    override suspend fun incrementUsageCount(id: Long) {
        // Optional usage metrics
    }

    override suspend fun deleteTemplate(id: Long) {
        messageTemplateDao.deleteTemplate(id)
    }
}
