package com.misscall.whatsappassistant.telephony.screening

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import androidx.annotation.RequiresApi
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@RequiresApi(Build.VERSION_CODES.Q)
@AndroidEntryPoint
class MissedCallScreeningService : CallScreeningService() {

    @Inject
    lateinit var callEventPipeline: CallEventPipeline

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onScreenCall(callDetails: Call.Details) {
        val startTime = System.currentTimeMillis()
        AppLogger.i(TAG, "onScreenCall received from Telecom subsystem")

        // 1. Immediately build non-intrusive CallResponse (NEVER block/reject/silence)
        val response = CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .setSilenceCall(false)
            .setSkipCallLog(false)
            .setSkipNotification(false)
            .build()

        // 2. Respond immediately to comply with 5-second Android Telecom timeout limit (<10ms)
        respondToCall(callDetails, response)
        val elapsed = System.currentTimeMillis() - startTime
        AppLogger.d(TAG, "Responded to CallScreeningService in ${elapsed}ms")

        // 3. Extract call metadata
        val handle = callDetails.handle
        val rawNumber = handle?.schemeSpecificPart ?: handle?.toString() ?: ""
        val callHandleString = handle?.toString() ?: ""
        val direction = if (callDetails.callDirection == Call.Details.DIRECTION_INCOMING) {
            CallDirection.INCOMING
        } else {
            CallDirection.OUTGOING
        }
        val creationTimestamp = if (callDetails.creationTimeMillis > 0) {
            callDetails.creationTimeMillis
        } else {
            System.currentTimeMillis()
        }
        val connectTime = if (callDetails.connectTimeMillis > 0) callDetails.connectTimeMillis else null

        AppLogger.i(TAG, "Captured incoming call from ScreeningService: rawNumber=$rawNumber, direction=$direction, time=$creationTimestamp")

        // 4. Perform heavy processing asynchronously without blocking main/telecom thread
        if (rawNumber.isNotBlank() && direction == CallDirection.INCOMING) {
            serviceScope.launch {
                try {
                    callEventPipeline.onCallScreeningRinging(
                        rawPhoneNumber = rawNumber,
                        callHandle = callHandleString,
                        timestamp = creationTimestamp,
                        connectTime = connectTime,
                        source = CallDetectionSource.CALL_SCREENING
                    )
                } catch (e: Exception) {
                    AppLogger.e(TAG, "Error processing call screening event in pipeline", e)
                }
            }
        }
    }

    companion object {
        private const val TAG = "MissedCallScreeningService"
    }
}
