package com.misscall.whatsappassistant.whatsapp

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.preferences.WhatsAppDispatchMode
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.core.util.PermissionHelper
import com.misscall.whatsappassistant.core.util.PhoneNumberHelper
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import java.net.URLEncoder
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WhatsAppIntentSender @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository
) : WhatsAppSender {

    override fun isAppAvailable(): Boolean {
        return PermissionHelper.isWhatsAppInstalled(context) ||
                PermissionHelper.isWhatsAppBusinessInstalled(context)
    }

    override fun createLaunchIntent(phoneNumber: String, messageText: String): Intent? {
        val sanitizedNumber = PhoneNumberHelper.sanitizeForWhatsApp(phoneNumber)
        val encodedMessage = try {
            URLEncoder.encode(messageText, "UTF-8")
        } catch (e: Exception) {
            messageText
        }

        // WhatsApp direct URI
        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$sanitizedNumber&text=$encodedMessage")
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        // Check preferred package
        val isPersonalInstalled = PermissionHelper.isWhatsAppInstalled(context)
        val isBusinessInstalled = PermissionHelper.isWhatsAppBusinessInstalled(context)

        return if (isBusinessInstalled && !isPersonalInstalled) {
            intent.setPackage(Constants.PACKAGE_WHATSAPP_BUSINESS)
            intent
        } else if (isPersonalInstalled) {
            intent.setPackage(Constants.PACKAGE_WHATSAPP)
            intent
        } else {
            // General browser or app chooser fallback
            intent
        }
    }

    override suspend fun sendMessage(phoneNumber: String, messageText: String): Boolean {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val sanitizedNumber = PhoneNumberHelper.sanitizeForWhatsApp(
            phoneNumber,
            defaultCountryCode = prefs.defaultCountryCode
        )

        val encodedMessage = try {
            URLEncoder.encode(messageText, "UTF-8")
        } catch (e: Exception) {
            messageText
        }

        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$sanitizedNumber&text=$encodedMessage")
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        when (prefs.whatsAppDispatchMode) {
            WhatsAppDispatchMode.WHATSAPP_BUSINESS -> {
                if (PermissionHelper.isWhatsAppBusinessInstalled(context)) {
                    intent.setPackage(Constants.PACKAGE_WHATSAPP_BUSINESS)
                }
            }
            WhatsAppDispatchMode.WHATSAPP_PERSONAL -> {
                if (PermissionHelper.isWhatsAppInstalled(context)) {
                    intent.setPackage(Constants.PACKAGE_WHATSAPP)
                }
            }
            WhatsAppDispatchMode.AUTO_DETECT, WhatsAppDispatchMode.CLOUD_API -> {
                if (PermissionHelper.isWhatsAppBusinessInstalled(context)) {
                    intent.setPackage(Constants.PACKAGE_WHATSAPP_BUSINESS)
                } else if (PermissionHelper.isWhatsAppInstalled(context)) {
                    intent.setPackage(Constants.PACKAGE_WHATSAPP)
                }
            }
        }

        return try {
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            // Fallback without explicit package
            try {
                intent.setPackage(null)
                context.startActivity(intent)
                true
            } catch (fallbackException: Exception) {
                false
            }
        }
    }
}
