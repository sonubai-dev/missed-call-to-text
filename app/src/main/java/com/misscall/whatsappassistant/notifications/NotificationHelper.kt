package com.misscall.whatsappassistant.notifications

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.misscall.whatsappassistant.MainActivity
import com.misscall.whatsappassistant.R
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.notifications.receiver.NotificationActionReceiver
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                Constants.NOTIFICATION_CHANNEL_SERVICE,
                context.getString(R.string.monitoring_service_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.monitoring_service_channel_desc)
                setShowBadge(false)
            }

            val missedCallChannel = NotificationChannel(
                Constants.NOTIFICATION_CHANNEL_MISSED_CALL,
                context.getString(R.string.missed_call_channel_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.missed_call_channel_desc)
                enableVibration(true)
                setShowBadge(true)
            }

            val followUpSentChannel = NotificationChannel(
                Constants.NOTIFICATION_CHANNEL_SENT,
                context.getString(R.string.follow_up_sent_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.follow_up_sent_channel_desc)
            }

            notificationManager.createNotificationChannels(
                listOf(serviceChannel, missedCallChannel, followUpSentChannel)
            )
        }
    }

    fun buildForegroundServiceNotification(): Notification {
        val appIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            appIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(context, Constants.NOTIFICATION_CHANNEL_SERVICE)
            .setContentTitle("MissCall WhatsApp Assistant")
            .setContentText(context.getString(R.string.monitoring_service_running))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    fun showMissedCallNotification(
        callEvent: CallEvent,
        formattedMessage: String,
        reason: String? = null,
        customerId: Long = 0L
    ) {
        val notificationId = (callEvent.id.toInt().takeIf { it != 0 } ?: (callEvent.timestamp % 100000).toInt())

        // App intent
        val appIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(Constants.EXTRA_CALL_EVENT_ID, callEvent.id)
            putExtra(Constants.EXTRA_PHONE_NUMBER, callEvent.phoneNumber)
            if (customerId != 0L) {
                putExtra(Constants.EXTRA_CUSTOMER_ID, customerId)
            }
        }
        val contentPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            appIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Action: Reply (Opens WhatsApp workflow)
        val replyIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = Constants.ACTION_SEND_NOW
            putExtra(Constants.EXTRA_CALL_EVENT_ID, callEvent.id)
            putExtra(Constants.EXTRA_PHONE_NUMBER, callEvent.phoneNumber)
            putExtra(Constants.EXTRA_MESSAGE_TEXT, formattedMessage)
            putExtra(Constants.EXTRA_NOTIFICATION_ID, notificationId)
        }
        val replyPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + 1,
            replyIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Action: Ignore
        val ignoreIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = Constants.ACTION_IGNORE
            putExtra(Constants.EXTRA_CALL_EVENT_ID, callEvent.id)
            putExtra(Constants.EXTRA_NOTIFICATION_ID, notificationId)
        }
        val ignorePendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + 2,
            ignoreIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val callerDisplayName = if (!callEvent.callerName.isNullOrBlank() && callEvent.callerName != callEvent.phoneNumber) {
            callEvent.callerName
        } else {
            NumberNormalizer.formatDisplay(callEvent.normalizedPhoneNumber)
        }
        val title = "Missed call from $callerDisplayName"

        val notification = NotificationCompat.Builder(context, Constants.NOTIFICATION_CHANNEL_MISSED_CALL)
            .setContentTitle(title)
            .setContentText("Tap to follow up with $callerDisplayName")
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "$title\n\nSuggested reply:\n\"$formattedMessage\""
                )
            )
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(contentPendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .addAction(0, "Reply", replyPendingIntent)
            .addAction(0, "Ignore", ignorePendingIntent)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (e: SecurityException) {
            // Notification permission might not be granted
        }
    }

    fun showFollowUpDispatchedNotification(phoneNumber: String, messageText: String) {
        val notificationId = (System.currentTimeMillis() % 100000).toInt()

        val notification = NotificationCompat.Builder(context, Constants.NOTIFICATION_CHANNEL_SENT)
            .setContentTitle("WhatsApp Follow-up Sent")
            .setContentText("To $phoneNumber: $messageText")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (e: SecurityException) {
            // Handled
        }
    }

    fun showFollowUpFailedNotification(phoneNumber: String, reason: String) {
        val notificationId = (System.currentTimeMillis() % 100000).toInt()

        val notification = NotificationCompat.Builder(context, Constants.NOTIFICATION_CHANNEL_SENT)
            .setContentTitle("Follow-up Failed")
            .setContentText("To $phoneNumber: $reason")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (e: SecurityException) {
            // Handled
        }
    }

    fun cancelNotification(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }
}
