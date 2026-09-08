package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.core.util.PhoneNumberHelper
import org.junit.Assert.assertEquals
import org.junit.Test

class PhoneNumberHelperTest {

    @Test
    fun `sanitizeForWhatsApp adds default country code when missing`() {
        val raw = "9876543210"
        val sanitized = PhoneNumberHelper.sanitizeForWhatsApp(raw, defaultCountryCode = "91")
        assertEquals("919876543210", sanitized)
    }

    @Test
    fun `sanitizeForWhatsApp strips plus sign and special characters`() {
        val raw = "+91 (987) 654-3210"
        val sanitized = PhoneNumberHelper.sanitizeForWhatsApp(raw, defaultCountryCode = "91")
        assertEquals("919876543210", sanitized)
    }

    @Test
    fun `formatForDisplay produces spaced readable format`() {
        val raw = "9876543210"
        val formatted = PhoneNumberHelper.formatForDisplay(raw)
        assertEquals("98765 43210", formatted)
    }
}
