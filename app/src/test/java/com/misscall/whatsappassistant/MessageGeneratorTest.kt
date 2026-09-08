package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.domain.generator.LocalMessageGenerator
import com.misscall.whatsappassistant.domain.model.GenerationSource
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest
import com.misscall.whatsappassistant.domain.model.MessageLanguage
import com.misscall.whatsappassistant.domain.model.MessageTone
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MessageGeneratorTest {

    private val generator = LocalMessageGenerator()

    @Test
    fun `generates friendly English message with customer name`() = runBlocking {
        val request = MessageGenerationRequest(
            businessName = "ABC Dental Clinic",
            customerPhone = "+919876543210",
            customerName = "Rahul",
            missedCallTime = "7:30 PM",
            tone = MessageTone.FRIENDLY,
            language = MessageLanguage.ENGLISH
        )
        val result = generator.generate(request)

        assertEquals(GenerationSource.LOCAL_RULE_BASED, result.source)
        assertTrue(result.content.contains("Hi Rahul!"))
        assertTrue(result.content.contains("ABC Dental Clinic"))
        assertTrue(result.content.contains("7:30 PM"))
    }

    @Test
    fun `generates professional English message without customer name`() = runBlocking {
        val request = MessageGenerationRequest(
            businessName = "Apex Solutions",
            customerPhone = "+919876543210",
            customerName = null,
            missedCallTime = "5:15 PM",
            tone = MessageTone.PROFESSIONAL,
            language = MessageLanguage.ENGLISH
        )
        val result = generator.generate(request)

        assertTrue(result.content.startsWith("Hello,"))
        assertTrue(result.content.contains("Apex Solutions"))
        assertTrue(result.content.contains("5:15 PM"))
    }

    @Test
    fun `generates short tone message`() = runBlocking {
        val request = MessageGenerationRequest(
            businessName = "ABC Store",
            customerPhone = "+919876543210",
            missedCallTime = "12:00 PM",
            tone = MessageTone.SHORT,
            language = MessageLanguage.ENGLISH
        )
        val result = generator.generate(request)

        assertTrue(result.content.contains("missed your call to ABC Store"))
    }

    @Test
    fun `generates Hindi message in Devanagari script`() = runBlocking {
        val request = MessageGenerationRequest(
            businessName = "ABC Dental Clinic",
            customerPhone = "+919876543210",
            customerName = "राहुल",
            missedCallTime = "7:30 PM",
            tone = MessageTone.PROFESSIONAL,
            language = MessageLanguage.HINDI
        )
        val result = generator.generate(request)

        assertTrue(result.content.contains("नमस्ते राहुल जी,"))
        assertTrue(result.content.contains("ABC Dental Clinic"))
        assertTrue(result.content.contains("धन्यवाद"))
    }

    @Test
    fun `generates Hinglish message`() = runBlocking {
        val request = MessageGenerationRequest(
            businessName = "ABC Dental Clinic",
            customerPhone = "+919876543210",
            customerName = "Rahul",
            missedCallTime = "7:30 PM",
            tone = MessageTone.FRIENDLY,
            language = MessageLanguage.HINGLISH
        )
        val result = generator.generate(request)

        assertTrue(result.content.contains("Hi Rahul!"))
        assertTrue(result.content.contains("ABC Dental Clinic"))
        assertTrue(result.content.contains("help"))
    }
}
