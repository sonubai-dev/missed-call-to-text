package com.misscall.whatsappassistant.core.permissions

import android.Manifest
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

enum class DetectionEngineMode {
    CALL_SCREENING_SERVICE,
    TELEPHONY_STATE_LISTENER,
    CALL_LOG_OBSERVER,
    LIMITED_MANUAL
}

data class PermissionRationale(
    val title: String,
    val description: String,
    val isPlayStoreSafe: Boolean,
    val isGranted: Boolean
)

@Singleton
class PermissionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {

    fun isCallScreeningRoleHeld(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(Context.ROLE_SERVICE) as? RoleManager
            roleManager?.isRoleHeld(RoleManager.ROLE_CALL_SCREENING) == true
        } else {
            false
        }
    }

    fun createCallScreeningRoleIntent(): Intent? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(Context.ROLE_SERVICE) as? RoleManager
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
                roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
            } else {
                null
            }
        } else {
            null
        }
    }

    fun isPhoneStateGranted(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun isCallLogGranted(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,

        ) == PackageManager.PERMISSION_GRANTED
    }

    fun isNotificationGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun getActiveDetectionEngineMode(): DetectionEngineMode {
        return when {
            isCallScreeningRoleHeld() -> DetectionEngineMode.CALL_SCREENING_SERVICE
            isPhoneStateGranted() -> DetectionEngineMode.TELEPHONY_STATE_LISTENER
            isCallLogGranted() -> DetectionEngineMode.CALL_LOG_OBSERVER
            else -> DetectionEngineMode.LIMITED_MANUAL
        }
    }

    fun getPermissionRationales(): List<PermissionRationale> {
        val rationales = mutableListOf<PermissionRationale>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            rationales.add(
                PermissionRationale(
                    title = "Call Screening Service (Recommended)",
                    description = "Google Play Store standard detection method. Allows instant detection of incoming calls without needing sensitive call log permissions.",
                    isPlayStoreSafe = true,
                    isGranted = isCallScreeningRoleHeld()
                )
            )
        }

        rationales.add(
            PermissionRationale(
                title = "Phone State (READ_PHONE_STATE)",
                description = "Monitors transitions from Ringing to Idle to accurately identify missed calls in real-time.",
                isPlayStoreSafe = true,
                isGranted = isPhoneStateGranted()
            )
        )

        rationales.add(
            PermissionRationale(

                description = "Optional fallback to sync caller details from Android's system call history.",
                isPlayStoreSafe = false,
                isGranted = isCallLogGranted()
            )
        )

        rationales.add(
            PermissionRationale(
                title = "Notifications (POST_NOTIFICATIONS)",
                description = "Required to display one-tap interactive WhatsApp follow-up action buttons when a call is missed.",
                isPlayStoreSafe = true,
                isGranted = isNotificationGranted()
            )
        )

        return rationales
    }
}
