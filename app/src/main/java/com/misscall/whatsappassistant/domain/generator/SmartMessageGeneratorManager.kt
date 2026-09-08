package com.misscall.whatsappassistant.domain.generator

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.GeneratedMessageResult
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest
import com.misscall.whatsappassistant.domain.model.MessageLanguage
import com.misscall.whatsappassistant.domain.model.MessageTone
import kotlinx.coroutines.flow.first
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SmartMessageGeneratorManager @Inject constructor(
    private val localGenerator: LocalMessageGenerator,
    private val remoteGenerator: RemoteAIMessageGenerator,
    private val preferencesRepository: UserPreferencesRepository
) {

    // Thread-safe local cache for generated messages
    private val cache = ConcurrentHashMap<String, String>()

    suspend fun generateMessage(request: MessageGenerationRequest, bypassCache: Boolean = false): GeneratedMessageResult {
        val cacheKey = buildCacheKey(request)

        if (!bypassCache) {
            val cachedContent = cache[cacheKey]
            if (cachedContent != null) {
                return GeneratedMessageResult(
                    content = cachedContent,
                    source = com.misscall.whatsappassistant.domain.model.GenerationSource.LOCAL_RULE_BASED,
                    tone = request.tone,
                    language = request.language,
                    cached = true
                )
            }
        }

        val prefs = preferencesRepository.userPreferencesFlow.first()
        val isRemoteAiEnabled = prefs.isAutoReplyEnabled && prefs.encryptedCloudApiToken.isNotBlank()

        val result = if (isRemoteAiEnabled) {
            try {
                remoteGenerator.generate(request)
            } catch (e: Exception) {
                // Seamless offline fallback
                localGenerator.generate(request)
            }
        } else {
            localGenerator.generate(request)
        }

        // Cache the successful generation
        cache[cacheKey] = result.content
        return result
    }

    suspend fun makeShorter(request: MessageGenerationRequest): GeneratedMessageResult {
        return generateMessage(request.copy(tone = MessageTone.SHORT), bypassCache = true)
    }

    suspend fun makeMoreProfessional(request: MessageGenerationRequest): GeneratedMessageResult {
        return generateMessage(request.copy(tone = MessageTone.PROFESSIONAL), bypassCache = true)
    }

    suspend fun translateToHindi(request: MessageGenerationRequest): GeneratedMessageResult {
        return generateMessage(request.copy(language = MessageLanguage.HINDI), bypassCache = true)
    }

    suspend fun translateToHinglish(request: MessageGenerationRequest): GeneratedMessageResult {
        return generateMessage(request.copy(language = MessageLanguage.HINGLISH), bypassCache = true)
    }

    fun clearCache() {
        cache.clear()
    }

    private fun buildCacheKey(request: MessageGenerationRequest): String {
        return "${request.businessName}_${request.customerPhone}_${request.missedCallTime}_${request.tone.name}_${request.language.name}"
    }
}
