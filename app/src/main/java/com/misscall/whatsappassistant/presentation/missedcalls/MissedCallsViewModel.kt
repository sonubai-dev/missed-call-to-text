package com.misscall.whatsappassistant.presentation.missedcalls

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import com.misscall.whatsappassistant.domain.usecase.SendWhatsAppMessageUseCase
import com.misscall.whatsappassistant.domain.usecase.sms.SendSmsOutcome
import com.misscall.whatsappassistant.domain.usecase.sms.SendSmsUseCase
import com.misscall.whatsappassistant.telephony.sms.SmsSimManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MissedCallsViewModel @Inject constructor(
    private val callEventRepository: CallEventRepository,
    private val templateRepository: TemplateRepository,
    private val sendWhatsAppMessageUseCase: SendWhatsAppMessageUseCase,
    private val smsSimManager: SmsSimManager,
    private val smsMessageRepository: SmsMessageRepository,
    private val sendSmsUseCase: SendSmsUseCase,
    private val preferencesRepository: UserPreferencesRepository
) : ViewModel() {

    private val _activeFilter = MutableStateFlow(CallFilter.ALL)
    private val _searchQuery = MutableStateFlow("")
    private val _userMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<MissedCallsUiState> = combine(
        callEventRepository.getAllCallEventsFlow(),
        templateRepository.getAllTemplatesFlow(),
        preferencesRepository.userPreferencesFlow,
        _activeFilter,
        _searchQuery
    ) { calls, templates, prefs, filter, query ->
        val filtered = calls.filter { call ->
            val matchesFilter = when (filter) {
                CallFilter.ALL -> true
                CallFilter.PENDING -> call.whatsappStatus == WhatsAppFollowUpStatus.PENDING || call.whatsappStatus == WhatsAppFollowUpStatus.SCHEDULED
                CallFilter.SENT -> call.whatsappStatus == WhatsAppFollowUpStatus.SENT
                CallFilter.IGNORED -> call.whatsappStatus == WhatsAppFollowUpStatus.IGNORED || call.whatsappStatus == WhatsAppFollowUpStatus.SKIPPED
            }
            val matchesQuery = query.isBlank() ||
                    call.phoneNumber.contains(query, ignoreCase = true) ||
                    call.normalizedPhoneNumber.contains(query, ignoreCase = true) ||
                    (call.callerName?.contains(query, ignoreCase = true) == true)
            matchesFilter && matchesQuery
        }

        val activeSims = smsSimManager.getActiveSimCards()
        val defaultSub = if (prefs.selectedSmsSubscriptionId != SmsSimManager.SUBSCRIPTION_ID_DEFAULT) {
            prefs.selectedSmsSubscriptionId
        } else {
            smsSimManager.getDefaultSmsSubscriptionId()
        }

        MissedCallsUiState(
            calls = calls,
            filteredCalls = filtered,
            templates = templates,
            availableSims = activeSims,
            defaultSubId = defaultSub,
            activeFilter = filter,
            searchQuery = query,
            userMessage = _userMessage.value
        )
    }.combine(_userMessage) { state, msg ->
        state.copy(userMessage = msg)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = MissedCallsUiState(isLoading = true)
    )

    fun setFilter(filter: CallFilter) {
        _activeFilter.value = filter
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun markAsIgnored(callEvent: CallEvent) {
        viewModelScope.launch {
            callEventRepository.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.IGNORED)
            callEventRepository.markProcessed(callEvent.id, true)
            _userMessage.value = "Call marked as ignored"
        }
    }

    fun deleteCallEvent(callEvent: CallEvent) {
        viewModelScope.launch {
            callEventRepository.deleteCallEvent(callEvent.id)
            _userMessage.value = "Call record removed"
        }
    }

    fun sendFollowUp(callEvent: CallEvent, messageText: String, templateId: Long?) {
        viewModelScope.launch {
            val success = sendWhatsAppMessageUseCase(
                callEventId = callEvent.id,
                phoneNumber = callEvent.phoneNumber,
                messageContent = messageText,
                templateId = templateId
            )
            _userMessage.value = if (success) "Opening WhatsApp..." else "Failed to open WhatsApp"
        }
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            callEventRepository.clearAllCallEvents()
            _userMessage.value = "Call logs cleared"
        }
    }

    fun sendNativeSms(callEvent: CallEvent, messageText: String, subscriptionId: Int?) {
        viewModelScope.launch {
            val sms = SmsMessage(
                callEventId = callEvent.id,
                phoneNumber = callEvent.phoneNumber,
                message = messageText,
                status = SmsMessageStatus.SCHEDULED,
                subscriptionId = subscriptionId,
                scheduledAt = System.currentTimeMillis()
            )
            val id = smsMessageRepository.insertSms(sms)
            when (val outcome = sendSmsUseCase(id, isAutomatic = false)) {
                is SendSmsOutcome.Success -> _userMessage.value = "Native SMS dispatched successfully"
                is SendSmsOutcome.DuplicateSkipped -> _userMessage.value = "Duplicate SMS protection skipped"
                is SendSmsOutcome.Failed -> _userMessage.value = "Failed to send SMS: ${outcome.reason}"
            }
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
