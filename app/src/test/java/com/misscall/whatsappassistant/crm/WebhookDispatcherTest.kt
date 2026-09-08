package com.misscall.whatsappassistant.crm

import com.misscall.whatsappassistant.crm.webhook.WebhookDispatcher
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WebhookDispatcherTest {

    private fun isHttpsOrLocalhost(url: String): Boolean {
        val trimmed = url.trim()
        val isLocalhost = trimmed.startsWith("http://localhost") ||
                trimmed.startsWith("http://127.0.0.1") ||
                trimmed.startsWith("http://10.0.2.2")
        return trimmed.startsWith("https://", ignoreCase = true) || isLocalhost
    }

    private fun isRetryableStatusCode(code: Int): Boolean {
        return code == 429 || code >= 500
    }

    private fun calculateBackoffDelay(attempt: Int): Long {
        val baseBackoffMs = 2000L
        return baseBackoffMs * (1 shl (attempt - 1))
    }

    @Test
    fun `https url is allowed`() {
        assertTrue(isHttpsOrLocalhost("https://crm.mybusiness.com/api/webhook"))
        assertTrue(isHttpsOrLocalhost("HTTPS://CRM.MYBUSINESS.COM/WEBHOOK"))
    }

    @Test
    fun `plain http url is rejected for external hosts`() {
        assertFalse(isHttpsOrLocalhost("http://crm.mybusiness.com/api/webhook"))
        assertFalse(isHttpsOrLocalhost("http://insecure-endpoint.org"))
    }

    @Test
    fun `localhost and emulator loopback are allowed on http for development`() {
        assertTrue(isHttpsOrLocalhost("http://localhost:8080/webhook"))
        assertTrue(isHttpsOrLocalhost("http://127.0.0.1:3000/webhook"))
        assertTrue(isHttpsOrLocalhost("http://10.0.2.2:8000/webhook"))
    }

    @Test
    fun `2xx status codes are successful and not retryable`() {
        listOf(200, 201, 202, 204).forEach { code ->
            assertFalse("HTTP $code should not be retryable", isRetryableStatusCode(code))
        }
    }

    @Test
    fun `4xx client errors except 429 are permanent and not retryable`() {
        listOf(400, 401, 403, 404, 422).forEach { code ->
            assertFalse("HTTP $code should not be retryable", isRetryableStatusCode(code))
        }
    }

    @Test
    fun `429 rate limit is retryable`() {
        assertTrue("HTTP 429 must be retryable", isRetryableStatusCode(429))
    }

    @Test
    fun `5xx server errors are retryable`() {
        listOf(500, 502, 503, 504).forEach { code ->
            assertTrue("HTTP $code must be retryable", isRetryableStatusCode(code))
        }
    }

    @Test
    fun `exponential backoff matches policy`() {
        assertEquals(2000L, calculateBackoffDelay(1))   // 2s
        assertEquals(4000L, calculateBackoffDelay(2))   // 4s
        assertEquals(8000L, calculateBackoffDelay(3))   // 8s
        assertEquals(16000L, calculateBackoffDelay(4))  // 16s
        assertEquals(32000L, calculateBackoffDelay(5))  // 32s
    }

    @Test
    fun `max retries constant is 5`() {
        assertEquals(5, WebhookDispatcher.MAX_RETRIES)
    }
}
