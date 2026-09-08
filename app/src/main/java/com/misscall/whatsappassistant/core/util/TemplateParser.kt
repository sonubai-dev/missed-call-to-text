package com.misscall.whatsappassistant.core.util

object TemplateParser {

    const val VAR_NAME = "{{name}}"
    const val VAR_PHONE = "{{phone}}"
    const val VAR_BUSINESS_NAME = "{{business_name}}"
    const val VAR_DATE = "{{date}}"
    const val VAR_TIME = "{{time}}"

    // Legacy single brace tags for backward compatibility
    const val TAG_CALLER_NAME = "{caller_name}"
    const val TAG_PHONE_NUMBER = "{phone_number}"
    const val TAG_BUSINESS_NAME = "{business_name}"
    const val TAG_TIME = "{time}"
    const val TAG_DATE = "{date}"
    const val TAG_OWNER_NAME = "{owner_name}"

    val AVAILABLE_TAGS = listOf(
        VAR_NAME,
        VAR_BUSINESS_NAME,
        VAR_PHONE,
        VAR_TIME,
        VAR_DATE
    )

    fun parse(
        template: String,
        callerName: String?,
        phoneNumber: String,
        businessName: String,
        ownerName: String = "",
        timestamp: Long = System.currentTimeMillis()
    ): String {
        val hasName = !callerName.isNullOrBlank() && callerName != phoneNumber
        val nameReplacement = if (hasName) callerName!! else "there"

        val timeStr = DateTimeUtils.formatTime(timestamp)
        val dateStr = DateTimeUtils.formatDate(timestamp)

        var result = template

        // Handle {{name}} & {caller_name}
        if (!hasName) {
            // Clean grammatical smoothing when name is missing
            result = result
                .replace("Hi {{name}},", "Hi!", ignoreCase = true)
                .replace("Hello {{name}},", "Hello,", ignoreCase = true)
                .replace("Hi {caller_name},", "Hi!", ignoreCase = true)
                .replace("Hello {caller_name},", "Hello,", ignoreCase = true)
        }

        result = result
            .replace(VAR_NAME, nameReplacement, ignoreCase = true)
            .replace(TAG_CALLER_NAME, nameReplacement, ignoreCase = true)
            .replace(VAR_PHONE, phoneNumber, ignoreCase = true)
            .replace(TAG_PHONE_NUMBER, phoneNumber, ignoreCase = true)
            .replace(VAR_BUSINESS_NAME, businessName, ignoreCase = true)
            .replace(TAG_BUSINESS_NAME, businessName, ignoreCase = true)
            .replace(VAR_DATE, dateStr, ignoreCase = true)
            .replace(TAG_DATE, dateStr, ignoreCase = true)
            .replace(VAR_TIME, timeStr, ignoreCase = true)
            .replace(TAG_TIME, timeStr, ignoreCase = true)
            .replace(TAG_OWNER_NAME, ownerName, ignoreCase = true)

        return result.trim()
    }
}
