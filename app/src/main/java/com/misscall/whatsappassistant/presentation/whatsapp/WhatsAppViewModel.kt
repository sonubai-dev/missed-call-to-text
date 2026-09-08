package com.misscall.whatsappassistant.presentation.whatsapp

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.PermissionHelper
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.FollowUpSuggestionRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import com.misscall.whatsappassistant.domain.usecase.SendWhatsAppMessageUseCase
import com.misscall.whatsappassistant.whatsapp.provider.ConnectionValidationResult
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderManager
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WhatsAppViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository,
    private val templateRepository: TemplateRepository,
    private val callEventRepository: CallEventRepository,
    private val followUpSuggestionRepository: FollowUpSuggestionRepository,
    private val providerManager: WhatsAppProviderManager,
    private val sendWhatsAppMessageUseCase: SendWhatsAppMessageUseCase
) : ViewModel() {

    private val _userMessage = MutableStateFlow<String?>(null)
    private val _validationResult = MutableStateFlow<ConnectionValidationResult?>(null)
    private val _isValidating = MutableStateFlow(false)

    private val baseFlow = combine(
        preferencesRepository.userPreferencesFlow,
        templateRepository.getAllTemplatesFlow(),
        callEventRepository.getAllCallEventsFlow(),
        followUpSuggestionRepository.getAllSuggestionsFlow()
    ) { prefs, templates, calls, suggestions ->
        val defaultTmpl = templates.firstOrNull { it.isDefault } ?: templates.firstOrNull()
        val isWa = PermissionHelper.isWhatsAppInstalled(context)
        val isWaBusiness = PermissionHelper.isWhatsAppBusinessInstalled(context)
        val provider = providerManager.getProvider(prefs.whatsAppSendingMode)
        val status = provider.getStatus()

        WhatsAppUiState(
            preferences = prefs,
            templates = templates,
            defaultTemplate = defaultTmpl,
            missedCalls = calls.take(10),
            pendingFollowUps = suggestions,
            providerStatus = status,
            isWhatsAppInstalled = isWa,
            isWhatsAppBusinessInstalled = isWaBusiness,
            isLoading = false
        )
    }

    val uiState: StateFlow<WhatsAppUiState> = combine(
        baseFlow,
        _validationResult,
        _isValidating,
        _userMessage
    ) { baseState, valResult, isValidating, msg ->
        baseState.copy(
            validationResult = valResult,
            isValidating = isValidating,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = WhatsAppUiState(isLoading = true)
    )

    fun setSendingMode(mode: WhatsAppSendingMode) {
        viewModelScope.launch {
            providerManager.setSendingMode(mode)
            _validationResult.value = null
            _userMessage.value = "Switched to ${mode.name.replace("_", " ")} mode"
        }
    }

    fun toggleAutoReply(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setAutoReplyEnabled(enabled)
            _userMessage.value = if (enabled) "Auto-reply enabled" else "Auto-reply paused"
        }
    }

    fun setDelayMinutes(minutes: Int) {
        viewModelScope.launch {
            preferencesRepository.setAutoReplyDelayMinutes(minutes)
        }
    }

    fun setCooldownMinutes(minutes: Int) {
        viewModelScope.launch {
            preferencesRepository.setCooldownMinutes(minutes)
        }
    }

    fun setDefaultTemplate(template: MessageTemplate) {
        viewModelScope.launch {
            templateRepository.setDefaultTemplate(template.id)
            _userMessage.value = "\"${template.name}\" set as default follow-up message"
        }
    }

    fun saveTemplate(id: Long, title: String, content: String, isDefault: Boolean) {
        viewModelScope.launch {
            if (id == 0L) {
                val newTemplate = MessageTemplate(
                    name = title,
                    content = content,
                    isDefault = isDefault
                )
                templateRepository.insertTemplate(newTemplate)
                _userMessage.value = "Template created"
            } else {
                val updatedTemplate = MessageTemplate(
                    id = id,
                    name = title,
                    content = content,
                    isDefault = isDefault
                )
                templateRepository.updateTemplate(updatedTemplate)
                _userMessage.value = "Template updated"
            }
        }
    }

    fun deleteTemplate(template: MessageTemplate) {
        viewModelScope.launch {
            templateRepository.deleteTemplate(template.id)
            _userMessage.value = "Template deleted"
        }
    }

    fun saveCloudApiCredentials(
        phoneNumberId: String,
        businessAccountId: String,
        accessToken: String,
        webhookUrl: String = "",
        verifyToken: String = ""
    ) {
        viewModelScope.launch {
            providerManager.cloudApiProvider.saveCredentials(
                phoneNumberId = phoneNumberId,
                businessAccountId = businessAccountId,
                accessToken = accessToken,
                webhookUrl = webhookUrl,
                verifyToken = verifyToken
            )
            _userMessage.value = "Cloud API credentials encrypted & saved securely in Keystore."
            validateConnection()
        }
    }

    fun validateConnection() {
        viewModelScope.launch {
            _isValidating.value = true
            try {
                val provider = providerManager.getActiveProvider()
                val result = provider.validateConnection()
                _validationResult.value = result
            } catch (e: Exception) {
                _validationResult.value = ConnectionValidationResult(
                    isValid = false,
                    message = "Validation failed: ${e.localizedMessage}"
                )
            } finally {
                _isValidating.value = false
            }
        }
    }

    fun connectWhatsAppWebSession(businessNumber: String) {
        viewModelScope.launch {
            providerManager.webProvider.connectSession(businessNumber)
            _userMessage.value = "WhatsApp Web session linked to $businessNumber"
        }
    }

    fun disconnectWhatsAppWebSession() {
        viewModelScope.launch {
            providerManager.webProvider.disconnect()
            _userMessage.value = "WhatsApp Web session disconnected"
        }
    }

    fun sendFollowUp(phoneNumber: String, messageText: String, callEventId: Long? = null) {
        viewModelScope.launch {
            val success = sendWhatsAppMessageUseCase(
                callEventId = callEventId,
                phoneNumber = phoneNumber,
                messageContent = messageText
            )
            _userMessage.value = if (success) "Dispatched WhatsApp message" else "Failed to send message"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
