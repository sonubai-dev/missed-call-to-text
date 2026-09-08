package com.misscall.whatsappassistant.core.logging

import android.util.Log

object AppLogger {
    private const val GLOBAL_TAG = "MissCallAssistant"

    private val PHONE_PATTERN = Regex("""(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}""")
    private val QUERY_SECRET_PATTERN = Regex("""(?i)(secret|token|apikey|password|auth|key)=([^&\s]+)""")
    private val JSON_SECRET_PATTERN = Regex("""(?i)("(?:secret|token|apikey|password|access_token|key)"\s*:\s*)"[^"]*"""")
    private val BEARER_PATTERN = Regex("""(?i)Bearer\s+[A-Za-z0-9\-_.~+/]+=*""")

    fun sanitize(message: String): String {
        var sanitized = message
        
        // Scrub bearer tokens
        sanitized = BEARER_PATTERN.replace(sanitized, "Bearer [REDACTED]")

        // Scrub key=value secrets
        sanitized = QUERY_SECRET_PATTERN.replace(sanitized) { mr ->
            "${mr.groupValues[1]}=[REDACTED]"
        }

        // Scrub json secrets
        sanitized = JSON_SECRET_PATTERN.replace(sanitized) { mr ->
            "${mr.groupValues[1]}\"[REDACTED]\""
        }

        // Mask phone numbers (keep prefix and last 2 digits, mask middle with X)
        sanitized = PHONE_PATTERN.replace(sanitized) { mr ->
            val match = mr.value
            val digitsOnly = match.filter { it.isDigit() }
            if (digitsOnly.length in 10..15) {
                val prefix = if (match.startsWith("+")) match.takeWhile { !it.isDigit() || match.indexOf(it) < 3 } else ""
                val last2 = digitsOnly.takeLast(2)
                val maskedMiddle = "X".repeat((digitsOnly.length - 2).coerceAtLeast(4))
                if (prefix.isNotBlank()) "$prefix $maskedMiddle$last2" else "$maskedMiddle$last2"
            } else {
                match
            }
        }

        return sanitized
    }

    fun d(tag: String, message: String) {
        val safeMessage = sanitize(message)
        try {
            Log.d("$GLOBAL_TAG:$tag", safeMessage)
        } catch (e: RuntimeException) {
            println("[$GLOBAL_TAG:$tag] DEBUG: $safeMessage")
        }
    }

    fun i(tag: String, message: String) {
        val safeMessage = sanitize(message)
        try {
            Log.i("$GLOBAL_TAG:$tag", safeMessage)
        } catch (e: RuntimeException) {
            println("[$GLOBAL_TAG:$tag] INFO: $safeMessage")
        }
    }

    fun w(tag: String, message: String, throwable: Throwable? = null) {
        val safeMessage = sanitize(message)
        try {
            Log.w("$GLOBAL_TAG:$tag", safeMessage, throwable)
        } catch (e: RuntimeException) {
            println("[$GLOBAL_TAG:$tag] WARN: $safeMessage")
        }
    }

    fun e(tag: String, message: String, throwable: Throwable? = null) {
        val safeMessage = sanitize(message)
        try {
            Log.e("$GLOBAL_TAG:$tag", safeMessage, throwable)
        } catch (e: RuntimeException) {
            println("[$GLOBAL_TAG:$tag] ERROR: $safeMessage")
        }
    }
}
