package com.misscall.whatsappassistant.domain.usecase

import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetTemplatesUseCase @Inject constructor(
    private val templateRepository: TemplateRepository
) {
    fun getAll(): Flow<List<MessageTemplate>> = templateRepository.getAllTemplatesFlow()
    fun getDefault(): Flow<MessageTemplate?> = templateRepository.getDefaultTemplateFlow()
}

class ManageTemplatesUseCase @Inject constructor(
    private val templateRepository: TemplateRepository
) {
    suspend fun createTemplate(name: String, content: String, isDefault: Boolean): Long {
        val template = MessageTemplate(
            name = name,
            content = content,
            isDefault = isDefault
        )
        val id = templateRepository.insertTemplate(template)
        if (isDefault) {
            templateRepository.setDefaultTemplate(id)
        }
        return id
    }

    suspend fun updateTemplate(template: MessageTemplate) {
        templateRepository.updateTemplate(template)
        if (template.isDefault) {
            templateRepository.setDefaultTemplate(template.id)
        }
    }

    suspend fun setDefault(id: Long) {
        templateRepository.setDefaultTemplate(id)
    }

    suspend fun delete(id: Long) {
        templateRepository.deleteTemplate(id)
    }
}
