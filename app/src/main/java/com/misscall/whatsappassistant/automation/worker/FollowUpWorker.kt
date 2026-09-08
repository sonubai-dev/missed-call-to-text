package com.misscall.whatsappassistant.automation.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.usecase.SendWhatsAppMessageUseCase
import com.misscall.whatsappassistant.notifications.NotificationHelper
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

@HiltWorker
class FollowUpWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val sendWhatsAppMessageUseCase: SendWhatsAppMessageUseCase,
    private val callEventRepository: CallEventRepository,
    private val preferencesRepository: UserPreferencesRepository,
    private val notificationHelper: NotificationHelper
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val callEventId = inputData.getLong(Constants.EXTRA_CALL_EVENT_ID, -1L).takeIf { it != -1L }
        val phoneNumber = inputData.getString(Constants.EXTRA_PHONE_NUMBER) ?: return Result.failure()
        val messageText = inputData.getString(Constants.EXTRA_MESSAGE_TEXT) ?: return Result.failure()
        val templateId = inputData.getLong("extra_template_id", -1L).takeIf { it != -1L }

        AppLogger.i(TAG, "Executing FollowUpWorker for event #$callEventId to $phoneNumber")

        // Idempotency: If associated with a CallEvent, verify it hasn't already been SENT or IGNORED
        if (callEventId != null) {
            val callEvent = callEventRepository.getCallEventById(callEventId)
            if (callEvent == null ||
                callEvent.whatsappStatus == WhatsAppFollowUpStatus.SENT ||
                callEvent.whatsappStatus == WhatsAppFollowUpStatus.IGNORED ||
                callEvent.whatsappStatus == WhatsAppFollowUpStatus.SKIPPED
            ) {
                AppLogger.d(TAG, "Follow-up for event #$callEventId already handled (${callEvent?.whatsappStatus}). Skipping.")
                return Result.success()
            }
        }

        val success = sendWhatsAppMessageUseCase(
            callEventId = callEventId,
            phoneNumber = phoneNumber,
            messageContent = messageText,
            templateId = templateId
        )

        if (success) {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            if (prefs.notifyOnMissedCall) {
                notificationHelper.showFollowUpDispatchedNotification(phoneNumber, messageText)
            }
            AppLogger.i(TAG, "Follow-up successfully dispatched for $phoneNumber")
            return Result.success()
        } else {
            AppLogger.w(TAG, "Follow-up dispatch failed, scheduling retry")
            return Result.retry()
        }
    }

    companion object {
        private const val TAG = "FollowUpWorker"
    }
}
