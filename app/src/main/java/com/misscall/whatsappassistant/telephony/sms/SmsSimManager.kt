package com.misscall.whatsappassistant.telephony.sms

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import dagger.hilt.android.qualifiers.ApplicationContext
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
        get() = "SIM ${slotIndex + 1} ($carrierName)"
}

@Singleton
class SmsSimManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val SUBSCRIPTION_ID_DEFAULT = -1
    }

    @SuppressLint("MissingPermission")
    fun getActiveSims(): List<SimInfo> {
        val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
            ?: return emptyList()

        return try {
            val activeList = subscriptionManager.activeSubscriptionInfoList ?: emptyList()
            val defaultSmsId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                SubscriptionManager.getDefaultSmsSubscriptionId()
            } else {
                SubscriptionManager.getDefaultSubscriptionId()
            }

            activeList.map { subInfo: SubscriptionInfo ->
                SimInfo(
                    subscriptionId = subInfo.subscriptionId,
                    slotIndex = subInfo.simSlotIndex,
                    displayName = subInfo.displayName?.toString() ?: "SIM ${subInfo.simSlotIndex + 1}",
                    carrierName = subInfo.carrierName?.toString() ?: "Carrier",
                    isDefaultSms = subInfo.subscriptionId == defaultSmsId,
                    isEmbedded = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) subInfo.isEmbedded else false
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
