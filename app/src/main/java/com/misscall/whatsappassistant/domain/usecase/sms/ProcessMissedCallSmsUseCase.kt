package com.misscall.whatsappassistant.domain.usecase.sms

import com.misscall.whatsappassistant.automation.worker.WorkManagerHelper
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import com.misscall.whatsappassistant.notifications.NotificationHelper
import com.misscall.whatsappassistant.telephony.sms.SmsSimManager
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

sealed class ProcessMissedCallSmsResult {
    data class Scheduled(val smsMessage: SmsMessage, val delayMinutes: Int) : ProcessMissedCallSmsResult()
    data class DraftCreated(val smsMessage: SmsMessage) : ProcessMissedCallSmsResult()
    data class SkippedDuplicate(val smsMessage: SmsMessage, val reason: String) : ProcessMissedCallSmsResult()
    data class Ignored(val reason: String) : ProcessMissedCallSmsResult()
}

@Singleton
class ProcessMissedCallSmsUseCase @Inject constructor(
    private val smsMessageRepository: SmsMessageRepository,
    private val templateRepository: TemplateRepository,
    private val preferencesRepository: UserPreferencesRepository,
    private val workManagerHelper: WorkManagerHelper,
    private val notificationHelper: NotificationHelper,
    private val simManager: SmsSimManager
) {
    companion object {
        private const val TAG = "ProcessMissedCallSms"
    }

    suspend operator fun invoke(
        callEventId: Long?,
        customer: Customer?,
        phoneNumber: String,
        timestamp: Long = System.currentTimeMillis()
    ): ProcessMissedCallSmsResult {
        val prefs = preferencesRepository.userPreferencesFlow.first()

        // 1. Resolve SMS template
        val template = templateRepository.getTemplateById(prefs.defaultSmsTemplateId)
            ?: templateRepository.getAllTemplatesFlow().first().firstOrNull { it.channelType == ChannelType.SMS }
            ?: MessageTemplate(
                id = 0,
                name = "Default SMS",
                content = "Hi {{name}}, sorry we missed your call. Please call us back or reply to this SMS and we'll be happy to help.",
                channelType = ChannelType.SMS
            )

        // 2. Format message with variables and grammatical smoothing
        val formattedMessage = TemplateParser.parse(
            template = template.content,
            callerName = customer?.name,
            phoneNumber = phoneNumber,
            businessName = prefs.businessName.ifBlank { "our team" },
            ownerName = prefs.ownerName,
            timestamp = timestamp
        )

        val simSubId = prefs.selectedSmsSubscriptionId.takeIf { it != SmsSimManager.SUBSCRIPTION_ID_DEFAULT }

        // 3. If automatic SMS is OFF, save a DRAFT in Room for manual composer/sending
        if (!prefs.isAutomaticSmsEnabled) {
            val draftSms = SmsMessage(
                callEventId = callEventId,
                customerId = customer?.id,
                phoneNumber = phoneNumber,
                message = formattedMessage,
                subscriptionId = simSubId,
                status = SmsMessageStatus.DRAFT,
                createdAt = timestamp,
                updatedAt = timestamp
            )
            val smsId = smsMessageRepository.insertSms(draftSms)
            AppLogger.d(TAG, "Automatic SMS is OFF. Created DRAFT SMS #$smsId for $phoneNumber")
            return ProcessMissedCallSmsResult.DraftCreated(draftSms.copy(id = smsId))
        }

        // 4. Duplicate Protection: check if follow-up SMS was recently sent or active
        val protectionWindowMs = prefs.smsDuplicateProtectionHours * 3600 * 1000L
        val recentSms = smsMessageRepository.findRecentActiveOrSentSmsForNumber(
            phoneNumber = phoneNumber,
            sinceTimestamp = timestamp - protectionWindowMs
        )

        if (recentSms != null) {
            val reason = "DUPLICATE_PROTECTION: Already contacted within ${prefs.smsDuplicateProtectionHours} hours."
            val skippedSms = SmsMessage(
                callEventId = callEventId,
                customerId = customer?.id,
                phoneNumber = phoneNumber,
                message = formattedMessage,
                subscriptionId = simSubId,
                status = SmsMessageStatus.SKIPPED,
                failureReason = reason,
                createdAt = timestamp,
                updatedAt = timestamp
            )
            val smsId = smsMessageRepository.insertSms(skippedSms)
            AppLogger.i(TAG, "Skipped duplicate auto-SMS for $phoneNumber: $reason")
            return ProcessMissedCallSmsResult.SkippedDuplicate(skippedSms.copy(id = smsId), reason)
        }

        // 5. Create SCHEDULED SmsMessage record in Room
        val delayMins = prefs.smsDelayMinutes
        val scheduledAt = timestamp + (delayMins * 60 * 1000L)

        val scheduledSms = SmsMessage(
            callEventId = callEventId,
            customerId = customer?.id,
            phoneNumber = phoneNumber,
            message = formattedMessage,
            subscriptionId = simSubId,
            status = SmsMessageStatus.SCHEDULED,
            scheduledAt = scheduledAt,
            createdAt = timestamp,
            updatedAt = timestamp
        )
        val smsId = smsMessageRepository.insertSms(scheduledSms)
        val savedSms = scheduledSms.copy(id = smsId)

        // 6. Enqueue WorkManager job
        workManagerHelper.scheduleSms(smsMessageId = smsId, delayMinutes = delayMins)
        AppLogger.i(TAG, "Enqueued SendSmsWorker for SMS #$smsId (Delay: ${delayMins}m)")

        return ProcessMissedCallSmsResult.Scheduled(savedSms, delayMins)
    }
}
