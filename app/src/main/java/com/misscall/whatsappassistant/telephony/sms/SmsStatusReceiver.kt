package com.misscall.whatsappassistant.telephony.sms

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsManager
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.notifications.NotificationHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SmsStatusReceiver : BroadcastReceiver() {

    @Inject
    lateinit var smsMessageRepository: SmsMessageRepository

    @Inject
    lateinit var notificationHelper: NotificationHelper

    companion object {
        private const val TAG = "SmsStatusReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val smsMessageId = intent.getLongExtra(AndroidNativeSmsSender.EXTRA_SMS_MESSAGE_ID, -1L)
        val phoneNumber = intent.getStringExtra(AndroidNativeSmsSender.EXTRA_PHONE_NUMBER) ?: ""
        val partIndex = intent.getIntExtra(AndroidNativeSmsSender.EXTRA_PART_INDEX, 0)
        val totalParts = intent.getIntExtra(AndroidNativeSmsSender.EXTRA_TOTAL_PARTS, 1)

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (action == AndroidNativeSmsSender.ACTION_SMS_SENT) {
                    handleSmsSent(smsMessageId, phoneNumber, partIndex, totalParts, resultCode)
                } else if (action == AndroidNativeSmsSender.ACTION_SMS_DELIVERED) {
                    handleSmsDelivered(smsMessageId, phoneNumber, partIndex, totalParts, resultCode)
                }
            } finally {
                pendingResult.finish()
            }
        }
    }

    private suspend fun handleSmsSent(
        smsMessageId: Long,
        phoneNumber: String,
        partIndex: Int,
        totalParts: Int,
        resultCode: Int
    ) {
        AppLogger.d(TAG, "ACTION_SMS_SENT received: ID #$smsMessageId, Part $partIndex/$totalParts, Result: $resultCode")

        if (resultCode == Activity.RESULT_OK) {
            // Only update on final part if multipart
            if (partIndex == totalParts - 1) {
                val now = System.currentTimeMillis()
                if (smsMessageId != -1L) {
                    smsMessageRepository.updateSentResult(
                        id = smsMessageId,
                        status = SmsMessageStatus.SENT,
                        sentAt = now,
                        failureReason = null
                    )
                }
                AppLogger.i(TAG, "SMS #$smsMessageId successfully sent by carrier radio.")
            }
        } else {
            val userFriendlyError = mapSmsErrorCode(resultCode)
            AppLogger.e(TAG, "SMS #$smsMessageId carrier send failure: $userFriendlyError (Code: $resultCode)")
            if (smsMessageId != -1L) {
                smsMessageRepository.updateSentResult(
                    id = smsMessageId,
                    status = SmsMessageStatus.FAILED,
                    sentAt = null,
                    failureReason = userFriendlyError
                )
            }
            if (phoneNumber.isNotBlank()) {
                notificationHelper.showFollowUpFailedNotification(phoneNumber, userFriendlyError)
            }
        }
    }

    private suspend fun handleSmsDelivered(
        smsMessageId: Long,
        phoneNumber: String,
        partIndex: Int,
        totalParts: Int,
        resultCode: Int
    ) {
        AppLogger.d(TAG, "ACTION_SMS_DELIVERED received: ID #$smsMessageId, Part $partIndex/$totalParts, Result: $resultCode")

        if (resultCode == Activity.RESULT_OK) {
            if (partIndex == totalParts - 1 && smsMessageId != -1L) {
                val now = System.currentTimeMillis()
                smsMessageRepository.updateDeliveredResult(
                    id = smsMessageId,
                    status = SmsMessageStatus.DELIVERED,
                    deliveredAt = now
                )
                AppLogger.i(TAG, "SMS #$smsMessageId delivered to recipient: $phoneNumber")
            }
        } else {
            AppLogger.w(TAG, "SMS #$smsMessageId delivery confirmation failed or unsupported by carrier (Code: $resultCode)")
        }
    }

    private fun mapSmsErrorCode(code: Int): String {
        return when (code) {
            SmsManager.RESULT_ERROR_NO_SERVICE ->
                "SMS could not be sent because your selected SIM currently has no mobile service."
            SmsManager.RESULT_ERROR_RADIO_OFF ->
                "Mobile radio or airplane mode is currently active. Turn off airplane mode to send SMS."
            SmsManager.RESULT_ERROR_NULL_PDU ->
                "Carrier rejected SMS dispatch (Null PDU error)."
            SmsManager.RESULT_ERROR_LIMIT_EXCEEDED ->
                "Device SMS dispatch limit exceeded by operating system."
            SmsManager.RESULT_ERROR_GENERIC_FAILURE ->
                "Carrier network generic transmission failure."
            else ->
                "SMS transmission failed with carrier result code: $code"
        }
    }
}
