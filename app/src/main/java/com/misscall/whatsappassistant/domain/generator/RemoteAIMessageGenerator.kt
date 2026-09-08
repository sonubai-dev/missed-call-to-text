package com.misscall.whatsappassistant.domain.generator

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.GeneratedMessageResult
import com.misscall.whatsappassistant.domain.model.GenerationSource
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
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
 * Provider-agnostic Remote AI message generator.
 * Supports OpenAI-compatible and custom LLM inference endpoints.
 *
 * Security Guarantee:
 * - NO API keys are hardcoded in the APK.
 * - API keys are supplied by user and encrypted via Android Keystore.
 */
@Singleton
class RemoteAIMessageGenerator @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository
) : MessageGenerator {

    private val json = Json { ignoreUnknownKeys = true }
    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(12, TimeUnit.SECONDS)
        .build()

    override fun isAvailable(): Boolean = true

    override suspend fun generate(request: MessageGenerationRequest): GeneratedMessageResult {
        return withContext(Dispatchers.IO) {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val apiKey = preferencesRepository.getDecryptedCloudApiToken(prefs.encryptedCloudApiToken)
            val endpoint = "https://api.openai.com/v1/chat/completions"

            if (apiKey.isBlank()) {
                throw IllegalStateException("AI API Key not configured.")
            }

            val prompt = buildPrompt(request)

            val payload = buildJsonObject {
                put("model", "gpt-4o-mini")
                put("temperature", 0.7)
                put("max_tokens", 120)
                put("messages", buildJsonArray {
                    add(buildJsonObject {
                        put("role", "system")
                        put("content", "You are an AI assistant for a local business owner. Output only the short WhatsApp reply text. No quotes, no markdown, no preamble.")
                    })
                    add(buildJsonObject {
                        put("role", "user")
                        put("content", prompt)
                    })
                })
            }.toString()

            val body = payload.toRequestBody("application/json; charset=utf-8".toMediaType())
            val httpRequest = Request.Builder()
                .url(endpoint)
                .addHeader("Authorization", "Bearer $apiKey")
                .post(body)
                .build()

            val response = client.newCall(httpRequest).execute()
            val respBody = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                throw RuntimeException("AI API error HTTP ${response.code}: $respBody")
            }

            val root = json.parseToJsonElement(respBody).jsonObject
            val choices = root["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val messageObj = firstChoice?.get("message")?.jsonObject
            val content = messageObj?.get("content")?.jsonPrimitive?.content?.trim()
                ?: throw RuntimeException("Empty response from AI")

            GeneratedMessageResult(
                content = content.trim('\"', ' '),
                source = GenerationSource.REMOTE_AI,
                tone = request.tone,
                language = request.language,
                cached = false
            )
        }
    }

    private fun buildPrompt(request: MessageGenerationRequest): String {
        val namePart = if (!request.customerName.isNullOrBlank()) "Customer Name: ${request.customerName}." else ""
        return """
            Generate a short WhatsApp follow-up reply for a missed call.
            Business Name: ${request.businessName}
            Business Category: ${request.businessCategory}
            $namePart
            Missed Call Time: ${request.missedCallTime}
            Tone: ${request.tone.name.lowercase()}
            Language: ${request.language.name.lowercase()}
            ${request.customInstruction?.let { "Instruction: $it" } ?: ""}
            Keep it under 35 words. Return ONLY the message text.
        """.trimIndent()
    }
}
