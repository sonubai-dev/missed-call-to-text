package com.misscall.whatsappassistant.presentation.settings

import android.content.Context
import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.permissions.PermissionManager
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.preferences.WhatsAppDispatchMode
import com.misscall.whatsappassistant.core.util.PermissionHelper
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.FollowUpSuggestionDao
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

private data class CrmSettingsStats(
    val totalCustomers: Int = 0,
    val pendingEvents: Int = 0,
    val latestDelivery: com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity? = null,
    val lastSync: Long = 0L
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository,
    private val permissionManager: PermissionManager,
    private val callEventDao: CallEventDao,
    private val customerDao: CustomerDao,
    private val followUpDao: FollowUpSuggestionDao,
    private val messageLogDao: MessageLogDao,
    private val templateDao: MessageTemplateDao,
    private val callEventPipeline: CallEventPipeline,
    private val crmSyncManager: com.misscall.whatsappassistant.crm.CrmSyncManager,
    private val webhookDao: com.misscall.whatsappassistant.database.dao.WebhookDao
) : ViewModel() {

    private val _userMessage = MutableStateFlow<String?>(null)
    private val _permissionRefreshTrigger = MutableStateFlow(0)
    private val _isSendingTestWebhook = MutableStateFlow(false)
    private val _lastSyncTimestamp = MutableStateFlow(0L)

    val templates: StateFlow<List<MessageTemplate>> = templateDao.getAllTemplatesFlow()
        .combine(MutableStateFlow(Unit)) { list, _ ->
            list.map { entity ->
                MessageTemplate(
                    id = entity.id,
                    name = entity.name,
                    content = entity.content,
                    language = entity.language,
                    isDefault = entity.isDefault,
                    createdAt = entity.createdAt,
                    updatedAt = entity.updatedAt
                )
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private val crmStatsFlow = combine(
        customerDao.getTotalCustomerCountFlow(),
        webhookDao.getPendingEventsCountFlow(),
        webhookDao.getLatestDeliveryFlow(),
        _lastSyncTimestamp
    ) { totalCustomers, pendingEvents, latestDelivery, lastSync ->
        CrmSettingsStats(
            totalCustomers = totalCustomers,
            pendingEvents = pendingEvents,
            latestDelivery = latestDelivery,
            lastSync = lastSync
        )
    }

    val uiState: StateFlow<SettingsUiState> = combine(
        preferencesRepository.userPreferencesFlow,
        _permissionRefreshTrigger,
        _userMessage,
        crmStatsFlow,
        _isSendingTestWebhook
    ) { prefs, _, msg, crmStats, isSending ->
        val screeningRole = permissionManager.isCallScreeningRoleHeld()
        val hasCallLog = permissionManager.isCallLogGranted()
        val hasPhoneState = permissionManager.isPhoneStateGranted()
        val hasNotification = permissionManager.isNotificationGranted()
        val hasSendSms = false
        val isSimWarning = false
        val waInstalled = PermissionHelper.isWhatsAppInstalled(context)
        val waBusinessInstalled = PermissionHelper.isWhatsAppBusinessInstalled(context)
        val activeMode = permissionManager.getActiveDetectionEngineMode()
        val rationales = permissionManager.getPermissionRationales()
        val decryptedToken = preferencesRepository.getDecryptedCloudApiToken(prefs.encryptedCloudApiToken)

        SettingsUiState(
            preferences = prefs,
            isCallScreeningRoleHeld = screeningRole,
            isCallLogPermissionGranted = hasCallLog,
            isPhoneStatePermissionGranted = hasPhoneState,
            isNotificationPermissionGranted = hasNotification,
            isSendSmsPermissionGranted = hasSendSms,
            isSimUnavailableWarning = isSimWarning,
            isWhatsAppInstalled = waInstalled,
            isWhatsAppBusinessInstalled = waBusinessInstalled,
            activeDetectionMode = activeMode,
            rationales = rationales,
            decryptedCloudToken = decryptedToken,
            latestWebhookDelivery = crmStats.latestDelivery,
            isSendingTestWebhook = isSending,
            totalCustomersCount = crmStats.totalCustomers,
            pendingWebhookEventsCount = crmStats.pendingEvents,
            lastSyncTimestamp = crmStats.lastSync,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SettingsUiState(isLoading = true)
    )

    fun refreshPermissions() {
        _permissionRefreshTrigger.value = _permissionRefreshTrigger.value + 1
    }

    fun getCallScreeningRoleIntent(): Intent? {
        return permissionManager.createCallScreeningRoleIntent()
    }

    // BUSINESS
    fun updateBusinessProfile(
        businessName: String,
        ownerName: String,
        category: String,
        countryCode: String,
        phone: String = "",
        language: String = "English",
        timezone: String = "Asia/Kolkata"
    ) {
        viewModelScope.launch {
            preferencesRepository.updateBusinessProfile(
                businessName = businessName,
                ownerName = ownerName,
                category = category,
                countryCode = countryCode,
                phone = phone,
                language = language,
                timezone = timezone
            )
            _userMessage.value = "Business profile updated"
        }
    }

    // MISSED CALL
    fun setMissedCallDetectionSettings(
        enabled: Boolean,
        detectUnknown: Boolean,
        ignoreContacts: Boolean,
        minRingDuration: Int,
        duplicateProtection: Boolean
    ) {
        viewModelScope.launch {
            preferencesRepository.setMissedCallDetectionSettings(
                enabled = enabled,
                detectUnknown = detectUnknown,
                ignoreContacts = ignoreContacts,
                minRingDuration = minRingDuration,
                duplicateProtection = duplicateProtection
            )
            _userMessage.value = "Missed call detection preferences updated"
        }
    }

    // WHATSAPP
    fun setWhatsAppSendingMode(mode: WhatsAppSendingMode) {
        viewModelScope.launch {
            preferencesRepository.setWhatsAppSendingMode(mode)
            _userMessage.value = "WhatsApp mode updated to ${mode.name}"
        }
    }

    fun setWhatsAppMode(mode: WhatsAppDispatchMode) {
        viewModelScope.launch {
            preferencesRepository.setWhatsAppDispatchMode(mode)
            _userMessage.value = "WhatsApp mode updated to ${mode.name}"
        }
    }

    fun saveCloudApiCredentials(phoneId: String, rawToken: String) {
        viewModelScope.launch {
            preferencesRepository.setCloudApiCredentials(phoneId, rawToken)
            _userMessage.value = "Cloud API credentials encrypted & saved securely in Keystore"
        }
    }

    // AUTOMATION & AI
    fun setAutomationSettings(
        enabled: Boolean,
        delayMinutes: Int,
        maxFollowUps: Int,
        isAi: Boolean,
        aiLanguage: String,
        aiTone: String
    ) {
        viewModelScope.launch {
            preferencesRepository.setAutoReplyEnabled(enabled)
            preferencesRepository.setAutoReplyDelayMinutes(delayMinutes)
            preferencesRepository.setMaxFollowUpsPerCustomer(maxFollowUps)
            preferencesRepository.setAiSettings(isAi, aiLanguage, aiTone)
            _userMessage.value = "Automation & AI settings saved"
        }
    }

    // NOTIFICATIONS
    fun setNotificationSettings(missedCall: Boolean, msgSent: Boolean, msgFailed: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setNotificationSettings(missedCall, msgSent, msgFailed)
            _userMessage.value = "Notification settings saved"
        }
    }

    // PRIVACY & DATA PURGE
    fun deleteAllCallHistory() {
        viewModelScope.launch {
            callEventDao.clearAllCallEvents()
            followUpDao.clearAllSuggestions()
            _userMessage.value = "All call history deleted"
        }
    }

    fun deleteAllCustomers() {
        viewModelScope.launch {
            customerDao.clearAllCustomers()
            _userMessage.value = "All customer records deleted"
        }
    }

    fun exportDataAsJson(onExportReady: (String) -> Unit) {
        viewModelScope.launch {
            val calls = callEventDao.getAllCallEventsFlow().first()
            val customers = customerDao.getAllCustomersFlow().first()
            val json = buildString {
                append("{\n")
                append("  \"exportedAt\": \"${System.currentTimeMillis()}\",\n")
                append("  \"totalCalls\": ${calls.size},\n")
                append("  \"totalCustomers\": ${customers.size},\n")
                append("  \"calls\": [")
                calls.forEachIndexed { idx, c ->
                    append("\n    {\"id\": ${c.id}, \"phone\": \"${c.phoneNumber}\", \"status\": \"${c.status}\", \"timestamp\": ${c.timestamp}}")
                    if (idx < calls.size - 1) append(",")
                }
                append("\n  ],\n")
                append("  \"customers\": [")
                customers.forEachIndexed { idx, cust ->
                    append("\n    {\"id\": ${cust.id}, \"name\": \"${cust.name}\", \"phone\": \"${cust.phoneNumber}\", \"vip\": ${cust.isVip}}")
                    if (idx < customers.size - 1) append(",")
                }
                append("\n  ]\n")
                append("}")
            }
            onExportReady(json)
            _userMessage.value = "Data exported successfully"
        }
    }

    fun clearAllAppData() {
        viewModelScope.launch {
            callEventDao.clearAllCallEvents()
            customerDao.clearAllCustomers()
            followUpDao.clearAllSuggestions()
            messageLogDao.clearAllLogs()
            preferencesRepository.clearAllPreferences()
            _userMessage.value = "All application data and preferences cleared"
        }
    }

    // SETUP WIZARD & TEST
    fun completeSetupWizard(
        businessName: String,
        category: String,
        phone: String,
        mode: WhatsAppSendingMode,
        autoReply: Boolean,
        delayMinutes: Int,
        maxFollowUps: Int
    ) {
        viewModelScope.launch {
            preferencesRepository.updateBusinessProfile(
                businessName = businessName,
                ownerName = "Business Owner",
                category = category,
                countryCode = "91",
                phone = phone
            )
            preferencesRepository.setWhatsAppSendingMode(mode)
            preferencesRepository.setAutoReplyEnabled(autoReply)
            preferencesRepository.setAutoReplyDelayMinutes(delayMinutes)
            preferencesRepository.setMaxFollowUpsPerCustomer(maxFollowUps)
            preferencesRepository.setCompletedOnboarding(true)
            _userMessage.value = "Setup completed successfully!"
        }
    }

    fun simulateTestMissedCall(phoneNumber: String = "+919876543210") {
        viewModelScope.launch {
            callEventPipeline.onTelephonyRinging(phoneNumber, System.currentTimeMillis())
            callEventPipeline.onTelephonyIdle(System.currentTimeMillis())
            _userMessage.value = "Simulated missed call processed!"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }

    // SMS AUTOMATION & SIM
    fun setAutomaticSmsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setAutomaticSmsEnabled(enabled)
            _userMessage.value = "Automatic SMS ${if (enabled) "Enabled" else "Disabled"}"
        }
    }

    fun setSmsDelayMinutes(minutes: Int) {
        viewModelScope.launch {
            preferencesRepository.setSmsDelayMinutes(minutes)
        }
    }

    fun setDefaultSmsTemplateId(templateId: Long) {
        viewModelScope.launch {
            preferencesRepository.setDefaultSmsTemplateId(templateId)
            _userMessage.value = "Default SMS template updated"
        }
    }

    fun setSmsDuplicateProtectionHours(hours: Int) {
        viewModelScope.launch {
            preferencesRepository.setSmsDuplicateProtectionHours(hours)
            _userMessage.value = "Duplicate protection set to ${hours}h"
        }
    }

    fun setSelectedSmsSubscriptionId(subId: Int) {
        viewModelScope.launch {
            preferencesRepository.setSelectedSmsSubscriptionId(subId)
            _userMessage.value = "SMS SIM selection saved"
        }
    }

    fun setChannelAutomation(whatsApp: Boolean, sms: Boolean, fallback: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setWhatsAppAutoReplyEnabled(whatsApp)
            preferencesRepository.setSmsAutoReplyEnabled(sms)
            preferencesRepository.setWhatsAppFallbackToSmsEnabled(fallback)
            _userMessage.value = "Communication channels updated"
        }
    }

    // CRM & WEBHOOKS
    fun setCrmIntegration(enabled: Boolean, webhookUrl: String, webhookSecret: String, events: Set<String>) {
        viewModelScope.launch {
            preferencesRepository.setCrmIntegration(
                enabled = enabled,
                webhookUrl = webhookUrl,
                secret = webhookSecret,
                events = events
            )
            _userMessage.value = "CRM settings saved"
        }
    }

    fun setCrmIntegrationEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setCrmIntegrationEnabled(enabled)
            _userMessage.value = if (enabled) "CRM integration enabled" else "CRM integration disabled"
        }
    }

    fun sendTestWebhook() {
        viewModelScope.launch {
            _isSendingTestWebhook.value = true
            try {
                val delivery = crmSyncManager.sendTestWebhook()
                _userMessage.value = if (delivery.status == "DELIVERED") {
                    "Test event sent successfully (HTTP ${delivery.responseCode ?: 200})"
                } else {
                    "Test event failed: ${delivery.lastError ?: "Code ${delivery.responseCode}"}"
                }
            } catch (e: Exception) {
                _userMessage.value = "Test event failed: ${e.message}"
            } finally {
                _isSendingTestWebhook.value = false
            }
        }
    }

    fun triggerManualSync() {
        viewModelScope.launch {
            crmSyncManager.scheduleSync()
            _lastSyncTimestamp.value = System.currentTimeMillis()
            _userMessage.value = "CRM sync scheduled"
        }
    }

    fun disconnectCrm() {
        viewModelScope.launch {
            preferencesRepository.setCrmIntegrationEnabled(false)
            _userMessage.value = "CRM disconnected"
        }
    }
}
