package com.misscall.whatsappassistant.domain.usecase.sms

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.TemplateParser
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

interface SmsMessageGenerator {
    suspend fun generateSms(
        callerName: String?,
        phoneNumber: String,
        businessName: String,
        businessCategory: String,
        language: String = "English",
        tone: String = "Friendly"
    ): String
}

@Singleton
class LocalSmsMessageGenerator @Inject constructor() : SmsMessageGenerator {

    override suspend fun generateSms(
        callerName: String?,
        phoneNumber: String,
        businessName: String,
        businessCategory: String,
        language: String,
        tone: String
    ): String {
        val hasName = !callerName.isNullOrBlank() && callerName != phoneNumber
        val bizName = businessName.ifBlank { "our team" }

        return when (language.lowercase()) {
            "hindi" -> {
                if (hasName) {
                    "नमस्ते $callerName, $bizName में कॉल करने के लिए धन्यवाद। हम आपकी कॉल नहीं उठा पाए। हम आपकी कैसे मदद कर सकते हैं?"
                } else {
                    "नमस्ते, $bizName में कॉल करने के लिए धन्यवाद। हम आपकी कॉल नहीं उठा पाए। हम आपकी कैसे सहायता कर सकते हैं?"
                }
            }
            "hinglish" -> {
                if (hasName) {
                    "Hi $callerName, sorry hum aapki call miss kar gaye. $bizName se hum aapki kya help kar sakte hain?"
                } else {
                    "Hi, sorry hum aapki call miss kar gaye. $bizName se hum aapki kya help kar sakte hain?"
                }
            }
            else -> { // English
                when (tone.lowercase()) {
                    "short" -> {
                        if (hasName) "Hi $callerName, sorry we missed your call from $bizName. Please reply with your requirement."
                        else "Sorry we missed your call from $bizName. Please reply with your requirement."
                    }
                    "professional" -> {
                        if (hasName) "Hello $callerName, thank you for calling $bizName. We apologize for missing your call. How may we assist you today?"
                        else "Thank you for calling $bizName. We apologize for missing your call. How may we assist you today?"
                    }
                    "premium" -> {
                        if (hasName) "Greetings $callerName, thank you for reaching out to $bizName. Our team will assist you promptly upon your reply."
                        else "Greetings from $bizName. We missed your call and look forward to assisting you. Please reply at your convenience."
                    }
                    else -> { // Friendly default
                        if (hasName) "Hi $callerName, sorry we missed your call to $bizName! Please let us know how we can help you."
                        else "Hi! Sorry we missed your call to $bizName. Please reply here and our team will get back to you shortly."
                    }
                }
            }
        }
    }
}
