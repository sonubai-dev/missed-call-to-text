package com.misscall.whatsappassistant.presentation.automation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.automation.engine.AutomationEngine
import com.misscall.whatsappassistant.automation.worker.WorkManagerHelper
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.usecase.ProcessResult
import com.misscall.whatsappassistant.notifications.NotificationHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AutomationViewModel @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository,
    private val automationEngine: AutomationEngine,
    private val workManagerHelper: WorkManagerHelper,
    private val notificationHelper: NotificationHelper,
    private val callEventRepository: CallEventRepository
) : ViewModel() {

    private val _simulationResult = MutableStateFlow<String?>(null)
    private val _isSimulating = MutableStateFlow(false)
    private val _userMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<AutomationUiState> = combine(
        preferencesRepository.userPreferencesFlow,
        _simulationResult,
        _isSimulating,
        _userMessage
    ) { prefs, simResult, isSimulating, msg ->
        AutomationUiState(
            preferences = prefs,
            simulationResult = simResult,
            isSimulating = isSimulating,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AutomationUiState(isLoading = true)
    )

    fun toggleAutoReply(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setAutoReplyEnabled(enabled)
            _userMessage.value = if (enabled) "Auto-reply enabled" else "Auto-reply disabled"
        }
    }

    fun setAutoReplyDelay(delayMinutes: Int) {
        viewModelScope.launch {
            preferencesRepository.setAutoReplyDelayMinutes(delayMinutes)
        }
    }

    fun setCooldownMinutes(minutes: Int) {
        viewModelScope.launch {
            preferencesRepository.setCooldownMinutes(minutes)
        }
    }

    fun updateWorkingHours(enabled: Boolean, startHour: Int, startMinute: Int, endHour: Int, endMinute: Int) {
        viewModelScope.launch {
            preferencesRepository.updateWorkingHours(enabled, startHour, startMinute, endHour, endMinute)
            _userMessage.value = "Working hours updated"
        }
    }

    fun setNotifyOnMissedCall(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setNotifyOnMissedCall(enabled)
        }
    }

    fun simulateMissedCall(phoneNumber: String, callerName: String?) {
        viewModelScope.launch {
            _isSimulating.value = true
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                val normalized = com.misscall.whatsappassistant.core.util.NumberNormalizer.normalize(phoneNumber, prefs.defaultCountryCode)
                val ts = System.currentTimeMillis()
                
                val callEvent = CallEvent(
                    idempotencyKey = "sim_${ts}",
                    phoneNumber = phoneNumber,
                    normalizedPhoneNumber = normalized,
                    callerName = callerName,
                    timestamp = ts,
                    direction = CallDirection.INCOMING,
                    status = CallStatus.MISSED,
                    source = CallDetectionSource.SIMULATOR
                )
                val eventId = callEventRepository.insertCallEvent(callEvent)

                val result = automationEngine.evaluateAndProcess(
                    callEventId = eventId,
                    phoneNumber = phoneNumber,
                    callerName = callerName
                )
                when (result) {
                    is ProcessResult.AutoDispatched -> {
                        _simulationResult.value = "Call processed! Auto-dispatched reply via ${result.channel} (Rule: ${result.rule.name})"
                    }
                    is ProcessResult.AutoScheduled -> {
                        workManagerHelper.scheduleFollowUp(
                            callEventId = result.callEvent.id,
                            phoneNumber = result.callEvent.phoneNumber,
                            messageText = result.formattedMessage,
                            templateId = result.callEvent.templateId,
                            delayMinutes = result.delayMinutes
                        )
                        notificationHelper.showMissedCallNotification(
                            callEvent = result.callEvent,
                            formattedMessage = result.formattedMessage,
                            reason = "Auto-scheduled in ${result.delayMinutes} min"
                        )
                        _simulationResult.value = "Call processed! Scheduled auto follow-up in ${result.delayMinutes} min.\n\nMessage:\n\"${result.formattedMessage}\""
                    }
                    is ProcessResult.NotificationOnly -> {
                        notificationHelper.showMissedCallNotification(
                            callEvent = result.callEvent,
                            formattedMessage = result.formattedMessage,
                            reason = result.reason
                        )
                        _simulationResult.value = "Call processed! Notification generated (${result.reason}).\n\nMessage:\n\"${result.formattedMessage}\""
                    }
                    is ProcessResult.Ignored -> {
                        _simulationResult.value = "Call logged but ignored by rule engine: ${result.reason}"
                    }
                }
                _userMessage.value = "Simulation complete!"
            } catch (e: Exception) {
                _simulationResult.value = "Simulation error: ${e.message}"
            } finally {
                _isSimulating.value = false
            }
        }
    }

    fun clearSimulationResult() {
        _simulationResult.value = null
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
