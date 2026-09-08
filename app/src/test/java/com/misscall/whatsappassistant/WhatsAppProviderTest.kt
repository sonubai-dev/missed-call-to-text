package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.whatsapp.provider.ConnectionValidationResult
import com.misscall.whatsappassistant.whatsapp.provider.MessageSendResult
import com.misscall.whatsappassistant.whatsapp.provider.ProviderConnectionState
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProvider
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppProviderStatus
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WhatsAppProviderTest {

    // Test fake provider to verify provider-agnostic interface
    class FakeProvider(
        override val mode: WhatsAppSendingMode,
        var shouldSucceed: Boolean = true
    ) : WhatsAppProvider {
        var disconnected = false

        override suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult {
            return if (shouldSucceed) {
                MessageSendResult(
                    isSuccess = true,
                    messageId = "fake_id_123",
                    modeUsed = mode
                )
            } else {
                MessageSendResult(
                    isSuccess = false,
                    errorMessage = "Fake failure",
                    modeUsed = mode
                )
            }
        }

        override suspend fun getStatus(): WhatsAppProviderStatus {
            return WhatsAppProviderStatus(
                mode = mode,
                state = if (shouldSucceed) ProviderConnectionState.CONNECTED else ProviderConnectionState.NEEDS_SETUP,
                details = "Fake Provider Status",
                sessionActive = shouldSucceed
            )
        }

        override suspend fun disconnect() {
            disconnected = true
        }

        override suspend fun validateConnection(): ConnectionValidationResult {
            return ConnectionValidationResult(
                isValid = shouldSucceed,
                message = if (shouldSucceed) "Connected" else "Failed"
            )
        }
    }

    @Test
    fun `Manual provider mode returns correct mode`() {
        val provider = FakeProvider(WhatsAppSendingMode.MANUAL)
        assertEquals(WhatsAppSendingMode.MANUAL, provider.mode)
    }

    @Test
    fun `WhatsApp Web provider mode handles connection and send`() = runBlocking {
        val provider = FakeProvider(WhatsAppSendingMode.WHATSAPP_WEB)
        val status = provider.getStatus()
        assertEquals(WhatsAppSendingMode.WHATSAPP_WEB, status.mode)
        assertEquals(ProviderConnectionState.CONNECTED, status.state)

        val result = provider.sendMessage("+919876543210", "Test message")
        assertTrue(result.isSuccess)
        assertEquals(WhatsAppSendingMode.WHATSAPP_WEB, result.modeUsed)
    }

    @Test
    fun `Cloud API provider mode validates connection`() = runBlocking {
        val provider = FakeProvider(WhatsAppSendingMode.CLOUD_API, shouldSucceed = true)
        val validation = provider.validateConnection()
        assertTrue(validation.isValid)
        assertEquals("Connected", validation.message)

        val failedProvider = FakeProvider(WhatsAppSendingMode.CLOUD_API, shouldSucceed = false)
        val failedValidation = failedProvider.validateConnection()
        assertFalse(failedValidation.isValid)
    }

    @Test
    fun `Provider disconnects cleanly`() = runBlocking {
        val provider = FakeProvider(WhatsAppSendingMode.WHATSAPP_WEB)
        provider.disconnect()
        assertTrue(provider.disconnected)
    }
}
