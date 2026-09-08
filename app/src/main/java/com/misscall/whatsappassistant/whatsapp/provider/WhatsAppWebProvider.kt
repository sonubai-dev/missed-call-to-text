package com.misscall.whatsappassistant.whatsapp.provider

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.misscall.whatsappassistant.automation.worker.WhatsAppQueueWorker
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.database.dao.WhatsAppMessageDao
import com.misscall.whatsappassistant.database.entity.WhatsAppMessageEntity
import com.misscall.whatsappassistant.whatsapp.channel.WhatsAppSessionState
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WhatsAppWebProvider @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository,
    private val whatsAppMessageDao: WhatsAppMessageDao,
    private val whatsAppWebAdapter: WhatsAppWebAdapter
) : WhatsAppProvider {

    override val mode: WhatsAppSendingMode = WhatsAppSendingMode.WHATSAPP_WEB

    override suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val normalized = NumberNormalizer.normalize(phoneNumber, prefs.defaultCountryCode)

        val messageId = UUID.randomUUID().toString()
        val idempotencyKey = "wa_${normalized}_${System.currentTimeMillis() / 60000}" // Coarse idempotency

        // Insert into database queue
        val entity = WhatsAppMessageEntity(
            messageId = messageId,
            idempotencyKey = idempotencyKey,
            phoneNumber = normalized,
            content = message,
            status = "QUEUED"
        )
        whatsAppMessageDao.insertMessage(entity)

        // Trigger WorkManager to process the queue
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val workRequest = OneTimeWorkRequestBuilder<WhatsAppQueueWorker>()
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            "WhatsAppQueueWorker",
            ExistingWorkPolicy.APPEND_OR_REPLACE,
            workRequest
        )

        return MessageSendResult(
            isSuccess = true,
            messageId = messageId,
            modeUsed = WhatsAppSendingMode.WHATSAPP_WEB
        )
    }

    override suspend fun getStatus(): WhatsAppProviderStatus {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val info = whatsAppWebAdapter.getConnectionInfo()
        
        val isConnected = info.state == WhatsAppSessionState.CONNECTED

        val state = when (info.state) {
            WhatsAppSessionState.CONNECTED -> ProviderConnectionState.CONNECTED
            WhatsAppSessionState.QR_REQUIRED -> ProviderConnectionState.PAIRING_QR_REQUIRED
            WhatsAppSessionState.ERROR -> ProviderConnectionState.ERROR
            else -> ProviderConnectionState.DISCONNECTED
        }

        return WhatsAppProviderStatus(
            mode = WhatsAppSendingMode.WHATSAPP_WEB,
            state = state,
            details = if (isConnected) "Linked to ${info.connectedNumber} (WhatsApp Web)" else "Scan QR code to connect WhatsApp Web",
            connectedNumber = info.connectedNumber ?: prefs.whatsAppWebConnectedNumber.ifBlank { null },
            sessionActive = isConnected,
            qrCodeData = info.qrCodeData
        )
    }

    override suspend fun disconnect() {
        whatsAppWebAdapter.disconnect()
        preferencesRepository.setWhatsAppWebSession(connectedNumber = "", active = false)
    }

    override suspend fun validateConnection(): ConnectionValidationResult {
        val info = whatsAppWebAdapter.getConnectionInfo()
        val isConnected = info.state == WhatsAppSessionState.CONNECTED

        return ConnectionValidationResult(
            isValid = isConnected,
            message = if (isConnected) "WhatsApp Web session is active for ${info.connectedNumber}." else "WhatsApp Web session is inactive. Please link your device via QR.",
            details = mapOf(
                "Connected Number" to (info.connectedNumber ?: ""),
                "Session Active" to isConnected.toString(),
                "Integration Type" to "WhatsApp Web Adapter"
            )
        )
    }

    suspend fun connectSession(businessNumber: String) {
        whatsAppWebAdapter.connect(businessNumber)
        // Note: The UI should poll or observe getStatus() to display the QR code
    }
}

