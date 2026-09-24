package com.misscall.whatsappassistant.presentation.settings

import com.misscall.whatsappassistant.core.permissions.DetectionEngineMode
import com.misscall.whatsappassistant.core.permissions.PermissionRationale
import com.misscall.whatsappassistant.core.preferences.UserPreferences

data class SettingsUiState(
    val preferences: UserPreferences = UserPreferences(),
    val isCallScreeningRoleHeld: Boolean = false,
    val isCallLogPermissionGranted: Boolean = false,
    val isPhoneStatePermissionGranted: Boolean = false,
    val isNotificationPermissionGranted: Boolean = false,
    val isSendSmsPermissionGranted: Boolean = false,
    val isSimUnavailableWarning: Boolean = false,
    val isWhatsAppInstalled: Boolean = false,
    val isWhatsAppBusinessInstalled: Boolean = false,
    val activeDetectionMode: DetectionEngineMode = DetectionEngineMode.CALL_SCREENING_SERVICE,
    val rationales: List<PermissionRationale> = emptyList(),
    val decryptedCloudToken: String = "",
    val isLoading: Boolean = false,
    val latestWebhookDelivery: com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity? = null,
    val isSendingTestWebhook: Boolean = false,
    val totalCustomersCount: Int = 0,
    val pendingWebhookEventsCount: Int = 0,
    val lastSyncTimestamp: Long = 0L,
    val userMessage: String? = null
)
