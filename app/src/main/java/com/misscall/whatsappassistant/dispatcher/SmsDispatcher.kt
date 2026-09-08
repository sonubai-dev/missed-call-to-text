package com.misscall.whatsappassistant.dispatcher

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import com.misscall.whatsappassistant.core.logging.AppLogger
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

sealed class SmsDispatchResult {
    data class Success(val partsCount: Int) : SmsDispatchResult()
    data class Failure(val error: String) : SmsDispatchResult()
}

@Singleton
class SmsDispatcher @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "SmsDispatcher"
        const val ACTION_SMS_SENT = "com.misscall.whatsappassistant.ACTION_SMS_SENT"
        const val ACTION_SMS_DELIVERED = "com.misscall.whatsappassistant.ACTION_SMS_DELIVERED"
    }

    suspend fun sendSms(
        recipientNumber: String,
        messageContent: String,
        subscriptionId: Int? = null
    ): SmsDispatchResult = withContext(Dispatchers.IO) {
        try {
            if (recipientNumber.isBlank() || messageContent.isBlank()) {
                return@withContext SmsDispatchResult.Failure("Invalid recipient number or empty message")
            }

            @Suppress("DEPRECATION")
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (subscriptionId != null && subscriptionId != SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                    context.getSystemService(SmsManager::class.java).createForSubscriptionId(subscriptionId)
                } else {
                    context.getSystemService(SmsManager::class.java)
                }
            } else {
                if (subscriptionId != null && subscriptionId != SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                    SmsManager.getSmsManagerForSubscriptionId(subscriptionId)
                } else {
                    SmsManager.getDefault()
                }
            }

            val parts = smsManager.divideMessage(messageContent)
            AppLogger.i(TAG, "Dispatching SMS to $recipientNumber (${parts.size} multipart fragments)")

            val sentFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val sentIntents = ArrayList<PendingIntent>()
            for (i in parts.indices) {
                val sentIntent = PendingIntent.getBroadcast(
                    context,
                    i,
                    Intent(ACTION_SMS_SENT).apply { setPackage(context.packageName) },
                    sentFlags
                )
                sentIntents.add(sentIntent)
            }

            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(recipientNumber, null, parts, sentIntents, null)
            } else {
                smsManager.sendTextMessage(recipientNumber, null, messageContent, sentIntents.firstOrNull(), null)
            }

            AppLogger.i(TAG, "SMS successfully submitted to carrier queue for $recipientNumber")
            SmsDispatchResult.Success(parts.size)
        } catch (e: Exception) {
            AppLogger.e(TAG, "Failed to send SMS to $recipientNumber: ${e.message}", e)
            SmsDispatchResult.Failure(e.localizedMessage ?: "Unknown SMS error")
        }
    }
}
