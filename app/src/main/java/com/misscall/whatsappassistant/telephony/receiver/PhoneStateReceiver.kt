package com.misscall.whatsappassistant.telephony.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class PhoneStateReceiver : BroadcastReceiver() {

    @Inject
    lateinit var callEventPipeline: CallEventPipeline

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        @Suppress("DEPRECATION")
        val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

        AppLogger.d(TAG, "PhoneStateReceiver onReceive: state=$stateStr, number=$number")

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (stateStr) {
                    TelephonyManager.EXTRA_STATE_RINGING -> {
                        callEventPipeline.onTelephonyRinging(number)
                    }
                    TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                        callEventPipeline.onTelephonyOffhook()
                    }
                    TelephonyManager.EXTRA_STATE_IDLE -> {
                        callEventPipeline.onTelephonyIdle()
                    }
                }
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        private const val TAG = "PhoneStateReceiver"
    }
}
