package com.misscall.whatsappassistant.core.util

object PhoneNumberHelper {

    /**
     * Cleans phone number by removing spaces, dashes, parentheses.
     * Ensures valid format for WhatsApp URL / Intent (e.g. +919876543210 or 919876543210).
     */
    fun sanitizeForWhatsApp(phoneNumber: String, defaultCountryCode: String = "91"): String {
        var cleaned = phoneNumber.replace(Regex("[^0-9+]"), "")
        if (cleaned.startsWith("+")) {
            cleaned = cleaned.substring(1)
        } else if (cleaned.length == 10 && !cleaned.startsWith(defaultCountryCode)) {
            // Prepend default country code if 10-digit number without country code
            cleaned = defaultCountryCode + cleaned
        }
        return cleaned
    }

    /**
     * Formats phone number for readable display (e.g., +91 98765 43210 or 98765-43210).
     */
    fun formatForDisplay(phoneNumber: String): String {
        val digits = phoneNumber.replace(Regex("[^0-9+]"), "")
        return if (digits.length == 10) {
            "${digits.substring(0, 5)} ${digits.substring(5)}"
        } else if (digits.length == 12 && digits.startsWith("91")) {
            "+91 ${digits.substring(2, 7)} ${digits.substring(7)}"
        } else if (digits.length == 13 && digits.startsWith("+91")) {
            "+91 ${digits.substring(3, 8)} ${digits.substring(8)}"
        } else {
            digits
        }
    }
}
