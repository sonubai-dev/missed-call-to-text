package com.misscall.whatsappassistant.core.preferences

import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode
import kotlinx.serialization.Serializable

@Serializable
enum class WhatsAppDispatchMode {
    AUTO_DETECT,
    WHATSAPP_PERSONAL,
    WHATSAPP_BUSINESS,
    CLOUD_API
}

data class UserPreferences(
    // BUSINESS
    val businessName: String = "My Business",
    val ownerName: String = "Business Owner",
    val businessCategory: String = "Customer Support",
    val businessPhone: String = "",
    val defaultLanguage: String = "English",
    val timezone: String = "Asia/Kolkata",
    val defaultCountryCode: String = "91",

    // MISSED CALL
    val isMonitoringServiceEnabled: Boolean = true,
    val detectUnknownNumbers: Boolean = true,
    val ignoreContacts: Boolean = false,
    val minRingDurationSeconds: Int = 0,
    val duplicateProtectionEnabled: Boolean = true,

    // WHATSAPP
    val whatsAppSendingMode: WhatsAppSendingMode = WhatsAppSendingMode.MANUAL,
    val whatsAppDispatchMode: WhatsAppDispatchMode = WhatsAppDispatchMode.AUTO_DETECT,

    // AUTOMATION
    val isAutoReplyEnabled: Boolean = false,
    val autoReplyDelayMinutes: Int = 1,
    val maxFollowUpsPerCustomer: Int = 1,
    val cooldownMinutes: Int = 120, // 2 hours
    val isAiEnabled: Boolean = false,
    val aiLanguage: String = "ENGLISH",
    val aiTone: String = "FRIENDLY",

    // SMS AUTOMATION
    val isAutomaticSmsEnabled: Boolean = false,
    val smsDelayMinutes: Int = 0, // Immediately
    val defaultSmsTemplateId: Long = 2L, // SMS Template 1
    val smsDuplicateProtectionHours: Int = 24, // 24 hours
    val selectedSmsSubscriptionId: Int = -1, // -1 = Default SIM
    val isWhatsAppAutoReplyEnabled: Boolean = true,
    val isSmsAutoReplyEnabled: Boolean = false,
    val isWhatsAppFallbackToSmsEnabled: Boolean = false,

    // WORKING HOURS
    val workingHoursEnabled: Boolean = false,
    val workingHoursStartHour: Int = 9,
    val workingHoursStartMinute: Int = 0,
    val workingHoursEndHour: Int = 18,
    val workingHoursEndMinute: Int = 0,

    // NOTIFICATIONS
    val notifyOnMissedCall: Boolean = true,
    val notifyOnMessageSent: Boolean = true,
    val notifyOnMessageFailed: Boolean = true,

    // ONBOARDING
    val hasCompletedOnboarding: Boolean = false,

    // CLOUD API
    val cloudApiPhoneId: String = "",
    val cloudApiBusinessAccountId: String = "",
    val cloudApiWebhookUrl: String = "",
    val cloudApiVerifyToken: String = "",
    val encryptedCloudApiToken: String = "",

    // WHATSAPP WEB
    val whatsAppWebConnectedNumber: String = "",
    val whatsAppWebSessionActive: Boolean = false,

    // CRM & WEBHOOK INTEGRATION
    val isCrmIntegrationEnabled: Boolean = false,
    val crmWebhookUrl: String = "",
    val crmWebhookSecret: String = "",
    val crmWebhookEvents: Set<String> = setOf(
        "missed_call",
        "customer_created",
        "whatsapp_sent",
        "sms_sent",
        "followup_completed"
    )
)
