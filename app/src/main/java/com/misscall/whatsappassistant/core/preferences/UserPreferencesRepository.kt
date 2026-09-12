package com.misscall.whatsappassistant.core.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.misscall.whatsappassistant.core.security.CryptoManager
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = Constants.DATASTORE_NAME)

@Singleton
class UserPreferencesRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val cryptoManager: CryptoManager
) {
    private object PreferencesKeys {
        // Business
        val BUSINESS_NAME = stringPreferencesKey("business_name")
        val OWNER_NAME = stringPreferencesKey("owner_name")
        val BUSINESS_CATEGORY = stringPreferencesKey("business_category")
        val BUSINESS_PHONE = stringPreferencesKey("business_phone")
        val DEFAULT_LANGUAGE = stringPreferencesKey("default_language")
        val TIMEZONE = stringPreferencesKey("timezone")
        val DEFAULT_COUNTRY_CODE = stringPreferencesKey("default_country_code")

        // Missed Call
        val IS_MONITORING_SERVICE_ENABLED = booleanPreferencesKey("is_monitoring_service_enabled")
        val DETECT_UNKNOWN_NUMBERS = booleanPreferencesKey("detect_unknown_numbers")
        val IGNORE_CONTACTS = booleanPreferencesKey("ignore_contacts")
        val MIN_RING_DURATION_SECONDS = intPreferencesKey("min_ring_duration_seconds")
        val DUPLICATE_PROTECTION_ENABLED = booleanPreferencesKey("duplicate_protection_enabled")

        // WhatsApp
        val WHATSAPP_SENDING_MODE = stringPreferencesKey("whatsapp_sending_mode")
        val WHATSAPP_DISPATCH_MODE = stringPreferencesKey("whatsapp_dispatch_mode")

        // Automation
        val IS_AUTO_REPLY_ENABLED = booleanPreferencesKey("is_auto_reply_enabled")
        val AUTO_REPLY_DELAY_MINUTES = intPreferencesKey("auto_reply_delay_minutes")
        val MAX_FOLLOW_UPS_PER_CUSTOMER = intPreferencesKey("max_follow_ups_per_customer")
        val COOLDOWN_MINUTES = intPreferencesKey("cooldown_minutes")
        val IS_AI_ENABLED = booleanPreferencesKey("is_ai_enabled")
        val AI_LANGUAGE = stringPreferencesKey("ai_language")
        val AI_TONE = stringPreferencesKey("ai_tone")

        // Working Hours
        val WORKING_HOURS_ENABLED = booleanPreferencesKey("working_hours_enabled")
        val WORKING_HOURS_START_HOUR = intPreferencesKey("working_hours_start_hour")
        val WORKING_HOURS_START_MINUTE = intPreferencesKey("working_hours_start_minute")
        val WORKING_HOURS_END_HOUR = intPreferencesKey("working_hours_end_hour")
        val WORKING_HOURS_END_MINUTE = intPreferencesKey("working_hours_end_minute")

        // Notifications
        val NOTIFY_ON_MISSED_CALL = booleanPreferencesKey("notify_on_missed_call")
        val NOTIFY_ON_MESSAGE_SENT = booleanPreferencesKey("notify_on_message_sent")
        val NOTIFY_ON_MESSAGE_FAILED = booleanPreferencesKey("notify_on_message_failed")

        // Onboarding
        val HAS_COMPLETED_ONBOARDING = booleanPreferencesKey("has_completed_onboarding")

        // Cloud API Configuration
        val CLOUD_API_PHONE_ID = stringPreferencesKey("cloud_api_phone_id")
        val CLOUD_API_BUSINESS_ACCOUNT_ID = stringPreferencesKey("cloud_api_business_account_id")
        val CLOUD_API_WEBHOOK_URL = stringPreferencesKey("cloud_api_webhook_url")
        val CLOUD_API_VERIFY_TOKEN = stringPreferencesKey("cloud_api_verify_token")
        val ENCRYPTED_CLOUD_API_TOKEN = stringPreferencesKey("encrypted_cloud_api_token")

        // WhatsApp Web Configuration
        val WHATSAPP_WEB_CONNECTED_NUMBER = stringPreferencesKey("whatsapp_web_connected_number")
        val WHATSAPP_WEB_SESSION_ACTIVE = booleanPreferencesKey("whatsapp_web_session_active")

        // SMS Automation
        val IS_AUTOMATIC_SMS_ENABLED = booleanPreferencesKey("is_automatic_sms_enabled")
        val SMS_DELAY_MINUTES = intPreferencesKey("sms_delay_minutes")
        val DEFAULT_SMS_TEMPLATE_ID = longPreferencesKey("default_sms_template_id")
        val SMS_DUPLICATE_PROTECTION_HOURS = intPreferencesKey("sms_duplicate_protection_hours")
        val SELECTED_SMS_SUBSCRIPTION_ID = intPreferencesKey("selected_sms_subscription_id")
        val IS_WHATSAPP_AUTO_REPLY_ENABLED = booleanPreferencesKey("is_whatsapp_auto_reply_enabled")
        val IS_SMS_AUTO_REPLY_ENABLED = booleanPreferencesKey("is_sms_auto_reply_enabled")
        val IS_WHATSAPP_FALLBACK_TO_SMS_ENABLED = booleanPreferencesKey("is_whatsapp_fallback_to_sms_enabled")

        // CRM & Webhook Integration
        val IS_CRM_INTEGRATION_ENABLED = booleanPreferencesKey("is_crm_integration_enabled")
        val CRM_WEBHOOK_URL = stringPreferencesKey("crm_webhook_url")
        val CRM_WEBHOOK_SECRET = stringPreferencesKey("crm_webhook_secret")
        val CRM_WEBHOOK_EVENTS = stringSetPreferencesKey("crm_webhook_events")

        // Auth
        val JWT_TOKEN = stringPreferencesKey("jwt_token")
        val SUBSCRIPTION_STATUS = stringPreferencesKey("subscription_status")
    }

    val userPreferencesFlow: Flow<UserPreferences> = context.dataStore.data.map { preferences ->
        val modeString = preferences[PreferencesKeys.WHATSAPP_DISPATCH_MODE] ?: WhatsAppDispatchMode.AUTO_DETECT.name
        val mode = try {
            WhatsAppDispatchMode.valueOf(modeString)
        } catch (e: Exception) {
            WhatsAppDispatchMode.AUTO_DETECT
        }

        val sendingModeString = preferences[PreferencesKeys.WHATSAPP_SENDING_MODE] ?: WhatsAppSendingMode.MANUAL.name
        val sendingMode = try {
            WhatsAppSendingMode.valueOf(sendingModeString)
        } catch (e: Exception) {
            WhatsAppSendingMode.MANUAL
        }

        UserPreferences(
            businessName = preferences[PreferencesKeys.BUSINESS_NAME] ?: "My Business",
            ownerName = preferences[PreferencesKeys.OWNER_NAME] ?: "Business Owner",
            businessCategory = preferences[PreferencesKeys.BUSINESS_CATEGORY] ?: "Customer Support",
            businessPhone = preferences[PreferencesKeys.BUSINESS_PHONE] ?: "",
            defaultLanguage = preferences[PreferencesKeys.DEFAULT_LANGUAGE] ?: "English",
            timezone = preferences[PreferencesKeys.TIMEZONE] ?: "Asia/Kolkata",
            defaultCountryCode = preferences[PreferencesKeys.DEFAULT_COUNTRY_CODE] ?: "91",

            isMonitoringServiceEnabled = preferences[PreferencesKeys.IS_MONITORING_SERVICE_ENABLED] ?: true,
            detectUnknownNumbers = preferences[PreferencesKeys.DETECT_UNKNOWN_NUMBERS] ?: true,
            ignoreContacts = preferences[PreferencesKeys.IGNORE_CONTACTS] ?: false,
            minRingDurationSeconds = preferences[PreferencesKeys.MIN_RING_DURATION_SECONDS] ?: 0,
            duplicateProtectionEnabled = preferences[PreferencesKeys.DUPLICATE_PROTECTION_ENABLED] ?: true,

            whatsAppSendingMode = sendingMode,
            whatsAppDispatchMode = mode,

            isAutoReplyEnabled = preferences[PreferencesKeys.IS_AUTO_REPLY_ENABLED] ?: false,
            autoReplyDelayMinutes = preferences[PreferencesKeys.AUTO_REPLY_DELAY_MINUTES] ?: 1,
            maxFollowUpsPerCustomer = preferences[PreferencesKeys.MAX_FOLLOW_UPS_PER_CUSTOMER] ?: 1,
            cooldownMinutes = preferences[PreferencesKeys.COOLDOWN_MINUTES] ?: 120,
            isAiEnabled = preferences[PreferencesKeys.IS_AI_ENABLED] ?: false,
            aiLanguage = preferences[PreferencesKeys.AI_LANGUAGE] ?: "ENGLISH",
            aiTone = preferences[PreferencesKeys.AI_TONE] ?: "FRIENDLY",

            workingHoursEnabled = preferences[PreferencesKeys.WORKING_HOURS_ENABLED] ?: false,
            workingHoursStartHour = preferences[PreferencesKeys.WORKING_HOURS_START_HOUR] ?: 9,
            workingHoursStartMinute = preferences[PreferencesKeys.WORKING_HOURS_START_MINUTE] ?: 0,
            workingHoursEndHour = preferences[PreferencesKeys.WORKING_HOURS_END_HOUR] ?: 18,
            workingHoursEndMinute = preferences[PreferencesKeys.WORKING_HOURS_END_MINUTE] ?: 0,

            notifyOnMissedCall = preferences[PreferencesKeys.NOTIFY_ON_MISSED_CALL] ?: true,
            notifyOnMessageSent = preferences[PreferencesKeys.NOTIFY_ON_MESSAGE_SENT] ?: true,
            notifyOnMessageFailed = preferences[PreferencesKeys.NOTIFY_ON_MESSAGE_FAILED] ?: true,

            hasCompletedOnboarding = preferences[PreferencesKeys.HAS_COMPLETED_ONBOARDING] ?: false,

            cloudApiPhoneId = preferences[PreferencesKeys.CLOUD_API_PHONE_ID] ?: "",
            cloudApiBusinessAccountId = preferences[PreferencesKeys.CLOUD_API_BUSINESS_ACCOUNT_ID] ?: "",
            cloudApiWebhookUrl = preferences[PreferencesKeys.CLOUD_API_WEBHOOK_URL] ?: "",
            cloudApiVerifyToken = preferences[PreferencesKeys.CLOUD_API_VERIFY_TOKEN] ?: "",
            encryptedCloudApiToken = preferences[PreferencesKeys.ENCRYPTED_CLOUD_API_TOKEN] ?: "",

            whatsAppWebConnectedNumber = preferences[PreferencesKeys.WHATSAPP_WEB_CONNECTED_NUMBER] ?: "",
            whatsAppWebSessionActive = preferences[PreferencesKeys.WHATSAPP_WEB_SESSION_ACTIVE] ?: false,

            isAutomaticSmsEnabled = preferences[PreferencesKeys.IS_AUTOMATIC_SMS_ENABLED] ?: false,
            smsDelayMinutes = preferences[PreferencesKeys.SMS_DELAY_MINUTES] ?: 0,
            defaultSmsTemplateId = preferences[PreferencesKeys.DEFAULT_SMS_TEMPLATE_ID] ?: 2L,
            smsDuplicateProtectionHours = preferences[PreferencesKeys.SMS_DUPLICATE_PROTECTION_HOURS] ?: 24,
            selectedSmsSubscriptionId = preferences[PreferencesKeys.SELECTED_SMS_SUBSCRIPTION_ID] ?: -1,
            isWhatsAppAutoReplyEnabled = preferences[PreferencesKeys.IS_WHATSAPP_AUTO_REPLY_ENABLED] ?: true,
            isSmsAutoReplyEnabled = preferences[PreferencesKeys.IS_SMS_AUTO_REPLY_ENABLED] ?: false,
            isWhatsAppFallbackToSmsEnabled = preferences[PreferencesKeys.IS_WHATSAPP_FALLBACK_TO_SMS_ENABLED] ?: false,

            isCrmIntegrationEnabled = preferences[PreferencesKeys.IS_CRM_INTEGRATION_ENABLED] ?: false,
            crmWebhookUrl = preferences[PreferencesKeys.CRM_WEBHOOK_URL] ?: "",
            crmWebhookSecret = preferences[PreferencesKeys.CRM_WEBHOOK_SECRET] ?: "",
            crmWebhookEvents = preferences[PreferencesKeys.CRM_WEBHOOK_EVENTS] ?: setOf(
                "missed_call",
                "customer_created",
                "whatsapp_sent",
                "sms_sent",
                "followup_completed"
            ),

            jwtToken = preferences[PreferencesKeys.JWT_TOKEN] ?: "",
            subscriptionStatus = preferences[PreferencesKeys.SUBSCRIPTION_STATUS] ?: "INACTIVE"
        )
    }

    suspend fun setAuthDetails(token: String, status: String) {
        context.dataStore.edit {
            it[PreferencesKeys.JWT_TOKEN] = token
            it[PreferencesKeys.SUBSCRIPTION_STATUS] = status
        }
    }

    suspend fun setSubscriptionStatus(status: String) {
        context.dataStore.edit {
            it[PreferencesKeys.SUBSCRIPTION_STATUS] = status
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit {
            it.remove(PreferencesKeys.JWT_TOKEN)
            it.remove(PreferencesKeys.SUBSCRIPTION_STATUS)
        }
    }

    suspend fun setWhatsAppSendingMode(mode: WhatsAppSendingMode) {
        context.dataStore.edit { it[PreferencesKeys.WHATSAPP_SENDING_MODE] = mode.name }
    }

    suspend fun setAutoReplyEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_AUTO_REPLY_ENABLED] = enabled }
    }

    suspend fun setAutoReplyDelayMinutes(minutes: Int) {
        context.dataStore.edit { it[PreferencesKeys.AUTO_REPLY_DELAY_MINUTES] = minutes }
    }

    suspend fun setMaxFollowUpsPerCustomer(max: Int) {
        context.dataStore.edit { it[PreferencesKeys.MAX_FOLLOW_UPS_PER_CUSTOMER] = max }
    }

    suspend fun setAiSettings(enabled: Boolean, language: String, tone: String) {
        context.dataStore.edit {
            it[PreferencesKeys.IS_AI_ENABLED] = enabled
            it[PreferencesKeys.AI_LANGUAGE] = language
            it[PreferencesKeys.AI_TONE] = tone
        }
    }

    suspend fun setMissedCallDetectionSettings(
        enabled: Boolean,
        detectUnknown: Boolean,
        ignoreContacts: Boolean,
        minRingDuration: Int,
        duplicateProtection: Boolean
    ) {
        context.dataStore.edit {
            it[PreferencesKeys.IS_MONITORING_SERVICE_ENABLED] = enabled
            it[PreferencesKeys.DETECT_UNKNOWN_NUMBERS] = detectUnknown
            it[PreferencesKeys.IGNORE_CONTACTS] = ignoreContacts
            it[PreferencesKeys.MIN_RING_DURATION_SECONDS] = minRingDuration
            it[PreferencesKeys.DUPLICATE_PROTECTION_ENABLED] = duplicateProtection
        }
    }

    suspend fun setNotificationSettings(missedCall: Boolean, msgSent: Boolean, msgFailed: Boolean) {
        context.dataStore.edit {
            it[PreferencesKeys.NOTIFY_ON_MISSED_CALL] = missedCall
            it[PreferencesKeys.NOTIFY_ON_MESSAGE_SENT] = msgSent
            it[PreferencesKeys.NOTIFY_ON_MESSAGE_FAILED] = msgFailed
        }
    }

    suspend fun setCooldownMinutes(minutes: Int) {
        context.dataStore.edit { it[PreferencesKeys.COOLDOWN_MINUTES] = minutes }
    }

    suspend fun updateBusinessProfile(
        businessName: String,
        ownerName: String,
        category: String,
        countryCode: String,
        phone: String = "",
        language: String = "English",
        timezone: String = "Asia/Kolkata"
    ) {
        context.dataStore.edit {
            it[PreferencesKeys.BUSINESS_NAME] = businessName
            it[PreferencesKeys.OWNER_NAME] = ownerName
            it[PreferencesKeys.BUSINESS_CATEGORY] = category
            it[PreferencesKeys.DEFAULT_COUNTRY_CODE] = countryCode
            it[PreferencesKeys.BUSINESS_PHONE] = phone
            it[PreferencesKeys.DEFAULT_LANGUAGE] = language
            it[PreferencesKeys.TIMEZONE] = timezone
        }
    }

    suspend fun setWhatsAppDispatchMode(mode: WhatsAppDispatchMode) {
        context.dataStore.edit { it[PreferencesKeys.WHATSAPP_DISPATCH_MODE] = mode.name }
    }

    suspend fun updateWorkingHours(enabled: Boolean, startHour: Int, startMinute: Int, endHour: Int, endMinute: Int) {
        context.dataStore.edit {
            it[PreferencesKeys.WORKING_HOURS_ENABLED] = enabled
            it[PreferencesKeys.WORKING_HOURS_START_HOUR] = startHour
            it[PreferencesKeys.WORKING_HOURS_START_MINUTE] = startMinute
            it[PreferencesKeys.WORKING_HOURS_END_HOUR] = endHour
            it[PreferencesKeys.WORKING_HOURS_END_MINUTE] = endMinute
        }
    }

    suspend fun setMonitoringServiceEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_MONITORING_SERVICE_ENABLED] = enabled }
    }

    suspend fun setNotifyOnMissedCall(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.NOTIFY_ON_MISSED_CALL] = enabled }
    }

    suspend fun setCompletedOnboarding(completed: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.HAS_COMPLETED_ONBOARDING] = completed }
    }

    suspend fun setCloudApiCredentials(phoneId: String, rawToken: String) {
        val encryptedToken = if (rawToken.isNotEmpty()) cryptoManager.encrypt(rawToken) else ""
        context.dataStore.edit {
            it[PreferencesKeys.CLOUD_API_PHONE_ID] = phoneId
            it[PreferencesKeys.ENCRYPTED_CLOUD_API_TOKEN] = encryptedToken
        }
    }

    suspend fun setCloudApiCredentials(
        phoneId: String,
        businessAccountId: String,
        rawToken: String,
        webhookUrl: String = "",
        verifyToken: String = ""
    ) {
        val encryptedToken = if (rawToken.isNotEmpty()) cryptoManager.encrypt(rawToken) else ""
        context.dataStore.edit {
            it[PreferencesKeys.CLOUD_API_PHONE_ID] = phoneId
            it[PreferencesKeys.CLOUD_API_BUSINESS_ACCOUNT_ID] = businessAccountId
            it[PreferencesKeys.ENCRYPTED_CLOUD_API_TOKEN] = encryptedToken
            it[PreferencesKeys.CLOUD_API_WEBHOOK_URL] = webhookUrl
            it[PreferencesKeys.CLOUD_API_VERIFY_TOKEN] = verifyToken
        }
    }

    suspend fun setWhatsAppWebSession(connectedNumber: String, active: Boolean) {
        context.dataStore.edit {
            it[PreferencesKeys.WHATSAPP_WEB_CONNECTED_NUMBER] = connectedNumber
            it[PreferencesKeys.WHATSAPP_WEB_SESSION_ACTIVE] = active
        }
    }

    suspend fun clearCloudApiCredentials() {
        context.dataStore.edit {
            it.remove(PreferencesKeys.CLOUD_API_PHONE_ID)
            it.remove(PreferencesKeys.CLOUD_API_BUSINESS_ACCOUNT_ID)
            it.remove(PreferencesKeys.ENCRYPTED_CLOUD_API_TOKEN)
            it.remove(PreferencesKeys.CLOUD_API_WEBHOOK_URL)
            it.remove(PreferencesKeys.CLOUD_API_VERIFY_TOKEN)
        }
    }

    suspend fun clearAllPreferences() {
        context.dataStore.edit { it.clear() }
    }

    fun getDecryptedCloudApiToken(encryptedToken: String): String {
        return cryptoManager.decrypt(encryptedToken)
    }

    suspend fun setAutomaticSmsEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_AUTOMATIC_SMS_ENABLED] = enabled }
    }

    suspend fun setSmsDelayMinutes(minutes: Int) {
        context.dataStore.edit { it[PreferencesKeys.SMS_DELAY_MINUTES] = minutes }
    }

    suspend fun setDefaultSmsTemplateId(templateId: Long) {
        context.dataStore.edit { it[PreferencesKeys.DEFAULT_SMS_TEMPLATE_ID] = templateId }
    }

    suspend fun setSmsDuplicateProtectionHours(hours: Int) {
        context.dataStore.edit { it[PreferencesKeys.SMS_DUPLICATE_PROTECTION_HOURS] = hours }
    }

    suspend fun setSelectedSmsSubscriptionId(subId: Int) {
        context.dataStore.edit { it[PreferencesKeys.SELECTED_SMS_SUBSCRIPTION_ID] = subId }
    }

    suspend fun setWhatsAppAutoReplyEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_WHATSAPP_AUTO_REPLY_ENABLED] = enabled }
    }

    suspend fun setSmsAutoReplyEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_SMS_AUTO_REPLY_ENABLED] = enabled }
    }

    suspend fun setWhatsAppFallbackToSmsEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_WHATSAPP_FALLBACK_TO_SMS_ENABLED] = enabled }
    }

    suspend fun setCrmIntegration(
        enabled: Boolean,
        webhookUrl: String,
        secret: String,
        events: Set<String>
    ) {
        context.dataStore.edit {
            it[PreferencesKeys.IS_CRM_INTEGRATION_ENABLED] = enabled
            it[PreferencesKeys.CRM_WEBHOOK_URL] = webhookUrl
            it[PreferencesKeys.CRM_WEBHOOK_SECRET] = secret
            it[PreferencesKeys.CRM_WEBHOOK_EVENTS] = events
        }
    }

    suspend fun setCrmIntegrationEnabled(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_CRM_INTEGRATION_ENABLED] = enabled }
    }
}
