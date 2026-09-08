package com.misscall.whatsappassistant.telephony.sms

data class SmsLengthInfo(
    val characterCount: Int,
    val segmentCount: Int,
    val charactersRemainingInCurrentSegment: Int,
    val isUnicode: Boolean
)

object SmsMessageCalculator {

    // Standard 7-bit GSM character set limit
    private const val GSM_SINGLE_SEGMENT_LIMIT = 160
    private const val GSM_MULTIPART_SEGMENT_LIMIT = 153

    // 16-bit Unicode (UCS-2) character set limit (Hindi, Emojis, etc.)
    private const val UNICODE_SINGLE_SEGMENT_LIMIT = 70
    private const val UNICODE_MULTIPART_SEGMENT_LIMIT = 67

    fun calculate(text: String): SmsLengthInfo {
        if (text.isEmpty()) {
            return SmsLengthInfo(
                characterCount = 0,
                segmentCount = 1,
                charactersRemainingInCurrentSegment = GSM_SINGLE_SEGMENT_LIMIT,
                isUnicode = false
            )
        }

        val isUnicode = isUnicodeText(text)
        val charCount = text.length

        return if (!isUnicode) {
            if (charCount <= GSM_SINGLE_SEGMENT_LIMIT) {
                SmsLengthInfo(
                    characterCount = charCount,
                    segmentCount = 1,
                    charactersRemainingInCurrentSegment = GSM_SINGLE_SEGMENT_LIMIT - charCount,
                    isUnicode = false
                )
            } else {
                val segments = Math.ceil(charCount.toDouble() / GSM_MULTIPART_SEGMENT_LIMIT).toInt()
                val totalCapacity = segments * GSM_MULTIPART_SEGMENT_LIMIT
                SmsLengthInfo(
                    characterCount = charCount,
                    segmentCount = segments,
                    charactersRemainingInCurrentSegment = totalCapacity - charCount,
                    isUnicode = false
                )
            }
        } else {
            if (charCount <= UNICODE_SINGLE_SEGMENT_LIMIT) {
                SmsLengthInfo(
                    characterCount = charCount,
                    segmentCount = 1,
                    charactersRemainingInCurrentSegment = UNICODE_SINGLE_SEGMENT_LIMIT - charCount,
                    isUnicode = true
                )
            } else {
                val segments = Math.ceil(charCount.toDouble() / UNICODE_MULTIPART_SEGMENT_LIMIT).toInt()
                val totalCapacity = segments * UNICODE_MULTIPART_SEGMENT_LIMIT
                SmsLengthInfo(
                    characterCount = charCount,
                    segmentCount = segments,
                    charactersRemainingInCurrentSegment = totalCapacity - charCount,
                    isUnicode = true
                )
            }
        }
    }

    private fun isUnicodeText(text: String): Boolean {
        for (char in text) {
            // Checks if character falls outside standard 7-bit GSM printable range
            if (char.code > 127) {
                return true
            }
        }
        return false
    }
}
