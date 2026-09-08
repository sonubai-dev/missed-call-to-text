package com.misscall.whatsappassistant.whatsapp.provider

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.PhoneNumberHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * MODE 3 — OFFICIAL CLOUD API
 * Direct integration with Meta's official WhatsApp Business Cloud API (Graph API).
 *
 * Security Guarantee:
 * - Access Tokens are ALWAYS encrypted in Android Keystore (AES-256-GCM) and never stored in plaintext.
 */
@Singleton
class CloudApiWhatsAppProvider @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository
) : WhatsAppProvider {

    private val jsonParser = Json { ignoreUnknownKeys = true }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    override val mode: WhatsAppSendingMode = WhatsAppSendingMode.CLOUD_API

    override suspend fun sendMessage(phoneNumber: String, message: String): MessageSendResult {
        return withContext(Dispatchers.IO) {
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                val token = preferencesRepository.getDecryptedCloudApiToken(prefs.encryptedCloudApiToken)
                val phoneId = prefs.cloudApiPhoneId

                if (token.isBlank() || phoneId.isBlank()) {
                    return@withContext MessageSendResult(
                        isSuccess = false,
                        errorMessage = "WhatsApp Cloud API credentials not configured. Please enter Phone Number ID and Access Token in Settings.",
                        modeUsed = WhatsAppSendingMode.CLOUD_API
                    )
                }

                val sanitizedNumber = PhoneNumberHelper.sanitizeForWhatsApp(
                    phoneNumber,
                    defaultCountryCode = prefs.defaultCountryCode
                )

                val payload = buildJsonObject {
                    put("messaging_product", "whatsapp")
                    put("recipient_type", "individual")
                    put("to", sanitizedNumber)
                    put("type", "text")
                    putJsonObject("text") {
                        put("preview_url", false)
                        put("body", message)
                    }
                }.toString()

                val url = "https://graph.facebook.com/v19.0/$phoneId/messages"
                val body = payload.toRequestBody("application/json; charset=utf-8".toMediaType())

                val request = Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()

                val response = okHttpClient.newCall(request).execute()
                val responseBody = response.body?.string().orEmpty()

                if (response.isSuccessful) {
                    val root = jsonParser.parseToJsonElement(responseBody).jsonObject
                    val messages = root["messages"]
                    val messageId = messages?.toString() ?: "wamid_${System.currentTimeMillis()}"
                    MessageSendResult(
                        isSuccess = true,
                        messageId = messageId,
                        modeUsed = WhatsAppSendingMode.CLOUD_API
                    )
                } else {
                    MessageSendResult(
                        isSuccess = false,
                        errorMessage = "Cloud API error (${response.code}): $responseBody",
                        modeUsed = WhatsAppSendingMode.CLOUD_API
                    )
                }
            } catch (e: Exception) {
                MessageSendResult(
                    isSuccess = false,
                    errorMessage = "Cloud API Network error: ${e.localizedMessage}",
                    modeUsed = WhatsAppSendingMode.CLOUD_API
                )
            }
        }
    }

    override suspend fun getStatus(): WhatsAppProviderStatus {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val hasCredentials = prefs.cloudApiPhoneId.isNotBlank() && prefs.encryptedCloudApiToken.isNotBlank()

        return WhatsAppProviderStatus(
            mode = WhatsAppSendingMode.CLOUD_API,
            state = if (hasCredentials) ProviderConnectionState.CONNECTED else ProviderConnectionState.NEEDS_SETUP,
            details = if (hasCredentials) "Configured (Phone ID: ${prefs.cloudApiPhoneId})" else "Requires Phone ID and Access Token",
            connectedNumber = prefs.cloudApiPhoneId.ifBlank { null },
            sessionActive = hasCredentials
        )
    }

    override suspend fun disconnect() {
        preferencesRepository.clearCloudApiCredentials()
    }

    override suspend fun validateConnection(): ConnectionValidationResult {
        return withContext(Dispatchers.IO) {
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                val token = preferencesRepository.getDecryptedCloudApiToken(prefs.encryptedCloudApiToken)
                val phoneId = prefs.cloudApiPhoneId

                if (token.isBlank() || phoneId.isBlank()) {
                    return@withContext ConnectionValidationResult(
                        isValid = false,
                        message = "Missing Phone Number ID or Access Token."
                    )
                }

                // Verify credentials against Graph API Phone Number endpoint
                val url = "https://graph.facebook.com/v19.0/$phoneId"
                val request = Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer $token")
                    .get()
                    .build()

                val response = okHttpClient.newCall(request).execute()
                val body = response.body?.string().orEmpty()

                if (response.isSuccessful) {
                    ConnectionValidationResult(
                        isValid = true,
                        message = "Official Meta Cloud API connected successfully!",
                        details = mapOf(
                            "Phone ID" to phoneId,
                            "Business Account ID" to prefs.cloudApiBusinessAccountId,
                            "Token Status" to "Encrypted & Valid (Keystore AES-256)"
                        )
                    )
                } else {
                    ConnectionValidationResult(
                        isValid = false,
                        message = "Meta API verification failed (${response.code}): $body"
                    )
                }
            } catch (e: Exception) {
                ConnectionValidationResult(
                    isValid = false,
                    message = "Connection validation error: ${e.localizedMessage}"
                )
            }
        }
    }

    suspend fun saveCredentials(
        phoneNumberId: String,
        businessAccountId: String,
        accessToken: String,
        webhookUrl: String = "",
        verifyToken: String = ""
    ) {
        preferencesRepository.setCloudApiCredentials(
            phoneId = phoneNumberId.trim(),
            businessAccountId = businessAccountId.trim(),
            rawToken = accessToken.trim(),
            webhookUrl = webhookUrl.trim(),
            verifyToken = verifyToken.trim()
        )
    }
}
