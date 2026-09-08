package com.misscall.whatsappassistant.domain.usecase.sms

import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.notifications.NotificationHelper
import com.misscall.whatsappassistant.telephony.sms.SmsResult
import com.misscall.whatsappassistant.telephony.sms.SmsSender
import com.misscall.whatsappassistant.telephony.sms.SmsSimManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import com.misscall.whatsappassistant.crm.CrmSyncManager
import com.misscall.whatsappassistant.domain.model.CrmActivityType
import com.misscall.whatsappassistant.database.dao.CallEventDao
import javax.inject.Inject
import javax.inject.Singleton

sealed class SendSmsOutcome {
    data class Success(val smsMessageId: Long, val partsCount: Int) : SendSmsOutcome()
    data class DuplicateSkipped(val smsMessageId: Long, val reason: String) : SendSmsOutcome()
    data class Failed(val smsMessageId: Long, val reason: String) : SendSmsOutcome()
}

@Singleton
class SendSmsUseCase @Inject constructor(
    private val smsSender: SmsSender,
    private val smsMessageRepository: SmsMessageRepository,
    private val preferencesRepository: UserPreferencesRepository,
    private val notificationHelper: NotificationHelper,
    private val simManager: SmsSimManager,
    private val crmSyncManager: CrmSyncManager,
    private val callEventDao: CallEventDao
) {
    companion object {
        private const val TAG = "SendSmsUseCase"
        const val REASON_DUPLICATE_PROTECTION = "DUPLICATE_PROTECTION"
    }

    suspend operator fun invoke(
        smsMessageId: Long,
        isAutomatic: Boolean = false
    ): SendSmsOutcome = withContext(Dispatchers.IO) {
        val sms = smsMessageRepository.getSmsById(smsMessageId)
        if (sms == null) {
            AppLogger.e(TAG, "SmsMessage #$smsMessageId not found in database.")
            return@withContext SendSmsOutcome.Failed(smsMessageId, "Record not found in database.")
        }

        // Idempotency: Do not re-send if already SENT or DELIVERED or CANCELLED
        if (sms.status == SmsMessageStatus.SENT || sms.status == SmsMessageStatus.DELIVERED) {
            AppLogger.d(TAG, "SmsMessage #$smsMessageId already sent. Skipping duplicate send.")
            return@withContext SendSmsOutcome.Success(smsMessageId, 1)
        }

        val prefs = preferencesRepository.userPreferencesFlow.first()

        // Check Duplicate Protection for automatic dispatches
        if (isAutomatic) {
            val protectionWindowMs = prefs.smsDuplicateProtectionHours * 3600 * 1000L
            val sinceTimestamp = System.currentTimeMillis() - protectionWindowMs

            val recentSms = smsMessageRepository.findRecentActiveOrSentSmsForNumber(
                phoneNumber = sms.phoneNumber,
                sinceTimestamp = sinceTimestamp
            )

            // If another active or sent SMS exists for this number (excluding this exact record)
            if (recentSms != null && recentSms.id != smsMessageId) {
                val skipReason = "$REASON_DUPLICATE_PROTECTION: Follow-up already sent to ${sms.phoneNumber} within ${prefs.smsDuplicateProtectionHours}h"
                AppLogger.i(TAG, skipReason)
                smsMessageRepository.updateStatus(smsMessageId, SmsMessageStatus.SKIPPED)
                smsMessageRepository.updateSentResult(smsMessageId, SmsMessageStatus.SKIPPED, null, skipReason)
                return@withContext SendSmsOutcome.DuplicateSkipped(smsMessageId, skipReason)
            }
        }

        // Mark as SENDING
        smsMessageRepository.updateStatus(smsMessageId, SmsMessageStatus.SENDING)

        // Resolve Subscription ID
        val subId = sms.subscriptionId ?: prefs.selectedSmsSubscriptionId.takeIf { it != SmsSimManager.SUBSCRIPTION_ID_DEFAULT }

        // Execute dispatch via Android native SmsManager
        val result = smsSender.send(
            phoneNumber = sms.phoneNumber,
            message = sms.message,
            subscriptionId = subId,
            smsMessageId = smsMessageId
        )

        return@withContext when (result) {
            is SmsResult.Success -> {
                val now = System.currentTimeMillis()
                smsMessageRepository.updateSentResult(
                    id = smsMessageId,
                    status = SmsMessageStatus.SENT,
                    sentAt = now,
                    failureReason = null
                )
                
                // Record in Unified CRM
                if (sms.customerId != null) {
                    val idempotencyKey = sms.callEventId?.let { callId ->
                        callEventDao.getCallEventById(callId)?.idempotencyKey
                    }
                    crmSyncManager.recordActivity(
                        customerId = sms.customerId,
                        type = CrmActivityType.SMS_SENT,
                        message = sms.message,
                        callEventId = idempotencyKey,
                        messageId = "SMS_${smsMessageId}",
                        metadata = mapOf(
                            "partsCount" to result.partsCount.toString(),
                            "simSlot" to (sms.simSlot?.toString() ?: "default")
                        )
                    )
                }

                AppLogger.i(TAG, "SMS #$smsMessageId successfully submitted to carrier radio queue.")
                SendSmsOutcome.Success(smsMessageId, result.partsCount)
            }
            is SmsResult.Failure -> {
                smsMessageRepository.updateSentResult(
                    id = smsMessageId,
                    status = SmsMessageStatus.FAILED,
                    sentAt = null,
                    failureReason = result.reason
                )
                AppLogger.e(TAG, "SMS #$smsMessageId failed: ${result.reason}")
                if (prefs.notifyOnMessageFailed) {
                    notificationHelper.showFollowUpFailedNotification(sms.phoneNumber, result.reason)
                }
                SendSmsOutcome.Failed(smsMessageId, result.reason)
            }
        }
    }
}
