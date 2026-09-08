package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.core.logging.AppLogger
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppLoggerSanitizerTest {

    @Test
    fun `sanitizer masks 10-digit phone number`() {
        val input = "Received incoming call from 9876543210"
        val sanitized = AppLogger.sanitize(input)
        assertFalse("Raw number should not be visible", sanitized.contains("9876543210"))
        assertTrue("Last 2 digits should be retained", sanitized.endsWith("10") || sanitized.contains("10"))
        assertTrue("Digits should be masked with X", sanitized.contains("XXXX"))
    }

    @Test
    fun `sanitizer masks E164 phone number`() {
        val input = "Missed call from +91 9876543210 on SIM 1"
        val sanitized = AppLogger.sanitize(input)
        assertFalse("Raw number should not be visible", sanitized.contains("9876543210"))
        assertTrue("Country prefix or mask should be present", sanitized.contains("+91") && sanitized.contains("X"))
    }

    @Test
    fun `sanitizer scrubs Bearer tokens`() {
        val input = "Authorization header: Bearer ya29.a0AfH6SMAxyz123456789"
        val sanitized = AppLogger.sanitize(input)
        assertFalse("Raw token should not appear", sanitized.contains("ya29.a0AfH6SMAxyz123456789"))
        assertTrue("Should contain Bearer [REDACTED]", sanitized.contains("Bearer [REDACTED]"))
    }

    @Test
    fun `sanitizer scrubs query parameter secrets`() {
        val input = "GET /webhook?secret=super_secret_key_123&caller=Rahul"
        val sanitized = AppLogger.sanitize(input)
        assertFalse("Raw secret should not appear", sanitized.contains("super_secret_key_123"))
        assertTrue("Should redact secret parameter", sanitized.contains("secret=[REDACTED]"))
        assertTrue("Non-secret parameters should be kept", sanitized.contains("caller=Rahul"))
    }

    @Test
    fun `sanitizer scrubs json secret keys`() {
        val input = """{"token": "xyz_secret_token_abc", "status": "active"}"""
        val sanitized = AppLogger.sanitize(input)
        assertFalse("Raw token value should not appear", sanitized.contains("xyz_secret_token_abc"))
        assertTrue("Token should be redacted in json", sanitized.contains(""""token": "[REDACTED]""""))
        assertTrue("Status field should be retained", sanitized.contains(""""status": "active""""))
    }
}
