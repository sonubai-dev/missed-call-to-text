package com.misscall.whatsappassistant.whatsapp

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.PhoneNumberHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WhatsAppCloudApiSender @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository
) {
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    suspend fun sendDirectMessage(phoneNumber: String, messageText: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                val token = preferencesRepository.getDecryptedCloudApiToken(prefs.encryptedCloudApiToken)
                val phoneId = prefs.cloudApiPhoneId

                if (token.isBlank() || phoneId.isBlank()) {
                    return@withContext Result.failure(IllegalStateException("WhatsApp Cloud API credentials not configured."))
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
                        put("body", messageText)
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
                val responseBody = response.body?.string() ?: ""

                if (response.isSuccessful) {
                    Result.success(responseBody)
                } else {
                    Result.failure(Exception("HTTP ${response.code}: $responseBody"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
