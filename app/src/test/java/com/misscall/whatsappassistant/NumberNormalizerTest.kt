package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.core.util.NumberNormalizer
import org.junit.Assert.assertEquals
import org.junit.Test

class NumberNormalizerTest {

    @Test
    fun `normalize Indian 10-digit number`() {
        val result = NumberNormalizer.normalize("9876543210", defaultCountryCode = "91")
        assertEquals("+919876543210", result)
    }

    @Test
    fun `normalize Indian 11-digit number with leading zero`() {
        val result = NumberNormalizer.normalize("09876543210", defaultCountryCode = "91")
        assertEquals("+919876543210", result)
    }

    @Test
    fun `normalize Indian number with country code without plus`() {
        val result = NumberNormalizer.normalize("919876543210", defaultCountryCode = "91")
        assertEquals("+919876543210", result)
    }

    @Test
    fun `normalize Indian number with spaces and dashes`() {
        val result = NumberNormalizer.normalize("+91 98765-43210", defaultCountryCode = "91")
        assertEquals("+919876543210", result)
    }

    @Test
    fun `normalize US international number`() {
        val result = NumberNormalizer.normalize("+1 (555) 123-4567", defaultCountryCode = "91")
        assertEquals("+15551234567", result)
    }

    @Test
    fun `normalize UK international number`() {
        val result = NumberNormalizer.normalize("+44 20 7946 0958", defaultCountryCode = "91")
        assertEquals("+442079460958", result)
    }

    @Test
    fun `normalize RFC3966 tel URI format`() {
        val result = NumberNormalizer.normalize("tel:+919876543210", defaultCountryCode = "91")
        assertEquals("+919876543210", result)
    }

    @Test
    fun `toWhatsAppFormat returns clean digits without plus`() {
        val result = NumberNormalizer.toWhatsAppFormat("+91 98765 43210", defaultCountryCode = "91")
        assertEquals("919876543210", result)
    }

    @Test
    fun `formatDisplay formats Indian and US numbers cleanly`() {
        val indianDisplay = NumberNormalizer.formatDisplay("+919876543210")
        assertEquals("+91 98765 43210", indianDisplay)

        val usDisplay = NumberNormalizer.formatDisplay("+15551234567")
        assertEquals("+1 (555) 123-4567", usDisplay)
    }
}
