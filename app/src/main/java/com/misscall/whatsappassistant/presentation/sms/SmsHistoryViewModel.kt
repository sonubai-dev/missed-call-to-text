package com.misscall.whatsappassistant.presentation.sms

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.automation.worker.WorkManagerHelper
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
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
class SmsHistoryViewModel @Inject constructor(
    private val smsMessageRepository: SmsMessageRepository,
    private val sendSmsUseCase: SendSmsUseCase,
    private val simManager: SmsSimManager,
    private val workManagerHelper: WorkManagerHelper
) : ViewModel() {

    private val _selectedFilter = MutableStateFlow<SmsMessageStatus?>(null)
    private val _userMessage = MutableStateFlow<String?>(null)

    private val countsFlow = combine(
        smsMessageRepository.getTotalSmsCountFlow(),
        smsMessageRepository.getSentCountFlow(),
        smsMessageRepository.getFailedCountFlow(),
        smsMessageRepository.getScheduledCountFlow()
    ) { total, sent, failed, scheduled ->
        listOf(total, sent, failed, scheduled)
    }

    val uiState: StateFlow<SmsHistoryUiState> = combine(
        smsMessageRepository.getAllSmsFlow(),
        countsFlow,
        _selectedFilter,
        _userMessage
    ) { msgs, counts, filter, message ->
        val filtered = if (filter != null) msgs.filter { it.status == filter } else msgs
        SmsHistoryUiState(
            messages = msgs,
            filteredMessages = filtered,
            selectedFilter = filter,
            totalCount = counts[0],
            sentCount = counts[1],
            failedCount = counts[2],
            scheduledCount = counts[3],
            isLoading = false,
            userMessage = message
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SmsHistoryUiState(isLoading = true)
    )

    fun setFilter(status: SmsMessageStatus?) {
        _selectedFilter.value = status
    }

    fun retrySms(smsId: Long) {
        viewModelScope.launch {
            _userMessage.value = "Retrying SMS #$smsId..."
            sendSmsUseCase(smsMessageId = smsId, isAutomatic = false)
        }
    }

    fun cancelScheduledSms(smsId: Long) {
        viewModelScope.launch {
            workManagerHelper.cancelSms(smsId)
            smsMessageRepository.updateStatus(smsId, SmsMessageStatus.CANCELLED)
            _userMessage.value = "Scheduled SMS #$smsId cancelled."
        }
    }

    fun deleteSms(smsId: Long) {
        viewModelScope.launch {
            smsMessageRepository.deleteSmsById(smsId)
            _userMessage.value = "SMS deleted."
        }
    }

    fun clearAllSms() {
        viewModelScope.launch {
            smsMessageRepository.clearAllSms()
            _userMessage.value = "All SMS history cleared."
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
