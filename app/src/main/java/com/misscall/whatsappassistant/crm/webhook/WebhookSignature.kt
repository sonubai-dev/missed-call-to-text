package com.misscall.whatsappassistant.crm.webhook

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object WebhookSignature {

    const val HEADER_EVENT = "X-Event-Type"
    const val HEADER_TIMESTAMP = "X-Timestamp"
    const val HEADER_SIGNATURE = "X-Signature"
    const val HEADER_IDEMPOTENCY_KEY = "X-Event-ID"

    /**
     * Generates HMAC-SHA256 signature for payload with timestamp.
     * Signs "$timestamp.$payload" with secret.
     */
    fun generateSignature(payload: String, timestamp: Long, secret: String): String {
        if (secret.isBlank()) return ""
        val dataToSign = "$timestamp.$payload"
        val algorithm = "HmacSHA256"
        val keySpec = SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), algorithm)
        val mac = Mac.getInstance(algorithm)
        mac.init(keySpec)
        val hmacBytes = mac.doFinal(dataToSign.toByteArray(StandardCharsets.UTF_8))
        return hmacBytes.joinToString("") { "%02x".format(it) }
    }

    /**
     * Verifies HMAC-SHA256 signature using constant-time comparison to prevent timing attacks.
     */
    fun verifySignature(payload: String, timestamp: Long, secret: String, expectedSignature: String): Boolean {
        if (secret.isBlank() || expectedSignature.isBlank()) return false
        val computed = generateSignature(payload, timestamp, secret)
        return MessageDigest.isEqual(
            computed.toByteArray(StandardCharsets.UTF_8),
            expectedSignature.toByteArray(StandardCharsets.UTF_8)
        )
    }

    /**
     * Masks secret to ensure it is never written in plaintext to application logs.
     */
    fun maskSecret(secret: String): String {
        if (secret.length <= 4) return "****"
        return "${secret.take(2)}****${secret.takeLast(2)}"
    }
}
