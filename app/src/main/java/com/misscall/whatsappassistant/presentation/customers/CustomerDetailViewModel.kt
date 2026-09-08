package com.misscall.whatsappassistant.presentation.customers

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.crm.CrmSyncManager
import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CrmActivityDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.database.dao.SmsMessageDao
import com.misscall.whatsappassistant.database.entity.CallEventEntity
import com.misscall.whatsappassistant.database.entity.CrmActivityEntity
import com.misscall.whatsappassistant.database.entity.MessageLogEntity
import com.misscall.whatsappassistant.database.entity.SmsMessageEntity
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.CrmActivityType
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlin.math.abs

@HiltViewModel
class CustomerDetailViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val customerDao: CustomerDao,
    private val callEventDao: CallEventDao,
    private val messageLogDao: MessageLogDao,
    private val smsMessageDao: SmsMessageDao,
    private val templateDao: MessageTemplateDao,
    private val crmActivityDao: CrmActivityDao,
    private val crmSyncManager: CrmSyncManager,
    private val smartMessageGeneratorManager: com.misscall.whatsappassistant.domain.generator.SmartMessageGeneratorManager,
    private val preferencesRepository: UserPreferencesRepository,
    private val whatsAppProviderManager: WhatsAppProviderManager
) : ViewModel() {

    private val customerId: Long = savedStateHandle.get<Long>("customerId") ?: 0L

    private val _uiState = MutableStateFlow(CustomerDetailUiState())
    val uiState: StateFlow<CustomerDetailUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val customerEntity = customerDao.getCustomerById(customerId)
            if (customerEntity != null) {
                val customer = customerEntity.toDomain()
                _uiState.update { it.copy(customer = customer, isLoading = false) }
                
                generateSuggestedMessage(customer)
                collectTimeline(customer.phoneNumber)
            } else {
                _uiState.update { it.copy(isLoading = false, userMessage = "Customer not found") }
            }
        }
    }

    private fun generateSuggestedMessage(customer: Customer) {
        viewModelScope.launch {
            val defaultTemplateEntity = templateDao.getDefaultTemplate()
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val businessName = prefs.businessName
            
            val content = defaultTemplateEntity?.content ?: "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?"
            val parsed = TemplateParser.parse(
                template = content,
                callerName = customer.name,
                phoneNumber = customer.phoneNumber,
                businessName = businessName,
                ownerName = prefs.ownerName
            )
            _uiState.update { it.copy(suggestedMessage = parsed) }
        }
    }

    private fun collectTimeline(phoneNumber: String) {
        viewModelScope.launch {
            combine(
                callEventDao.getAllCallEventsFlow(),
                messageLogDao.getMessageLogsForNumberFlow(phoneNumber),
                smsMessageDao.getAllSmsFlow(),
                crmActivityDao.getActivitiesForCustomerFlow(customerId)
            ) { callEvents: List<CallEventEntity>,
                messageLogs: List<MessageLogEntity>,
                smsMessages: List<SmsMessageEntity>,
                crmActivities: List<CrmActivityEntity> ->

                val crmItems = crmActivities.map { act ->
                    val type = when (act.type) {
                        "MISSED_CALL" -> TimelineType.MISSED_CALL
                        "WHATSAPP_SENT" -> TimelineType.WHATSAPP_SENT
                        "SMS_SENT" -> TimelineType.SMS_SENT
                        "CALL_BACK" -> TimelineType.CALL_BACK
                        "CUSTOM_MESSAGE" -> TimelineType.CUSTOM_MESSAGE
                        "CUSTOMER_REPLY" -> TimelineType.CUSTOMER_REPLY
                        "FOLLOW_UP_CREATED" -> TimelineType.FOLLOW_UP_CREATED
                        else -> TimelineType.CUSTOM_MESSAGE
                    }
                    val title = when (act.type) {
                        "MISSED_CALL" -> "Missed Call"
                        "WHATSAPP_SENT" -> "WhatsApp Sent"
                        "SMS_SENT" -> "SMS Sent"
                        "CALL_BACK" -> "Call Back"
                        "CUSTOM_MESSAGE" -> "Custom Message"
                        "CUSTOMER_REPLY" -> "Customer Reply"
                        "FOLLOW_UP_CREATED" -> "Follow-up Created"
                        else -> act.type
                    }
                    TimelineItem(
                        id = act.id,
                        type = type,
                        title = title,
                        subtitle = act.message,
                        timestamp = act.timestamp
                    )
                }

                // Filter legacy events if not already represented in crmActivities
                val legacyCalls = callEvents
                    .filter { (it.phoneNumber == phoneNumber || it.normalizedPhoneNumber == phoneNumber) && it.status == CallStatus.MISSED.name }
                    .filter { call -> crmActivities.none { it.type == "MISSED_CALL" && abs(it.timestamp - call.timestamp) < 5000 } }
                    .map {
                        TimelineItem(
                            id = it.id,
                            type = TimelineType.MISSED_CALL,
                            title = "Missed Call",
                            timestamp = it.timestamp
                        )
                    }

                val legacyLogs = messageLogs
                    .filter { log -> crmActivities.none { it.type == "WHATSAPP_SENT" && abs(it.timestamp - log.timestamp) < 5000 } }
                    .map {
                        val isSuccess = it.status == "SUCCESS"
                        TimelineItem(
                            id = it.id,
                            type = if (isSuccess) TimelineType.WHATSAPP_SENT else TimelineType.WHATSAPP_FAILED,
                            title = "WhatsApp ${if (isSuccess) "Sent" else "Failed"}",
                            subtitle = it.messageContent,
                            timestamp = it.timestamp
                        )
                    }

                val legacySms = smsMessages
                    .filter { it.phoneNumber == phoneNumber }
                    .filter { sms -> crmActivities.none { it.type == "SMS_SENT" && abs(it.timestamp - (sms.sentAt ?: sms.createdAt)) < 5000 } }
                    .map {
                        val isSuccess = it.status == "SENT" || it.status == "DELIVERED"
                        TimelineItem(
                            id = it.id,
                            type = if (isSuccess) TimelineType.SMS_SENT else TimelineType.SMS_FAILED,
                            title = "SMS ${if (isSuccess) "Sent" else "Failed"}",
                            subtitle = it.message,
                            timestamp = it.sentAt ?: it.createdAt
                        )
                    }

                (crmItems + legacyCalls + legacyLogs + legacySms).sortedByDescending { it.timestamp }
            }.collect { timeline ->
                _uiState.update { it.copy(timeline = timeline) }
            }
        }
    }

    fun updateSuggestedMessage(message: String) {
        _uiState.update { it.copy(suggestedMessage = message) }
    }

    fun updateBusinessStatus(status: CustomerBusinessStatus) {
        viewModelScope.launch {
            crmSyncManager.updateCustomerStatus(customerId, status)
            val updated = customerDao.getCustomerById(customerId)
            if (updated != null) {
                _uiState.update { it.copy(customer = updated.toDomain(), userMessage = "Status updated to ${status.name}") }
            }
        }
    }

    fun recordCallBack() {
        viewModelScope.launch {
            val customer = _uiState.value.customer ?: return@launch
            crmSyncManager.recordActivity(
                customerId = customerId,
                type = CrmActivityType.CALL_BACK,
                message = "Called back ${customer.name ?: customer.phoneNumber}",
                metadata = mapOf("phoneNumber" to customer.phoneNumber)
            )
        }
    }

    fun sendWhatsApp(message: String) {
        viewModelScope.launch {
            val customer = _uiState.value.customer ?: return@launch
            try {
                val result = whatsAppProviderManager.sendMessage(customer.phoneNumber, message)
                if (result.isSuccess) {
                    crmSyncManager.recordActivity(
                        customerId = customer.id,
                        type = CrmActivityType.WHATSAPP_SENT,
                        message = message,
                        messageId = result.messageId,
                        metadata = mapOf("mode" to result.modeUsed.name)
                    )
                    _uiState.update { it.copy(userMessage = "WhatsApp message sent") }
                } else {
                    _uiState.update { it.copy(userMessage = "Failed to send: ${result.errorMessage}") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(userMessage = "Failed to send WhatsApp: ${e.message}") }
            }
        }
    }

    fun generateAiMessage() {
        viewModelScope.launch {
            val customer = _uiState.value.customer ?: return@launch
            val prefs = preferencesRepository.userPreferencesFlow.first()
            _uiState.update { it.copy(userMessage = "Generating AI follow-up...") }
            try {
                val req = com.misscall.whatsappassistant.domain.model.MessageGenerationRequest(
                    customerName = customer.name,
                    customerPhone = customer.phoneNumber,
                    businessName = prefs.businessName.ifBlank { "our team" },
                    businessCategory = prefs.businessCategory,
                    missedCallTime = DateTimeUtils.formatRelative(customer.lastCallTimestamp),
                    tone = com.misscall.whatsappassistant.domain.model.MessageTone.FRIENDLY,
                    language = com.misscall.whatsappassistant.domain.model.MessageLanguage.ENGLISH
                )
                val result = smartMessageGeneratorManager.generateMessage(req, bypassCache = true)
                _uiState.update { it.copy(suggestedMessage = result.content, userMessage = "New follow-up generated ✨") }
            } catch (e: Exception) {
                _uiState.update { it.copy(userMessage = "Generation failed: ${e.message}") }
            }
        }
    }

    fun clearUserMessage() {
        _uiState.update { it.copy(userMessage = null) }
    }
}
