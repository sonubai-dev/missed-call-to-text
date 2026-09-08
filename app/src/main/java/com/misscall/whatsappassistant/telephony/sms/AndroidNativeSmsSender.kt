package com.misscall.whatsappassistant.telephony.sms

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.SmsManager
import com.misscall.whatsappassistant.core.logging.AppLogger
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AndroidNativeSmsSender @Inject constructor(
    @ApplicationContext private val context: Context,
    private val permissionManager: SmsPermissionManager,
    private val simManager: SmsSimManager
) : SmsSender {

    companion object {
        private const val TAG = "AndroidNativeSmsSender"
        const val ACTION_SMS_SENT = "com.misscall.whatsappassistant.ACTION_SMS_SENT"
        const val ACTION_SMS_DELIVERED = "com.misscall.whatsappassistant.ACTION_SMS_DELIVERED"
        const val EXTRA_SMS_MESSAGE_ID = "extra_sms_message_id"
        const val EXTRA_PHONE_NUMBER = "extra_phone_number"
        const val EXTRA_PART_INDEX = "extra_part_index"
        const val EXTRA_TOTAL_PARTS = "extra_total_parts"
    }

    override suspend fun send(
        phoneNumber: String,
        message: String,
        subscriptionId: Int?,
        smsMessageId: Long?
    ): SmsResult = withContext(Dispatchers.IO) {
        try {
            // 1. Validate inputs
            if (phoneNumber.isBlank()) {
                return@withContext SmsResult.Failure(
                    reason = "Invalid phone number provided.",
                    smsMessageId = smsMessageId
                )
            }
            if (message.isBlank()) {
                return@withContext SmsResult.Failure(
                    reason = "Cannot send an empty SMS message.",
                    smsMessageId = smsMessageId
                )
            }

            // 2. Verify SEND_SMS permission
            if (!permissionManager.hasSendSmsPermission()) {
                AppLogger.w(TAG, "SEND_SMS permission not granted. Cannot send native SMS.")
                return@withContext SmsResult.Failure(
                    reason = "SMS permission denied by user. Follow-up SMS cannot be dispatched.",
                    isPermissionDenied = true,
                    smsMessageId = smsMessageId
                )
            }

            // 3. Verify SIM / subscription availability
            val targetSubId = subscriptionId ?: SmsSimManager.SUBSCRIPTION_ID_DEFAULT
            val simCheck = simManager.verifySimAvailability(targetSubId)
            if (simCheck is SimAvailabilityResult.Missing) {
                AppLogger.w(TAG, "Selected SIM $targetSubId is currently unavailable.")
                return@withContext SmsResult.Failure(
                    reason = simCheck.message,
                    isSimUnavailable = true,
                    smsMessageId = smsMessageId
                )
            } else if (simCheck is SimAvailabilityResult.NoSimPresent) {
                AppLogger.w(TAG, "No active SIM card detected on this device.")
                return@withContext SmsResult.Failure(
                    reason = "No active SIM card detected on this device.",
                    isSimUnavailable = true,
                    smsMessageId = smsMessageId
                )
            }

            val resolvedSubId = (simCheck as? SimAvailabilityResult.Available)?.simInfo?.subscriptionId ?: targetSubId

            // 4. Resolve subscription-specific SmsManager
            @Suppress("DEPRECATION")
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val sysManager = context.getSystemService(SmsManager::class.java)
                if (resolvedSubId != SmsSimManager.SUBSCRIPTION_ID_DEFAULT) {
                    sysManager.createForSubscriptionId(resolvedSubId)
                } else {
                    sysManager
                }
            } else {
                if (resolvedSubId != SmsSimManager.SUBSCRIPTION_ID_DEFAULT) {
                    SmsManager.getSmsManagerForSubscriptionId(resolvedSubId)
                } else {
                    SmsManager.getDefault()
                }
            }

            // 5. Divide message into segments
            val parts = smsManager.divideMessage(message)
            val partsCount = parts.size
            AppLogger.i(TAG, "Dispatching native SIM SMS (SubId: $resolvedSubId, Parts: $partsCount, ID: #$smsMessageId)")

            val requestCodeBase = (smsMessageId?.toInt() ?: System.currentTimeMillis().toInt()) and 0xffff
            val sentFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

            // 6. Build PendingIntents for Sent and Delivered callbacks
            val sentIntents = ArrayList<PendingIntent>()
            val deliveryIntents = ArrayList<PendingIntent>()

            for (index in 0 until partsCount) {
                val sentIntent = Intent(ACTION_SMS_SENT).apply {
                    setPackage(context.packageName)
                    putExtra(EXTRA_SMS_MESSAGE_ID, smsMessageId ?: -1L)
                    putExtra(EXTRA_PHONE_NUMBER, phoneNumber)
                    putExtra(EXTRA_PART_INDEX, index)
                    putExtra(EXTRA_TOTAL_PARTS, partsCount)
                }
                val sentPending = PendingIntent.getBroadcast(
                    context,
                    requestCodeBase + index,
                    sentIntent,
                    sentFlags
                )
                sentIntents.add(sentPending)

                val deliveredIntent = Intent(ACTION_SMS_DELIVERED).apply {
                    setPackage(context.packageName)
                    putExtra(EXTRA_SMS_MESSAGE_ID, smsMessageId ?: -1L)
                    putExtra(EXTRA_PHONE_NUMBER, phoneNumber)
                    putExtra(EXTRA_PART_INDEX, index)
                    putExtra(EXTRA_TOTAL_PARTS, partsCount)
                }
                val deliveredPending = PendingIntent.getBroadcast(
                    context,
                    requestCodeBase + 1000 + index,
                    deliveredIntent,
                    sentFlags
                )
                deliveryIntents.add(deliveredPending)
            }

            // 7. Dispatch via Android native SmsManager
            if (partsCount > 1) {
                smsManager.sendMultipartTextMessage(
                    phoneNumber,
                    null,
                    parts,
                    sentIntents,
                    deliveryIntents
                )
            } else {
                smsManager.sendTextMessage(
                    phoneNumber,
                    null,
                    message,
                    sentIntents.firstOrNull(),
                    deliveryIntents.firstOrNull()
                )
            }

            AppLogger.i(TAG, "Native SIM SMS submitted to carrier radio queue for #$smsMessageId ($partsCount segments)")
            SmsResult.Success(partsCount = partsCount, smsMessageId = smsMessageId)
        } catch (se: SecurityException) {
            AppLogger.e(TAG, "SecurityException while sending SMS: ${se.message}", se)
            SmsResult.Failure(
                reason = "SMS permission was revoked or denied by system security policy.",
                isPermissionDenied = true,
                smsMessageId = smsMessageId
            )
        } catch (e: Exception) {
            AppLogger.e(TAG, "Unexpected error dispatching SMS: ${e.message}", e)
            SmsResult.Failure(
                reason = e.localizedMessage ?: "Failed to dispatch SMS through mobile carrier.",
                smsMessageId = smsMessageId
            )
        }
    }
}
