package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.telephony.sms.SmsMessageCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SmsMessageCalculatorTest {

    @Test
    fun `empty message calculates 0 characters and 1 segment`() {
        val info = SmsMessageCalculator.calculate("")
        assertEquals(0, info.characterCount)
        assertEquals(1, info.segmentCount)
        assertEquals(160, info.charactersRemainingInCurrentSegment)
        assertFalse(info.isUnicode)
    }

    @Test
    fun `single segment GSM 7-bit message`() {
        val text = "Hi, sorry we missed your call. We will get back to you shortly."
        val info = SmsMessageCalculator.calculate(text)
        assertEquals(text.length, info.characterCount)
        assertEquals(1, info.segmentCount)
        assertEquals(160 - text.length, info.charactersRemainingInCurrentSegment)
        assertFalse(info.isUnicode)
    }

    @Test
    fun `boundary test exact 160 characters GSM 7-bit`() {
        val text = "a".repeat(160)
        val info = SmsMessageCalculator.calculate(text)
        assertEquals(160, info.characterCount)
        assertEquals(1, info.segmentCount)
        assertEquals(0, info.charactersRemainingInCurrentSegment)
        assertFalse(info.isUnicode)
    }

    @Test
    fun `multi segment GSM 7-bit message at 161 characters`() {
        val text = "a".repeat(161)
        val info = SmsMessageCalculator.calculate(text)
        assertEquals(161, info.characterCount)
        assertEquals(2, info.segmentCount)
        // 2 segments * 153 chars = 306 max, remaining = 306 - 161 = 145
        assertEquals(145, info.charactersRemainingInCurrentSegment)
        assertFalse(info.isUnicode)
    }

    @Test
    fun `single segment Unicode Hindi message`() {
        val text = "नमस्ते, आपकी कॉल छूट गई। हम जल्द संपर्क करेंगे।"
        val info = SmsMessageCalculator.calculate(text)
        assertTrue(info.isUnicode)
        assertTrue(info.characterCount <= 70)
        assertEquals(1, info.segmentCount)
        assertEquals(70 - text.length, info.charactersRemainingInCurrentSegment)
    }

    @Test
    fun `multi segment Unicode message at 71 characters`() {
        val text = "क".repeat(71)
        val info = SmsMessageCalculator.calculate(text)
        assertTrue(info.isUnicode)
        assertEquals(71, info.characterCount)
        assertEquals(2, info.segmentCount)
        // 2 segments * 67 chars = 134 max, remaining = 134 - 71 = 63
        assertEquals(63, info.charactersRemainingInCurrentSegment)
    }
}
