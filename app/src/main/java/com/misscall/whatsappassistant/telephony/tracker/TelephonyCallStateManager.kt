package com.misscall.whatsappassistant.telephony.tracker

import android.content.Context
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import androidx.annotation.RequiresApi
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.concurrent.Executor
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TelephonyCallStateManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val callEventPipeline: CallEventPipeline
) {

    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
    private val scope = CoroutineScope(Dispatchers.IO)

    private var telephonyCallbackApi31: Any? = null
    private var phoneStateListenerLegacy: PhoneStateListener? = null
    private var isRegistered = false

    fun startListening() {
        if (isRegistered || telephonyManager == null) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                registerApi31Callback()
            } else {
                registerLegacyListener()
            }
            isRegistered = true
            AppLogger.i(TAG, "Telephony call state listener successfully registered")
        } catch (e: SecurityException) {
            AppLogger.w(TAG, "READ_PHONE_STATE permission not granted for TelephonyListener", e)
        } catch (e: Exception) {
            AppLogger.e(TAG, "Failed to register telephony listener", e)
        }
    }

    @RequiresApi(Build.VERSION_CODES.S)
    private fun registerApi31Callback() {
        val callback = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
            override fun onCallStateChanged(state: Int) {
                handleStateChange(state, null)
            }
        }
        val executor: Executor = ContextCompatDirectExecutor()
        telephonyManager?.registerTelephonyCallback(executor, callback)
        telephonyCallbackApi31 = callback
    }

    @Suppress("DEPRECATION")
    private fun registerLegacyListener() {
        val listener = object : PhoneStateListener() {
            @Deprecated("Deprecated in Java")
            override fun onCallStateChanged(state: Int, phoneNumber: String?) {
                handleStateChange(state, phoneNumber)
            }
        }
        telephonyManager?.listen(listener, PhoneStateListener.LISTEN_CALL_STATE)
        phoneStateListenerLegacy = listener
    }

    private fun handleStateChange(state: Int, phoneNumber: String?) {
        scope.launch {
            when (state) {
                TelephonyManager.CALL_STATE_RINGING -> {
                    AppLogger.d(TAG, "Telephony state: RINGING (number: $phoneNumber)")
                    callEventPipeline.onTelephonyRinging(phoneNumber)
                }
                TelephonyManager.CALL_STATE_OFFHOOK -> {
                    AppLogger.d(TAG, "Telephony state: OFFHOOK")
                    callEventPipeline.onTelephonyOffhook()
                }
                TelephonyManager.CALL_STATE_IDLE -> {
                    AppLogger.d(TAG, "Telephony state: IDLE")
                    callEventPipeline.onTelephonyIdle()
                }
            }
        }
    }

    fun stopListening() {
        if (!isRegistered || telephonyManager == null) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                (telephonyCallbackApi31 as? TelephonyCallback)?.let {
                    telephonyManager.unregisterTelephonyCallback(it)
                }
                telephonyCallbackApi31 = null
            } else {
                phoneStateListenerLegacy?.let {
                    @Suppress("DEPRECATION")
                    telephonyManager.listen(it, PhoneStateListener.LISTEN_NONE)
                }
                phoneStateListenerLegacy = null
            }
            isRegistered = false
            AppLogger.i(TAG, "Telephony call state listener unregistered")
        } catch (e: Exception) {
            AppLogger.e(TAG, "Error unregistering telephony listener", e)
        }
    }

    private class ContextCompatDirectExecutor : Executor {
        override fun execute(command: Runnable) {
            command.run()
        }
    }

    companion object {
        private const val TAG = "TelephonyCallStateManager"
    }
}
