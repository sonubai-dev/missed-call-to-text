package com.misscall.whatsappassistant.crm

import com.misscall.whatsappassistant.crm.webhook.WebhookSignature
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WebhookSignatureTest {

    private val testSecret = "my_super_secret_crm_key_123"
    private val testPayload = """{"event":"missed_call","customer":{"phone":"+919876543210"}}"""
    private val testTimestamp = 1725580800000L

    @Test
    fun `generateSignature produces non-empty hex string for valid secret`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        assertTrue("Signature should not be empty", signature.isNotBlank())
        assertEquals("HMAC-SHA256 hex output should be 64 chars", 64, signature.length)
        assertTrue("Signature should be valid hex", signature.all { it in '0'..'9' || it in 'a'..'f' })
    }

    @Test
    fun `generateSignature returns empty string when secret is blank`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, "")
        assertEquals("", signature)
    }

    @Test
    fun `verifySignature succeeds with matching signature`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        val isValid = WebhookSignature.verifySignature(testPayload, testTimestamp, testSecret, signature)
        assertTrue("Signature verification should succeed", isValid)
    }

    @Test
    fun `verifySignature fails with wrong secret`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        val isValid = WebhookSignature.verifySignature(testPayload, testTimestamp, "wrong_secret", signature)
        assertFalse("Signature verification should fail with wrong secret", isValid)
    }

    @Test
    fun `verifySignature fails with modified payload`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        val tamperedPayload = """{"event":"missed_call","customer":{"phone":"+919999999999"}}"""
        val isValid = WebhookSignature.verifySignature(tamperedPayload, testTimestamp, testSecret, signature)
        assertFalse("Signature verification should fail with tampered payload", isValid)
    }

    @Test
    fun `verifySignature fails with different timestamp`() {
        val signature = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        val differentTimestamp = testTimestamp + 1000L
        val isValid = WebhookSignature.verifySignature(testPayload, differentTimestamp, testSecret, signature)
        assertFalse("Signature verification should fail with different timestamp", isValid)
    }

    @Test
    fun `different timestamps produce different signatures for idempotency`() {
        val sig1 = WebhookSignature.generateSignature(testPayload, testTimestamp, testSecret)
        val sig2 = WebhookSignature.generateSignature(testPayload, testTimestamp + 1, testSecret)
        assertNotEquals(sig1, sig2)
    }

    @Test
    fun `maskSecret hides sensitive portions`() {
        assertEquals("my****23", WebhookSignature.maskSecret("my_super_secret_crm_key_123"))
        assertEquals("****", WebhookSignature.maskSecret("1234"))
        assertEquals("****", WebhookSignature.maskSecret("abc"))
    }
}
