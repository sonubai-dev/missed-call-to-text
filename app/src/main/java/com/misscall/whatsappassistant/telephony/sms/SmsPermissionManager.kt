package com.misscall.whatsappassistant.telephony.sms

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SmsPermissionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val PERMISSION_SEND_SMS = Manifest.permission.SEND_SMS
        const val RATIONALE_TITLE = "Direct SIM SMS Follow-ups"
        const val RATIONALE_MESSAGE =
            "SMS permission lets the app send follow-up messages from your business phone's SIM after a missed call. Your standard carrier SMS rates apply."
        const val RATIONALE_NEGATIVE_BUTTON = "Not Now"
        const val RATIONALE_POSITIVE_BUTTON = "Allow SMS"
    }

    fun hasSendSmsPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            PERMISSION_SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun getAppSettingsIntent(): Intent {
        return Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", context.packageName, null)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }
}
