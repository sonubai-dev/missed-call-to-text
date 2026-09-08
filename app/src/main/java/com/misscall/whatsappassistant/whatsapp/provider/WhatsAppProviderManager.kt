package com.misscall.whatsappassistant.whatsapp.provider

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WhatsAppProviderManager @Inject constructor(
    val manualProvider: ManualWhatsAppProvider,
    val webProvider: WhatsAppWebProvider,
    val cloudApiProvider: CloudApiWhatsAppProvider,
    private val preferencesRepository: UserPreferencesRepository
) {

    val activeSendingModeFlow: Flow<WhatsAppSendingMode> = preferencesRepository.userPreferencesFlow
        .map { it.whatsAppSendingMode }

    suspend fun getActiveProvider(): WhatsAppProvider {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        return getProvider(prefs.whatsAppSendingMode)
    }

    fun getProvider(mode: WhatsAppSendingMode): WhatsAppProvider {
        return when (mode) {
            WhatsAppSendingMode.MANUAL -> manualProvider
            WhatsAppSendingMode.WHATSAPP_WEB -> webProvider
            WhatsAppSendingMode.CLOUD_API -> cloudApiProvider
        }
    }

    suspend fun setSendingMode(mode: WhatsAppSendingMode) {
        preferencesRepository.setWhatsAppSendingMode(mode)
    }

    suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult {
        val provider = getActiveProvider()
        return provider.sendMessage(phoneNumber, message)
    }
}
