package com.misscall.whatsappassistant.domain.model

enum class MessageTone {
    PROFESSIONAL,
    FRIENDLY,
    SHORT,
    PREMIUM
}

enum class MessageLanguage {
    ENGLISH,
    HINDI,
    HINGLISH
}

enum class GenerationSource {
    LOCAL_RULE_BASED,
    REMOTE_AI
}

data class MessageGenerationRequest(
    val businessName: String,
    val businessCategory: String = "Customer Support",
    val customerPhone: String,
    val customerName: String? = null,
    val missedCallTime: String,
    val tone: MessageTone = MessageTone.FRIENDLY,
    val language: MessageLanguage = MessageLanguage.ENGLISH,
    val baseTemplate: String? = null,
    val customInstruction: String? = null
)

data class GeneratedMessageResult(
    val content: String,
    val source: GenerationSource,
    val tone: MessageTone,
    val language: MessageLanguage,
    val cached: Boolean = false
)
