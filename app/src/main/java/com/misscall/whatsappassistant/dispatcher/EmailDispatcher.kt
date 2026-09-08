package com.misscall.whatsappassistant.dispatcher

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import java.util.Properties
import javax.inject.Inject
import javax.inject.Singleton
import javax.mail.Authenticator
import javax.mail.Message
import javax.mail.PasswordAuthentication
import javax.mail.Session
import javax.mail.Transport
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

sealed class EmailDispatchResult {
    data object Success : EmailDispatchResult()
    data class IntentFallback(val intent: Intent) : EmailDispatchResult()
    data class Failure(val error: String) : EmailDispatchResult()
}

@Singleton
class EmailDispatcher @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository
) {
    companion object {
        private const val TAG = "EmailDispatcher"
    }

    suspend fun sendEmail(
        recipientEmail: String,
        subject: String,
        body: String,
        smtpHost: String = "",
        smtpPort: Int = 587,
        smtpUser: String = "",
        smtpPassword: String = ""
    ): EmailDispatchResult = withContext(Dispatchers.IO) {
        try {
            if (recipientEmail.isBlank()) {
                return@withContext EmailDispatchResult.Failure("Invalid recipient email address")
            }

            // Check if direct SMTP is configured
            if (smtpHost.isNotBlank() && smtpUser.isNotBlank() && smtpPassword.isNotBlank()) {
                AppLogger.i(TAG, "Dispatching direct SMTP email to $recipientEmail via $smtpHost:$smtpPort")
                
                val props = Properties().apply {
                    put("mail.smtp.auth", "true")
                    put("mail.smtp.starttls.enable", "true")
                    put("mail.smtp.host", smtpHost)
                    put("mail.smtp.port", smtpPort.toString())
                    put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3")
                    put("mail.smtp.connectiontimeout", "10000")
                    put("mail.smtp.timeout", "10000")
                }

                val session = Session.getInstance(props, object : Authenticator() {
                    override fun getPasswordAuthentication(): PasswordAuthentication {
                        return PasswordAuthentication(smtpUser, smtpPassword)
                    }
                })

                val message = MimeMessage(session).apply {
                    setFrom(InternetAddress(smtpUser))
                    setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail))
                    setSubject(subject)
                    setText(body, "UTF-8")
                }

                Transport.send(message)
                AppLogger.i(TAG, "Email successfully sent via SMTP to $recipientEmail")
                return@withContext EmailDispatchResult.Success
            }

            // Fallback: Create Intent for email client
            AppLogger.i(TAG, "SMTP not configured. Preparing Intent fallback for $recipientEmail")
            val emailIntent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("mailto:$recipientEmail")
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, body)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            EmailDispatchResult.IntentFallback(emailIntent)
        } catch (e: Exception) {
            AppLogger.e(TAG, "Failed to send email to $recipientEmail: ${e.message}", e)
            EmailDispatchResult.Failure(e.localizedMessage ?: "Unknown SMTP error")
        }
    }
}
