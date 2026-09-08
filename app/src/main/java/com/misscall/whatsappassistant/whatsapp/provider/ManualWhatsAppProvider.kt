package com.misscall.whatsappassistant.whatsapp.provider

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import com.misscall.whatsappassistant.core.util.PhoneNumberHelper
import dagger.hilt.android.qualifiers.ApplicationContext
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import javax.inject.Inject
import javax.inject.Singleton

/**
 * MODE 1 — MANUAL
 * Uses safe, official Android Intent & deep-link routing.
 * Respects Android security guidelines and consumer WhatsApp constraints.
 */
@Singleton
class ManualWhatsAppProvider @Inject constructor(
    @ApplicationContext private val context: Context
) : WhatsAppProvider {

    companion object {
        const val WHATSAPP_PACKAGE = "com.whatsapp"
        const val WHATSAPP_BUSINESS_PACKAGE = "com.whatsapp.w4b"
    }

    override val mode: WhatsAppSendingMode = WhatsAppSendingMode.MANUAL

    override suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult {
        val intent = createLaunchIntent(phoneNumber, message)
        return if (intent != null) {
            try {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                MessageSendResult(
                    isSuccess = true,
                    messageId = "manual_intent_${System.currentTimeMillis()}",
                    modeUsed = WhatsAppSendingMode.MANUAL
                )
            } catch (e: Exception) {
                MessageSendResult(
                    isSuccess = false,
                    errorMessage = "Failed to launch WhatsApp: ${e.localizedMessage}",
                    modeUsed = WhatsAppSendingMode.MANUAL
                )
            }
        } else {
            MessageSendResult(
                isSuccess = false,
                errorMessage = "WhatsApp is not installed on this device.",
                modeUsed = WhatsAppSendingMode.MANUAL
            )
        }
    }

    override suspend fun getStatus(): WhatsAppProviderStatus {
        val hasApp = isAppAvailable()
        return WhatsAppProviderStatus(
            mode = WhatsAppSendingMode.MANUAL,
            state = if (hasApp) ProviderConnectionState.READY else ProviderConnectionState.NEEDS_SETUP,
            details = if (hasApp) "WhatsApp is installed and ready for manual dispatch" else "WhatsApp or WhatsApp Business is not installed",
            sessionActive = hasApp
        )
    }

    override suspend fun disconnect() {
        // No persistent connection to tear down for manual intent mode
    }

    override suspend fun validateConnection(): ConnectionValidationResult {
        val isInstalled = isAppAvailable()
        return ConnectionValidationResult(
            isValid = isInstalled,
            message = if (isInstalled) "WhatsApp is installed and ready." else "WhatsApp application not found on device.",
            details = mapOf(
                "WhatsApp Installed" to isPackageInstalled(WHATSAPP_PACKAGE).toString(),
                "WhatsApp Business Installed" to isPackageInstalled(WHATSAPP_BUSINESS_PACKAGE).toString()
            )
        )
    }

    fun createLaunchIntent(phoneNumber: String, message: String): Intent? {
        val sanitizedNumber = PhoneNumberHelper.sanitizeForWhatsApp(phoneNumber, "91")
        val encodedMessage = try {
            URLEncoder.encode(message, StandardCharsets.UTF_8.toString())
        } catch (e: Exception) {
            Uri.encode(message)
        }

        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$sanitizedNumber&text=$encodedMessage")
        val intent = Intent(Intent.ACTION_VIEW, uri)

        val targetPackage = when {
            isPackageInstalled(WHATSAPP_BUSINESS_PACKAGE) -> WHATSAPP_BUSINESS_PACKAGE
            isPackageInstalled(WHATSAPP_PACKAGE) -> WHATSAPP_PACKAGE
            else -> null
        }

        targetPackage?.let { intent.setPackage(it) }
        return if (targetPackage != null || isIntentResolvable(intent)) intent else null
    }

    fun isAppAvailable(): Boolean {
        return isPackageInstalled(WHATSAPP_PACKAGE) || isPackageInstalled(WHATSAPP_BUSINESS_PACKAGE)
    }

    private fun isPackageInstalled(packageName: String): Boolean {
        return try {
            context.packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    private fun isIntentResolvable(intent: Intent): Boolean {
        return intent.resolveActivity(context.packageManager) != null
    }
}
