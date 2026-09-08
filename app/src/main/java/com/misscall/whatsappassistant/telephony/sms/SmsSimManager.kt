package com.misscall.whatsappassistant.telephony.sms

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import androidx.core.content.ContextCompat
import com.misscall.whatsappassistant.core.logging.AppLogger
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

data class SimInfo(
    val subscriptionId: Int,
    val slotIndex: Int,
    val displayName: String,
    val carrierName: String,
    val isDefaultSms: Boolean = false,
    val isEmbedded: Boolean = false
) {
    val displayLabel: String
        get() = if (slotIndex >= 0) {
            "SIM ${slotIndex + 1} ($carrierName)"
        } else {
            "SIM ($carrierName)"
        }
}

sealed class SimAvailabilityResult {
    data class Available(val simInfo: SimInfo) : SimAvailabilityResult()
    data class Missing(val selectedSubscriptionId: Int, val message: String) : SimAvailabilityResult()
    data object NoSimPresent : SimAvailabilityResult()
}

@Singleton
class SmsSimManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "SmsSimManager"
        const val SUBSCRIPTION_ID_DEFAULT = -1
    }

    private val subscriptionManager: SubscriptionManager? by lazy {
        context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
    }

    fun hasPhoneStatePermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun getDefaultSmsSubscriptionId(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            SubscriptionManager.getDefaultSmsSubscriptionId()
        } else {
            SUBSCRIPTION_ID_DEFAULT
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun getActiveSimCards(): List<SimInfo> = withContext(Dispatchers.IO) {
        try {
            if (!hasPhoneStatePermission()) {
                AppLogger.w(TAG, "READ_PHONE_STATE permission not granted. Cannot query SubscriptionManager.")
                return@withContext emptyList()
            }

            val manager = subscriptionManager ?: return@withContext emptyList()
            val subscriptionList: List<SubscriptionInfo>? = manager.activeSubscriptionInfoList

            if (subscriptionList.isNullOrEmpty()) {
                AppLogger.d(TAG, "No active subscriptions detected.")
                return@withContext emptyList()
            }

            val defaultSubId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                SubscriptionManager.getDefaultSmsSubscriptionId()
            } else {
                SUBSCRIPTION_ID_DEFAULT
            }

            return@withContext subscriptionList.map { subInfo ->
                val isEmbedded = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    subInfo.isEmbedded
                } else false

                val carrierName = subInfo.carrierName?.toString()?.takeIf { it.isNotBlank() }
                    ?: subInfo.displayName?.toString()?.takeIf { it.isNotBlank() }
                    ?: "Carrier ${subInfo.simSlotIndex + 1}"

                SimInfo(
                    subscriptionId = subInfo.subscriptionId,
                    slotIndex = subInfo.simSlotIndex,
                    displayName = subInfo.displayName?.toString() ?: "SIM ${subInfo.simSlotIndex + 1}",
                    carrierName = carrierName,
                    isDefaultSms = subInfo.subscriptionId == defaultSubId,
                    isEmbedded = isEmbedded
                )
            }.sortedBy { it.slotIndex }
        } catch (e: SecurityException) {
            AppLogger.e(TAG, "SecurityException while accessing SubscriptionManager: ${e.message}", e)
            emptyList()
        } catch (e: Exception) {
            AppLogger.e(TAG, "Unexpected error retrieving active SIMs: ${e.message}", e)
            emptyList()
        }
    }

    suspend fun verifySimAvailability(selectedSubscriptionId: Int): SimAvailabilityResult {
        val activeSims = getActiveSimCards()
        if (activeSims.isEmpty()) {
            return SimAvailabilityResult.NoSimPresent
        }

        // If user configured default SIM (-1), check if a default or at least 1 active SIM exists
        if (selectedSubscriptionId == SUBSCRIPTION_ID_DEFAULT) {
            val defaultSim = activeSims.firstOrNull { it.isDefaultSms } ?: activeSims.first()
            return SimAvailabilityResult.Available(defaultSim)
        }

        val matchedSim = activeSims.firstOrNull { it.subscriptionId == selectedSubscriptionId }
        return if (matchedSim != null) {
            SimAvailabilityResult.Available(matchedSim)
        } else {
            SimAvailabilityResult.Missing(
                selectedSubscriptionId = selectedSubscriptionId,
                message = "Your selected SMS SIM is unavailable. Please verify your SIM cards or select an active SIM in Settings."
            )
        }
    }
}
