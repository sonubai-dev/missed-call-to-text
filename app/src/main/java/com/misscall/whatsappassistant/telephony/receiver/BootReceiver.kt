package com.misscall.whatsappassistant.telephony.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import com.misscall.whatsappassistant.telephony.service.CallMonitoringService
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var preferencesRepository: UserPreferencesRepository

    @Inject
    lateinit var callEventPipeline: CallEventPipeline

    @Inject
    lateinit var smsMessageRepository: com.misscall.whatsappassistant.domain.repository.SmsMessageRepository

    @Inject
    lateinit var workManagerHelper: com.misscall.whatsappassistant.automation.worker.WorkManagerHelper

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            AppLogger.i(TAG, "Boot event received: $action. Reconciling pipeline and restarting service.")
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    // 1. Reconcile any events interrupted by device shutdown/reboot
                    callEventPipeline.reconcileUnprocessedEvents()



                    // 3. Restart Foreground Monitoring Service if enabled
                    val prefs = preferencesRepository.userPreferencesFlow.first()
                    if (prefs.isMonitoringServiceEnabled) {
                        val serviceIntent = Intent(context, CallMonitoringService::class.java)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent)
                        } else {
                            context.startService(serviceIntent)
                        }
                    }
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }

    companion object {
        private const val TAG = "BootReceiver"
    }
}
