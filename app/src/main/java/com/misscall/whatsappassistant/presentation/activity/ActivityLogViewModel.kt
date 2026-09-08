package com.misscall.whatsappassistant.presentation.activity

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ActivityLogViewModel @Inject constructor(
    private val activityLogRepository: ActivityLogRepository
) : ViewModel() {

    private val _selectedChannel = MutableStateFlow<ChannelType?>(null)
    private val _userMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<ActivityLogUiState> = combine(
        activityLogRepository.getAllActivityLogsFlow(),
        activityLogRepository.getSuccessCountFlow(),
        activityLogRepository.getFailureCountFlow(),
        _selectedChannel,
        _userMessage
    ) { logs, success, failure, channel, msg ->
        val filtered = if (channel != null) logs.filter { it.channelType == channel } else logs
        ActivityLogUiState(
            logs = logs,
            filteredLogs = filtered,
            selectedChannel = channel,
            successCount = success,
            failureCount = failure,
            isLoading = false,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ActivityLogUiState(isLoading = true)
    )

    fun filterByChannel(channel: ChannelType?) {
        _selectedChannel.value = channel
    }

    fun clearAllLogs() {
        viewModelScope.launch {
            activityLogRepository.clearAllActivityLogs()
            _userMessage.value = "All activity logs cleared"
        }
    }

    fun deleteLog(id: Long) {
        viewModelScope.launch {
            activityLogRepository.deleteActivityLog(id)
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
