package com.misscall.whatsappassistant.automation.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.domain.usecase.sms.SendSmsOutcome
import com.misscall.whatsappassistant.domain.usecase.sms.SendSmsUseCase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SendSmsWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val sendSmsUseCase: SendSmsUseCase,
    private val smsMessageRepository: SmsMessageRepository
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "SendSmsWorker"
        const val KEY_SMS_MESSAGE_ID = "key_sms_message_id"
    }

    override suspend fun doWork(): Result {
        val smsMessageId = inputData.getLong(KEY_SMS_MESSAGE_ID, -1L)
        if (smsMessageId == -1L) {
            AppLogger.e(TAG, "Missing smsMessageId in Worker inputData. Failing.")
            return Result.failure()
        }

        AppLogger.i(TAG, "Executing SendSmsWorker for SMS #$smsMessageId (Attempt #${runAttemptCount + 1})")

        // 1. Retrieve SMS from Room database to guarantee single source of truth
        val sms = smsMessageRepository.getSmsById(smsMessageId)
        if (sms == null) {
            AppLogger.e(TAG, "SmsMessage #$smsMessageId does not exist in database.")
            return Result.failure()
        }

        // 2. Strict Idempotency Check:
        // Never send if already SENT, DELIVERED, CANCELLED, or SKIPPED
        if (sms.status == SmsMessageStatus.SENT ||
            sms.status == SmsMessageStatus.DELIVERED ||
            sms.status == SmsMessageStatus.CANCELLED ||
            sms.status == SmsMessageStatus.SKIPPED
        ) {
            AppLogger.d(TAG, "SMS #$smsMessageId is already in terminal state: ${sms.status}. Skipping worker execution.")
            return Result.success()
        }

        // 3. Delegate to SendSmsUseCase which verifies permissions, SIM, duplicate protection, and dispatches via SmsManager
        return when (val outcome = sendSmsUseCase(smsMessageId = smsMessageId, isAutomatic = true)) {
            is SendSmsOutcome.Success -> {
                AppLogger.i(TAG, "SendSmsWorker completed successfully for SMS #$smsMessageId (${outcome.partsCount} parts).")
                Result.success()
            }
            is SendSmsOutcome.DuplicateSkipped -> {
                AppLogger.i(TAG, "SendSmsWorker skipped SMS #$smsMessageId: ${outcome.reason}")
                Result.success()
            }
            is SendSmsOutcome.Failed -> {
                AppLogger.e(TAG, "SendSmsWorker failed for SMS #$smsMessageId: ${outcome.reason}")
                if (runAttemptCount < 2) {
                    Result.retry()
                } else {
                    Result.failure()
                }
            }
        }
    }
}
