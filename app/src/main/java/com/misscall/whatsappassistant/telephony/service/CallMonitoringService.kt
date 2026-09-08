package com.misscall.whatsappassistant.telephony.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.provider.CallLog
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.notifications.NotificationHelper
import com.misscall.whatsappassistant.telephony.observer.CallLogObserver
import com.misscall.whatsappassistant.telephony.tracker.TelephonyCallStateManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class CallMonitoringService : Service() {

    @Inject
    lateinit var notificationHelper: NotificationHelper

    @Inject
    lateinit var callLogObserver: CallLogObserver

    @Inject
    lateinit var telephonyCallStateManager: TelephonyCallStateManager

    private var isObserverRegistered = false

    override fun onCreate() {
        super.onCreate()
        AppLogger.i(TAG, "CallMonitoringService created")
        startForegroundWithNotification()
        startMonitoring()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == ACTION_STOP_SERVICE) {
            AppLogger.i(TAG, "Stopping CallMonitoringService")
            stopMonitoring()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        startForegroundWithNotification()
        startMonitoring()

        return START_STICKY
    }

    private fun startForegroundWithNotification() {
        val notification = notificationHelper.buildForegroundServiceNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                Constants.MONITORING_NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                Constants.MONITORING_NOTIFICATION_ID,
                notification,
                0
            )
        } else {
            startForeground(Constants.MONITORING_NOTIFICATION_ID, notification)
        }
    }

    private fun startMonitoring() {
        // Start Telephony state tracking
        telephonyCallStateManager.startListening()

        // Register ContentObserver for CallLog if permitted
        if (!isObserverRegistered) {
            try {
                contentResolver.registerContentObserver(
                    CallLog.Calls.CONTENT_URI,
                    true,
                    callLogObserver
                )
                isObserverRegistered = true
                AppLogger.d(TAG, "CallLog ContentObserver registered")
            } catch (e: SecurityException) {
                AppLogger.w(TAG, "READ_CALL_LOG not granted for ContentObserver", e)
            }
        }
    }

    private fun stopMonitoring() {
        telephonyCallStateManager.stopListening()
        if (isObserverRegistered) {
            try {
                contentResolver.unregisterContentObserver(callLogObserver)
                isObserverRegistered = false
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
        AppLogger.i(TAG, "CallMonitoringService destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val TAG = "CallMonitoringService"
        const val ACTION_START_SERVICE = "com.misscall.whatsappassistant.START_SERVICE"
        const val ACTION_STOP_SERVICE = "com.misscall.whatsappassistant.STOP_SERVICE"

        fun startService(context: Context) {
            val intent = Intent(context, CallMonitoringService::class.java).apply {
                action = ACTION_START_SERVICE
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, CallMonitoringService::class.java).apply {
                action = ACTION_STOP_SERVICE
            }
            context.startService(intent)
        }
    }
}
