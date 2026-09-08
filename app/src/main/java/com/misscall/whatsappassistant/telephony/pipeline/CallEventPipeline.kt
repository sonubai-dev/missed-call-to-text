package com.misscall.whatsappassistant.telephony.pipeline

import com.misscall.whatsappassistant.automation.engine.AutomationEngine
import com.misscall.whatsappassistant.automation.worker.WorkManagerHelper
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.usecase.ProcessResult
import com.misscall.whatsappassistant.notifications.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallEventPipeline @Inject constructor(
    private val callEventRepository: CallEventRepository,
    private val automationEngine: AutomationEngine,
    private val workManagerHelper: WorkManagerHelper,
    private val notificationHelper: NotificationHelper,
    private val preferencesRepository: UserPreferencesRepository,
    private val processMissedCallSmsUseCase: com.misscall.whatsappassistant.domain.usecase.sms.ProcessMissedCallSmsUseCase,
    private val callEventDeduplicator: CallEventDeduplicator
) {

    private val pipelineMutex = Mutex()
    private val scope = CoroutineScope(Dispatchers.IO)

    // In-memory active call state tracker
    @Volatile
    private var activeRingingNumber: String? = null
    @Volatile
    private var activeRingingCallId: Long? = null
    @Volatile
    private var wasCallAnswered: Boolean = false

    companion object {
        private const val TAG = "CallEventPipeline"
    }

    /**
     * Path A: Received from CallScreeningService
     */
    suspend fun onCallScreeningRinging(
        rawPhoneNumber: String,
        callHandle: String,
        timestamp: Long,
        connectTime: Long?,
        source: CallDetectionSource = CallDetectionSource.CALL_SCREENING
    ) {
        pipelineMutex.withLock {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val callEvent = callEventDeduplicator.getOrCreateCanonicalEvent(
                rawPhoneNumber = rawPhoneNumber,
                countryCode = prefs.defaultCountryCode,
                timestamp = timestamp,
                source = source,
                initialStatus = CallStatus.RINGING
            ) ?: return

            activeRingingNumber = callEvent.normalizedPhoneNumber
            activeRingingCallId = callEvent.id
            if (connectTime != null && connectTime > 0) {
                wasCallAnswered = true
            }
        }
    }

    /**
     * Path B: Received from TelephonyCallback / PhoneStateListener
     */
    suspend fun onTelephonyRinging(
        rawPhoneNumber: String?,
        timestamp: Long = System.currentTimeMillis()
    ) {
        pipelineMutex.withLock {
            wasCallAnswered = false
            if (!rawPhoneNumber.isNullOrBlank()) {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                val callEvent = callEventDeduplicator.getOrCreateCanonicalEvent(
                    rawPhoneNumber = rawPhoneNumber,
                    countryCode = prefs.defaultCountryCode,
                    timestamp = timestamp,
                    source = CallDetectionSource.TELEPHONY_CALLBACK,
                    initialStatus = CallStatus.RINGING
                ) ?: return

                activeRingingNumber = callEvent.normalizedPhoneNumber
                activeRingingCallId = callEvent.id
            }
        }
    }

    suspend fun onTelephonyOffhook(timestamp: Long = System.currentTimeMillis()) {
        pipelineMutex.withLock {
            AppLogger.i(TAG, "Call entered OFFHOOK (Answered) at $timestamp")
            wasCallAnswered = true
            activeRingingCallId?.let { id ->
                callEventRepository.updateCallStatus(id, CallStatus.ANSWERED)
                callEventRepository.markProcessed(id, true)
            }
        }
    }

    suspend fun onTelephonyIdle(timestamp: Long = System.currentTimeMillis()) {
        pipelineMutex.withLock {
            AppLogger.i(TAG, "Call entered IDLE. wasCallAnswered=$wasCallAnswered, activeRingingCallId=$activeRingingCallId")

            val currentCallId = activeRingingCallId
            val currentNumber = activeRingingNumber

            if (currentCallId != null && !wasCallAnswered && !currentNumber.isNullOrBlank()) {
                // Verified Missed Call!
                AppLogger.i(TAG, "Call #$currentCallId transitioned to MISSED state!")
                callEventRepository.updateCallStatus(currentCallId, CallStatus.MISSED)

                // Dispatch to follow-up automation
                processMissedCallEvent(currentCallId, currentNumber, timestamp)
            } else if (currentCallId != null && wasCallAnswered) {
                callEventRepository.updateCallStatus(currentCallId, CallStatus.ANSWERED)
                callEventRepository.markProcessed(currentCallId, true)
            }

            // Reset in-memory session
            activeRingingNumber = null
            activeRingingCallId = null
            wasCallAnswered = false
        }
    }

    /**
     * Path C / Direct Missed Call (from CallLog ContentObserver or Simulator)
     */
    suspend fun onDirectMissedCall(
        phoneNumber: String,
        callerName: String?,
        timestamp: Long,
        source: CallDetectionSource = CallDetectionSource.CALL_LOG
    ) {
        pipelineMutex.withLock {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val callEvent = callEventDeduplicator.getOrCreateCanonicalEvent(
                rawPhoneNumber = phoneNumber,
                countryCode = prefs.defaultCountryCode,
                timestamp = timestamp,
                source = source,
                initialStatus = CallStatus.MISSED,
                callerName = callerName
            ) ?: return

            if (callEvent.status != CallStatus.MISSED) {
                callEventRepository.updateCallStatus(callEvent.id, CallStatus.MISSED)
            }
            
            if (callEvent.processed) {
                AppLogger.d(TAG, "Direct missed call event #${callEvent.id} already processed. Skipping duplicate dispatch.")
                return
            }

            processMissedCallEvent(callEvent.id, callEvent.normalizedPhoneNumber, timestamp, callerName)
        }
    }

    private suspend fun processMissedCallEvent(
        callId: Long,
        normalizedNumber: String,
        timestamp: Long,
        callerName: String? = null
    ) {
        try {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val result = automationEngine.evaluateAndProcess(
                callEventId = callId,
                phoneNumber = normalizedNumber,
                callerName = callerName,
                timestamp = timestamp
            )

            when (result) {
                is ProcessResult.AutoDispatched -> {
                    callEventRepository.updateWhatsAppStatus(callId, WhatsAppFollowUpStatus.SENT)
                    callEventRepository.markProcessed(callId, true)
                    AppLogger.i(TAG, "Auto-dispatched follow-up via ${result.channel} for #$callId (Rule: ${result.rule.name})")
                }

                is ProcessResult.AutoScheduled -> {
                    callEventRepository.updateWhatsAppStatus(callId, WhatsAppFollowUpStatus.SCHEDULED)
                    callEventRepository.markProcessed(callId, true)

                    workManagerHelper.scheduleFollowUp(
                        callEventId = callId,
                        phoneNumber = result.callEvent.phoneNumber,
                        messageText = result.formattedMessage,
                        templateId = result.callEvent.templateId,
                        delayMinutes = result.delayMinutes
                    )

                    if (prefs.notifyOnMissedCall) {
                        notificationHelper.showMissedCallNotification(
                            callEvent = result.callEvent.copy(id = callId),
                            formattedMessage = result.formattedMessage,
                            reason = "Auto-sending in ${result.delayMinutes} min",
                            customerId = result.customer.id
                        )
                    }
                    AppLogger.i(TAG, "Scheduled auto follow-up for #$callId in ${result.delayMinutes} mins")
                }

                is ProcessResult.NotificationOnly -> {
                    callEventRepository.updateWhatsAppStatus(callId, WhatsAppFollowUpStatus.PENDING)
                    callEventRepository.markProcessed(callId, true)

                    if (prefs.notifyOnMissedCall) {
                        notificationHelper.showMissedCallNotification(
                            callEvent = result.callEvent.copy(id = callId),
                            formattedMessage = result.formattedMessage,
                            reason = result.reason,
                            customerId = result.customer.id
                        )
                    }
                    AppLogger.i(TAG, "Generated manual follow-up notification for #$callId (${result.reason})")
                }

                is ProcessResult.Ignored -> {
                    callEventRepository.updateWhatsAppStatus(callId, WhatsAppFollowUpStatus.IGNORED)
                    callEventRepository.markProcessed(callId, true)
                    AppLogger.i(TAG, "Call #$callId ignored by rules engine (${result.reason})")
                }
            }

            // Also process Native SIM SMS channel independently
            try {
                val customer = when (result) {
                    is ProcessResult.AutoDispatched -> result.customer
                    is ProcessResult.AutoScheduled -> result.customer
                    is ProcessResult.NotificationOnly -> result.customer
                    is ProcessResult.Ignored -> result.customer
                }
                processMissedCallSmsUseCase(
                    callEventId = callId,
                    customer = customer,
                    phoneNumber = normalizedNumber,
                    timestamp = timestamp
                )
            } catch (smsEx: Exception) {
                AppLogger.e(TAG, "Error executing missed-call SMS workflow: ${smsEx.message}", smsEx)
            }
        } catch (e: Exception) {
            AppLogger.e(TAG, "Failed to process missed call #$callId", e)
        }
    }

    /**
     * Recovery logic: Survives Process Death & Device Reboot
     */
    fun reconcileUnprocessedEvents() {
        scope.launch {
            try {
                val unprocessed = callEventRepository.getUnprocessedMissedCalls()
                AppLogger.i(TAG, "Reconciling ${unprocessed.size} unprocessed missed call events on startup/reboot")
                for (event in unprocessed) {
                    processMissedCallEvent(
                        callId = event.id,
                        normalizedNumber = event.normalizedPhoneNumber,
                        timestamp = event.timestamp,
                        callerName = event.callerName
                    )
                }
            } catch (e: Exception) {
                AppLogger.e(TAG, "Error during event reconciliation", e)
            }
        }
    }
}
