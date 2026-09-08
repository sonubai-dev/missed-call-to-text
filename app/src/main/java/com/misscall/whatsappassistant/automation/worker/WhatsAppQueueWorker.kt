package com.misscall.whatsappassistant.automation.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.database.dao.WhatsAppMessageDao
import com.misscall.whatsappassistant.whatsapp.channel.ChannelSendResult
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppWebAdapter
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.delay

@HiltWorker
class WhatsAppQueueWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val whatsAppMessageDao: WhatsAppMessageDao,
    private val whatsAppWebAdapter: WhatsAppWebAdapter
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "WhatsAppQueueWorker"
    }

    override suspend fun doWork(): Result {
        AppLogger.d(TAG, "Starting queue processing...")
        val pendingMessages = whatsAppMessageDao.getPendingMessages(System.currentTimeMillis())

        if (pendingMessages.isEmpty()) {
            AppLogger.d(TAG, "No pending messages.")
            return Result.success()
        }

        var allSuccess = true

        for (message in pendingMessages) {
            AppLogger.d(TAG, "Processing message #${message.id} to ${message.phoneNumber}")
            
            // Mark as sending
            whatsAppMessageDao.updateMessage(message.copy(status = "SENDING"))

            val result = whatsAppWebAdapter.sendMessage(
                messageId = message.messageId,
                idempotencyKey = message.idempotencyKey,
                phoneNumber = message.phoneNumber,
                content = message.content
            )

            when (result) {
                is ChannelSendResult.Success -> {
                    whatsAppMessageDao.updateMessage(
                        message.copy(
                            status = "SENT",
                            lastError = null
                        )
                    )
                    AppLogger.d(TAG, "Successfully sent message #${message.id}")
                }
                is ChannelSendResult.Failure -> {
                    if (result.isRetryable && message.retryCount < 2) { // Allow up to 3 attempts (0, 1, 2)
                        val backoffMs = (Math.pow(2.0, message.retryCount.toDouble()) * 5000).toLong() // 5s, 10s, 20s
                        whatsAppMessageDao.updateMessage(
                            message.copy(
                                status = "QUEUED",
                                retryCount = message.retryCount + 1,
                                nextRetryAt = System.currentTimeMillis() + backoffMs,
                                lastError = result.reason
                            )
                        )
                        AppLogger.w(TAG, "Retrying message #${message.id} in ${backoffMs}ms due to: ${result.reason}")
                        allSuccess = false
                    } else {
                        whatsAppMessageDao.updateMessage(
                            message.copy(
                                status = "FAILED",
                                retryCount = message.retryCount + 1,
                                lastError = result.reason
                            )
                        )
                        AppLogger.e(TAG, "Failed to send message #${message.id} permanently: ${result.reason}")
                    }
                }
            }
            delay(1000) // Small delay between messages
        }

        return if (allSuccess) Result.success() else Result.retry()
    }
}

