package com.misscall.whatsappassistant.presentation.followups

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferences
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.database.entity.CallEventEntity
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

private fun CallEventEntity.toCallEventModel(): CallEvent = CallEvent(
    id = id,
    phoneNumber = phoneNumber,
    normalizedPhoneNumber = normalizedPhoneNumber,
    callerName = callerName,
    timestamp = timestamp,
    direction = try { CallDirection.valueOf(direction) } catch (e: Exception) { CallDirection.INCOMING },
    status = try { CallStatus.valueOf(status) } catch (e: Exception) { CallStatus.UNKNOWN },
    source = try { CallDetectionSource.valueOf(source) } catch (e: Exception) { CallDetectionSource.CALL_SCREENING },
    processed = processed,
    whatsappStatus = try { WhatsAppFollowUpStatus.valueOf(whatsappStatus) } catch (e: Exception) { WhatsAppFollowUpStatus.PENDING },
    templateId = templateId,
    notes = notes,
    createdAt = createdAt,
    updatedAt = updatedAt
)

private data class FollowUpContent(
    val events: List<CallEventEntity>,
    val customerMap: Map<String, CustomerEntity>,
    val prefs: UserPreferences
)

private data class FollowUpControl(
    val filter: FollowUpFilter,
    val userMessage: String?,
    val templateContent: String
)

@HiltViewModel
class FollowUpsViewModel @Inject constructor(
    private val callEventDao: CallEventDao,
    private val customerDao: CustomerDao,
    private val templateDao: MessageTemplateDao,
    private val preferencesRepository: UserPreferencesRepository,
    private val whatsAppProviderManager: WhatsAppProviderManager
) : ViewModel() {

    private val _activeFilter = MutableStateFlow(FollowUpFilter.PENDING)
    private val _userMessage = MutableStateFlow<String?>(null)
    private val _defaultTemplate = MutableStateFlow("Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?")

    init {
        viewModelScope.launch {
            val template = templateDao.getDefaultTemplate()?.toDomainModel()
            if (template != null) {
                _defaultTemplate.value = template.content
            }
        }
    }

    private val contentFlow = combine(
        callEventDao.getAllCallEventsFlow(),
        customerDao.getAllCustomersFlow(),
        preferencesRepository.userPreferencesFlow
    ) { events: List<CallEventEntity>, customers: List<CustomerEntity>, prefs: UserPreferences ->
        FollowUpContent(
            events = events,
            customerMap = customers.associateBy { it.phoneNumber },
            prefs = prefs
        )
    }

    private val controlFlow = combine(
        _activeFilter,
        _userMessage,
        _defaultTemplate
    ) { filter: FollowUpFilter, userMsg: String?, template: String ->
        FollowUpControl(
            filter = filter,
            userMessage = userMsg,
            templateContent = template
        )
    }

    val uiState: StateFlow<FollowUpsUiState> = combine(contentFlow, controlFlow) { content, control ->
        val missedEvents = content.events
            .map { it.toCallEventModel() }
            .filter { it.status == CallStatus.MISSED }

        val mappedItems = missedEvents.map { event ->
            val customerEntity = content.customerMap[event.normalizedPhoneNumber] ?: content.customerMap[event.phoneNumber]
            val customerName = customerEntity?.name ?: event.callerName
            val suggestedMessage = TemplateParser.parse(
                template = control.templateContent,
                callerName = customerName,
                phoneNumber = event.phoneNumber,
                businessName = content.prefs.businessName,
                ownerName = content.prefs.ownerName,
                timestamp = event.timestamp
            )
            FollowUpItem(
                callEvent = event,
                suggestedMessage = suggestedMessage,
                customerName = customerName
            )
        }

        val pendingCount = mappedItems.count {
            it.callEvent.whatsappStatus == WhatsAppFollowUpStatus.PENDING ||
                    it.callEvent.whatsappStatus == WhatsAppFollowUpStatus.SCHEDULED
        }
        val sentCount = mappedItems.count { it.callEvent.whatsappStatus == WhatsAppFollowUpStatus.SENT }
        val totalCount = mappedItems.size

        val filteredItems = mappedItems.filter { item ->
            when (control.filter) {
                FollowUpFilter.PENDING -> item.callEvent.whatsappStatus == WhatsAppFollowUpStatus.PENDING ||
                        item.callEvent.whatsappStatus == WhatsAppFollowUpStatus.SCHEDULED
                FollowUpFilter.SENT -> item.callEvent.whatsappStatus == WhatsAppFollowUpStatus.SENT
                FollowUpFilter.ALL -> true
            }
        }.sortedByDescending { it.callEvent.timestamp }

        FollowUpsUiState(
            isLoading = false,
            items = filteredItems,
            activeFilter = control.filter,
            pendingCount = pendingCount,
            sentCount = sentCount,
            totalCount = totalCount,
            userMessage = control.userMessage
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = FollowUpsUiState(isLoading = true)
    )

    fun setFilter(filter: FollowUpFilter) {
        _activeFilter.value = filter
    }

    fun sendWhatsApp(callEvent: CallEvent, message: String) {
        viewModelScope.launch {
            try {
                whatsAppProviderManager.sendMessage(callEvent.phoneNumber, message)
                callEventDao.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.SENT.name)
                _userMessage.value = "WhatsApp message sent"
            } catch (e: Exception) {
                _userMessage.value = "Failed to send WhatsApp message: ${e.message}"
            }
        }
    }

    fun markAsIgnored(callEvent: CallEvent) {
        viewModelScope.launch {
            callEventDao.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.IGNORED.name)
            _userMessage.value = "Follow-up ignored"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
