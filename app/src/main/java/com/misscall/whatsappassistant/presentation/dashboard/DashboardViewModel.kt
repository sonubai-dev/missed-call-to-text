package com.misscall.whatsappassistant.presentation.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferences
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CrmActivityDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.database.dao.SmsMessageDao
import com.misscall.whatsappassistant.database.entity.CallEventEntity
import com.misscall.whatsappassistant.database.entity.MessageTemplateEntity
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderManager
import com.misscall.whatsappassistant.crm.CrmSyncManager
import com.misscall.whatsappassistant.domain.model.CrmActivityType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
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

private data class TodayActivityStats(
    val missedCalls: Int = 0,
    val followUps: Int = 0,
    val whatsAppSent: Int = 0,
    val smsSent: Int = 0
)

private data class CrmMetaStats(
    val pendingFollowUps: Int = 0,
    val totalCustomers: Int = 0,
    val customerMap: Map<String, Long> = emptyMap()
)

private data class DashboardContentBundle(
    val prefs: UserPreferences,
    val allEvents: List<CallEventEntity>,
    val defaultTemplate: MessageTemplateEntity?,
    val userMsg: String?
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository,
    private val callEventDao: CallEventDao,
    private val customerDao: CustomerDao,
    private val messageLogDao: MessageLogDao,
    private val smsMessageDao: SmsMessageDao,
    private val crmActivityDao: CrmActivityDao,
    private val templateDao: MessageTemplateDao,
    private val whatsAppProviderManager: WhatsAppProviderManager,
    private val crmSyncManager: CrmSyncManager
) : ViewModel() {

    private val todayStartTimestamp: Long
        get() = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

    private val _userMessage = MutableStateFlow<String?>(null)

    private val todayActivityFlow = combine(
        callEventDao.getMissedCallCountSinceFlow(todayStartTimestamp),
        crmActivityDao.getFollowUpsCountSinceFlow(todayStartTimestamp),
        messageLogDao.getSuccessfulMessagesCountSinceFlow(todayStartTimestamp),
        smsMessageDao.getSentCountSinceFlow(todayStartTimestamp)
    ) { missed, followUps, wa, sms ->
        TodayActivityStats(
            missedCalls = missed,
            followUps = maxOf(followUps, wa + sms),
            whatsAppSent = wa,
            smsSent = sms
        )
    }

    private val crmMetaFlow = combine(
        callEventDao.getPendingFollowUpCountFlow(),
        customerDao.getTotalCustomerCountFlow(),
        customerDao.getAllCustomersFlow()
    ) { pending, totalCustomers, customers ->
        val map = buildMap {
            for (c in customers) {
                put(c.phoneNumber, c.id)
                if (c.phoneNumber.length >= 10) {
                    put(c.phoneNumber.takeLast(10), c.id)
                }
            }
        }
        CrmMetaStats(
            pendingFollowUps = pending,
            totalCustomers = totalCustomers,
            customerMap = map
        )
    }

    private val contentFlow = combine(
        preferencesRepository.userPreferencesFlow,
        callEventDao.getAllCallEventsFlow(),
        templateDao.getDefaultTemplateFlow(),
        _userMessage
    ) { prefs, allEvents, defaultTemplateEntity, userMsg ->
        DashboardContentBundle(
            prefs = prefs,
            allEvents = allEvents,
            defaultTemplate = defaultTemplateEntity,
            userMsg = userMsg
        )
    }

    val uiState: StateFlow<DashboardUiState> = combine(
        todayActivityFlow,
        crmMetaFlow,
        contentFlow
    ) { today, crm, content ->
        val recentMissed = content.allEvents
            .map { it.toCallEventModel() }
            .filter { it.status == CallStatus.MISSED }
            .take(5)

        DashboardUiState(
            isLoading = false,
            businessName = content.prefs.businessName.takeIf { it.isNotBlank() } ?: "My Business",
            isMonitoringActive = content.prefs.isMonitoringServiceEnabled,
            missedCallsToday = today.missedCalls,
            followUpsToday = today.followUps,
            whatsAppSentToday = today.whatsAppSent,
            smsSentToday = today.smsSent,
            pendingFollowUpsCount = crm.pendingFollowUps,
            totalCustomers = crm.totalCustomers,
            recentMissedCalls = recentMissed,
            customerMap = crm.customerMap,
            defaultTemplate = content.defaultTemplate?.toDomainModel(),
            userMessage = content.userMsg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState(isLoading = true)
    )

    fun sendWhatsAppFollowUp(callEvent: CallEvent, message: String) {
        viewModelScope.launch {
            try {
                val result = whatsAppProviderManager.sendMessage(callEvent.phoneNumber, message)
                callEventDao.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.SENT.name)
                
                val customer = customerDao.getCustomerByPhoneNumber(callEvent.normalizedPhoneNumber)
                if (customer != null) {
                    crmSyncManager.recordActivity(
                        customerId = customer.id,
                        type = CrmActivityType.WHATSAPP_SENT,
                        message = message,
                        callEventId = callEvent.idempotencyKey,
                        messageId = result.messageId,
                        metadata = mapOf("mode" to result.modeUsed.name)
                    )
                }
                
                _userMessage.value = "WhatsApp message sent successfully"
            } catch (e: Exception) {
                _userMessage.value = "Failed to send WhatsApp message: ${e.localizedMessage}"
            }
        }
    }

    fun sendSmsFollowUp(callEvent: CallEvent) {
        viewModelScope.launch {
            callEventDao.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.SENT.name)
        }
    }

    fun markAsIgnored(callEvent: CallEvent) {
        viewModelScope.launch {
            callEventDao.updateWhatsAppStatus(callEvent.id, WhatsAppFollowUpStatus.IGNORED.name)
            _userMessage.value = "Call marked as ignored"
        }
    }

    fun clearUserMessage() {
        _userMessage.update { null }
    }
}
