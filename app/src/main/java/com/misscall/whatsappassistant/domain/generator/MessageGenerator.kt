package com.misscall.whatsappassistant.domain.generator

import com.misscall.whatsappassistant.domain.model.GeneratedMessageResult
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest

interface MessageGenerator {
    suspend fun generate(request: MessageGenerationRequest): GeneratedMessageResult
    fun isAvailable(): Boolean
}
