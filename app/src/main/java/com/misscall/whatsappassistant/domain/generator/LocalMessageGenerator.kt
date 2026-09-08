package com.misscall.whatsappassistant.domain.generator

import com.misscall.whatsappassistant.domain.model.GeneratedMessageResult
import com.misscall.whatsappassistant.domain.model.GenerationSource
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest
import com.misscall.whatsappassistant.domain.model.MessageLanguage
import com.misscall.whatsappassistant.domain.model.MessageTone
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalMessageGenerator @Inject constructor() : MessageGenerator {

    override fun isAvailable(): Boolean = true

    override suspend fun generate(request: MessageGenerationRequest): GeneratedMessageResult {
        val hasName = !request.customerName.isNullOrBlank() && request.customerName != request.customerPhone
        val name = if (hasName) request.customerName!!.trim() else ""
        val business = request.businessName.ifBlank { "our team" }
        val time = request.missedCallTime.ifBlank { "a moment ago" }

        val content = when (request.language) {
            MessageLanguage.ENGLISH -> generateEnglish(name, business, time, request.tone)
            MessageLanguage.HINDI -> generateHindi(name, business, time, request.tone)
            MessageLanguage.HINGLISH -> generateHinglish(name, business, time, request.tone)
        }

        return GeneratedMessageResult(
            content = content.trim(),
            source = GenerationSource.LOCAL_RULE_BASED,
            tone = request.tone,
            language = request.language,
            cached = false
        )
    }

    private fun generateEnglish(name: String, business: String, time: String, tone: MessageTone): String {
        val greeting = when (tone) {
            MessageTone.PROFESSIONAL -> if (name.isNotBlank()) "Dear $name," else "Hello,"
            MessageTone.FRIENDLY -> if (name.isNotBlank()) "Hi $name!" else "Hi!"
            MessageTone.SHORT -> if (name.isNotBlank()) "Hi $name," else "Hi,"
            MessageTone.PREMIUM -> if (name.isNotBlank()) "Hello $name," else "Hello,"
        }

        return when (tone) {
            MessageTone.PROFESSIONAL -> {
                "$greeting thank you for reaching out to $business. We apologize for missing your call at $time. Please let us know how we may assist you."
            }
            MessageTone.FRIENDLY -> {
                "$greeting We noticed that you called $business. Sorry we missed your call at $time. How can we help you today?"
            }
            MessageTone.SHORT -> {
                "$greeting missed your call to $business at $time. How can we help?"
            }
            MessageTone.PREMIUM -> {
                "$greeting thank you for contacting $business. We regret missing your call at $time. Please let us know your requirements and our team will attend to you promptly."
            }
        }
    }

    private fun generateHindi(name: String, business: String, time: String, tone: MessageTone): String {
        val greeting = if (name.isNotBlank()) "नमस्ते $name जी," else "नमस्ते,"

        return when (tone) {
            MessageTone.PROFESSIONAL -> {
                "$greeting $business में संपर्क करने के लिए धन्यवाद। $time पर आया आपका कॉल हम नहीं उठा पाए, इसके लिए हमें खेद है। कृपया बताएं हम आपकी क्या सहायता कर सकते हैं?"
            }
            MessageTone.FRIENDLY -> {
                "$greeting $business पर कॉल करने के लिए धन्यवाद। क्षमा करें हम आपका कॉल नहीं उठा सके। हम आपकी क्या मदद कर सकते हैं?"
            }
            MessageTone.SHORT -> {
                "$greeting $business पर आपका कॉल छूट गया। बताएं हम आपकी क्या मदद कर सकते हैं?"
            }
            MessageTone.PREMIUM -> {
                "$greeting $business में आपका स्वागत है। $time पर आपका कॉल हम अटेंड नहीं कर सके। कृपया अपनी आवश्यकता बताएं, हम तुरंत संपर्क करेंगे।"
            }
        }
    }

    private fun generateHinglish(name: String, business: String, time: String, tone: MessageTone): String {
        val greeting = when (tone) {
            MessageTone.PROFESSIONAL -> if (name.isNotBlank()) "Hello $name ji," else "Hello,"
            MessageTone.FRIENDLY -> if (name.isNotBlank()) "Hi $name!" else "Hi!"
            MessageTone.SHORT -> if (name.isNotBlank()) "Hi $name," else "Hi,"
            MessageTone.PREMIUM -> if (name.isNotBlank()) "Hello $name," else "Hello,"
        }

        return when (tone) {
            MessageTone.PROFESSIONAL -> {
                "$greeting $business par call karne ke liye thank you. $time par aaya aapka call hum attend nahi kar paaye. Please batayein hum aapki kaise help kar sakte hain?"
            }
            MessageTone.FRIENDLY -> {
                "$greeting Humne notice kiya aapne $business par call kiya tha. Sorry hum aapka call miss kar gaye. Batayein hum aapki kya help kar sakte hain?"
            }
            MessageTone.SHORT -> {
                "$greeting $business par aapka call miss ho gaya at $time. How can we help?"
            }
            MessageTone.PREMIUM -> {
                "$greeting $business me contact karne ke liye dhanyawad. We regret missing your call at $time. Please batayein aapko kya help chahiye, hum jaldi update denge."
            }
        }
    }
}
