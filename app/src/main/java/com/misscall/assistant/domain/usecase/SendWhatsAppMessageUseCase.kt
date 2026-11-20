package com.misscall.assistant.domain.usecase

import com.misscall.assistant.domain.model.DeliveryMethod
import com.misscall.assistant.domain.model.FollowUpSuggestionStatus
import com.misscall.assistant.domain.model.MessageDeliveryStatus
import com.misscall.assistant.domain.model.MessageLog
import com.misscall.assistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.assistant.domain.repository.CallEventRepository
import com.misscall.assistant.domain.repository.CustomerRepository
import com.misscall.assistant.domain.repository.FollowUpSuggestionRepository
import com.misscall.assistant.domain.repository.MessageLogRepository
import com.misscall.assistant.domain.repository.TemplateRepository
import com.misscall.assistant.whatsapp.provider.WhatsAppProviderManager
import com.misscall.assistant.whatsapp.provider.WhatsAppSendingMode
import javax.inject.Inject

class SendWhatsAppMessageUseCase @Inject constructor(
    private val providerManager: WhatsAppProviderManager,
    private val callEventRepository: CallEventRepository,
    private val customerRepository: CustomerRepository,
    private val messageLogRepository: MessageLogRepository,
    private val templateRepository: TemplateRepository,
    private val followUpSuggestionRepository: FollowUpSuggestionRepository
) {

    suspend operator fun invoke(
        callEventId: Long?,
        phoneNumber: String,
        messageContent: String,
        templateId: Long? = null
    ): Boolean {
        val customer = customerRepository.getCustomerByPhoneNumber(phoneNumber)
        val result = providerManager.sendMessage(phoneNumber, messageContent)

        val deliveryMethod = when (result.modeUsed) {
            WhatsAppSendingMode.MANUAL -> DeliveryMethod.INTENT
            WhatsAppSendingMode.WHATSAPP_WEB -> DeliveryMethod.WHATSAPP_BUSINESS
            WhatsAppSendingMode.CLOUD_API -> DeliveryMethod.CLOUD_API
        }

        val log = MessageLog(
            callEventId = callEventId,
            customerId = customer?.id,
            phoneNumber = phoneNumber,
            messageContent = messageContent,
            timestamp = System.currentTimeMillis(),
            status = if (result.isSuccess) MessageDeliveryStatus.SUCCESS else MessageDeliveryStatus.FAILED,
            deliveryMethod = deliveryMethod,
            errorMessage = result.errorMessage
        )
        messageLogRepository.insertMessageLog(log)

        if (callEventId != null) {
            val newStatus = if (result.isSuccess) WhatsAppFollowUpStatus.SENT else WhatsAppFollowUpStatus.FAILED
            callEventRepository.updateWhatsAppStatus(id = callEventId, whatsappStatus = newStatus)
            callEventRepository.markProcessed(id = callEventId, processed = true)

            // Update suggestion status
            val suggestionStatus = if (result.isSuccess) FollowUpSuggestionStatus.SENT else FollowUpSuggestionStatus.FAILED
            followUpSuggestionRepository.updateStatusByCallEventId(callEventId, suggestionStatus)
        }

        if (templateId != null && templateId > 0) {
            templateRepository.incrementUsageCount(templateId)
        }

        return result.isSuccess
    }
}
