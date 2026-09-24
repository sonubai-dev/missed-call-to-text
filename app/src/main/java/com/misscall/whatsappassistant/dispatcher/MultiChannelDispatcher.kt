package com.misscall.whatsappassistant.dispatcher

import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ActivityStatus
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

sealed class MultiChannelDispatchResult {
    data class Success(val channel: ChannelType, val recipient: String) : MultiChannelDispatchResult()
    data class Failure(val channel: ChannelType, val reason: String) : MultiChannelDispatchResult()
}

@Singleton
class MultiChannelDispatcher @Inject constructor(
    private val whatsAppProviderManager: WhatsAppProviderManager,
    private val emailDispatcher: EmailDispatcher,
    private val templateRepository: TemplateRepository,
    private val activityLogRepository: ActivityLogRepository,
    private val preferencesRepository: UserPreferencesRepository
) {
    companion object {
        private const val TAG = "MultiChannelDispatcher"
    }

    suspend fun dispatch(
        callEventId: Long,
        phoneNumber: String,
        callerName: String?,
        rule: DispatchRule,
        emailAddress: String? = null
    ): MultiChannelDispatchResult = withContext(Dispatchers.IO) {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val template = templateRepository.getTemplateById(rule.templateId) 
            ?: templateRepository.getDefaultTemplate()
            ?: MessageTemplate(name = "Fallback", content = "Hi, sorry we missed your call from {{business_name}}.")

        val parsedMessage = TemplateParser.parse(
            template = template.content,
            callerName = callerName,
            phoneNumber = phoneNumber,
            businessName = prefs.businessName,
            ownerName = prefs.ownerName
        )

        val parsedSubject = if (template.subject.isNotBlank()) {
            TemplateParser.parse(
                template = template.subject,
                callerName = callerName,
                phoneNumber = phoneNumber,
                businessName = prefs.businessName,
                ownerName = prefs.ownerName
            )
        } else {
            "Missed call from ${prefs.businessName}"
        }

        val recipient = if (rule.channelType == ChannelType.EMAIL) (emailAddress ?: phoneNumber) else phoneNumber

        // Log initial activity record
        val initialLog = ActivityLog(
            callEventId = callEventId,
            ruleId = rule.id,
            ruleName = rule.name,
            channelType = rule.channelType,
            recipient = recipient,
            messageContent = parsedMessage,
            subject = parsedSubject,
            status = ActivityStatus.PENDING,
            dispatchedAt = System.currentTimeMillis()
        )
        val logId = activityLogRepository.insertActivityLog(initialLog)

        AppLogger.i(TAG, "Executing dispatch via ${rule.channelType} to $recipient (Rule: ${rule.name})")

        val result: MultiChannelDispatchResult = when (rule.channelType) {
            ChannelType.WHATSAPP -> {
                val waResult = whatsAppProviderManager.sendMessage(
                    phoneNumber = phoneNumber,
                    message = parsedMessage
                )
                if (waResult.isSuccess) {
                    activityLogRepository.updateLogStatus(logId, ActivityStatus.SENT)
                    MultiChannelDispatchResult.Success(ChannelType.WHATSAPP, phoneNumber)
                } else {
                    val error = waResult.errorMessage ?: "WhatsApp dispatch failed"
                    activityLogRepository.updateLogStatus(logId, ActivityStatus.FAILED, error)
                    MultiChannelDispatchResult.Failure(ChannelType.WHATSAPP, error)
                }
            }

            ChannelType.SMS -> {
                activityLogRepository.updateLogStatus(logId, ActivityStatus.SENT)
                MultiChannelDispatchResult.Success(ChannelType.SMS, phoneNumber)
            }

            ChannelType.EMAIL -> {
                val emailResult = emailDispatcher.sendEmail(
                    recipientEmail = recipient,
                    subject = parsedSubject,
                    body = parsedMessage
                )
                when (emailResult) {
                    is EmailDispatchResult.Success, is EmailDispatchResult.IntentFallback -> {
                        activityLogRepository.updateLogStatus(logId, ActivityStatus.SENT)
                        MultiChannelDispatchResult.Success(ChannelType.EMAIL, recipient)
                    }
                    is EmailDispatchResult.Failure -> {
                        activityLogRepository.updateLogStatus(logId, ActivityStatus.FAILED, emailResult.error)
                        MultiChannelDispatchResult.Failure(ChannelType.EMAIL, emailResult.error)
                    }
                }
            }
        }

        result
    }
}
