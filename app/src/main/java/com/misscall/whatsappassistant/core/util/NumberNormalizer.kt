package com.misscall.whatsappassistant.core.util

object NumberNormalizer {

    /**
     * Normalizes any input phone string (including URI schemes like tel:, spaces, brackets, dashes)
     * into a standard E.164 format (e.g., +919876543210 or +15551234567).
     *
     * Supports Indian phone number formats:
     * - 10 digits (e.g. "9876543210") -> "+919876543210"
     * - 11 digits with leading 0 (e.g. "09876543210") -> "+919876543210"
     * - 12 digits starting with 91 (e.g. "919876543210") -> "+919876543210"
     * - Formatted with +91 (e.g. "+91 98765-43210") -> "+919876543210"
     *
     * Supports International phone numbers with existing country codes (+1, +44, etc.).
     */
    fun normalize(rawNumber: String?, defaultCountryCode: String = "91"): String {
        if (rawNumber.isNullOrBlank()) return ""

        // 1. Remove URI schemes if present (e.g. tel:, sip:)
        var cleaned = rawNumber.trim()
        if (cleaned.startsWith("tel:", ignoreCase = true)) {
            cleaned = cleaned.substring(4)
        }
        if (cleaned.startsWith("sip:", ignoreCase = true)) {
            cleaned = cleaned.substring(4)
        }

        val hasPlus = cleaned.startsWith("+")

        // 2. Remove all non-digit characters except leading plus
        cleaned = cleaned.replace(Regex("[^0-9]"), "")
        if (cleaned.isEmpty()) return ""

        // 3. Handle Indian Number Specifics
        if (defaultCountryCode == "91" || defaultCountryCode == "+91") {
            // Case A: 11 digits starting with 0 (e.g. 09876543210)
            if (cleaned.length == 11 && cleaned.startsWith("0")) {
                return "+91" + cleaned.substring(1)
            }
            // Case B: 10 digits (e.g. 9876543210)
            if (cleaned.length == 10) {
                return "+91$cleaned"
            }
            // Case C: 12 digits starting with 91 (e.g. 919876543210)
            if (cleaned.length == 12 && cleaned.startsWith("91")) {
                return "+$cleaned"
            }
        }

        // 4. General International Handling
        return if (hasPlus) {
            "+$cleaned"
        } else if (cleaned.length > 10) {
            "+$cleaned"
        } else {
            val cleanCode = defaultCountryCode.replace("+", "")
            "+$cleanCode$cleaned"
        }
    }

    /**
     * Extracts digits-only suitable for WhatsApp API URLs (e.g. "919876543210" or "15551234567")
     */
    fun toWhatsAppFormat(rawNumber: String?, defaultCountryCode: String = "91"): String {
        val normalized = normalize(rawNumber, defaultCountryCode)
        return normalized.replace("+", "")
    }

    /**
     * Formats normalized number for clean user display.
     */
    fun formatDisplay(normalizedNumber: String): String {
        if (normalizedNumber.isBlank()) return ""
        val digits = normalizedNumber.replace("+", "")

        // Indian mobile format: +91 98765 43210
        if (digits.length == 12 && digits.startsWith("91")) {
            return "+91 ${digits.substring(2, 7)} ${digits.substring(7)}"
        }
        // US / Canada format: +1 (555) 123-4567
        if (digits.length == 11 && digits.startsWith("1")) {
            return "+1 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}"
        }

        return normalizedNumber
    }
}
