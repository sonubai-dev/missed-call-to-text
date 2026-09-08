package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.telephony.sms.SimInfo
import com.misscall.whatsappassistant.telephony.sms.SmsSimManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SmsSimManagerTest {

    @Test
    fun `single SIM info labels slot index properly`() {
        val sim = SimInfo(
            subscriptionId = 1,
            slotIndex = 0,
            displayName = "Jio 4G",
            carrierName = "Jio",
            isDefaultSms = true,
            isEmbedded = false
        )

        assertEquals("SIM 1 (Jio)", sim.displayLabel)
        assertEquals(0, sim.slotIndex)
        assertTrue(sim.isDefaultSms)
        assertFalse(sim.isEmbedded)
    }

    @Test
    fun `dual SIM info slots 1 and 2`() {
        val sim1 = SimInfo(
            subscriptionId = 1,
            slotIndex = 0,
            displayName = "Jio",
            carrierName = "Jio",
            isDefaultSms = true
        )
        val sim2 = SimInfo(
            subscriptionId = 2,
            slotIndex = 1,
            displayName = "Airtel",
            carrierName = "Airtel",
            isDefaultSms = false
        )

        assertEquals("SIM 1 (Jio)", sim1.displayLabel)
        assertEquals("SIM 2 (Airtel)", sim2.displayLabel)
    }

    @Test
    fun `sim unavailable warning detects when selected subId is absent`() {
        val activeSims = listOf(
            SimInfo(subscriptionId = 1, slotIndex = 0, displayName = "Jio", carrierName = "Jio")
        )

        val selectedSubId = 2 // SIM 2 was previously selected, but now only SIM 1 is present

        val isUnavailable = if (selectedSubId != SmsSimManager.SUBSCRIPTION_ID_DEFAULT && activeSims.isNotEmpty()) {
            activeSims.none { it.subscriptionId == selectedSubId }
        } else false

        assertTrue("Should detect SIM 2 is missing from active SIM cards", isUnavailable)
    }

    @Test
    fun `default SIM selection never triggers unavailable warning`() {
        val activeSims = listOf(
            SimInfo(subscriptionId = 1, slotIndex = 0, displayName = "Jio", carrierName = "Jio")
        )

        val selectedSubId = SmsSimManager.SUBSCRIPTION_ID_DEFAULT // -1

        val isUnavailable = if (selectedSubId != SmsSimManager.SUBSCRIPTION_ID_DEFAULT && activeSims.isNotEmpty()) {
            activeSims.none { it.subscriptionId == selectedSubId }
        } else false

        assertFalse("Default SIM option should never trigger unavailable warning", isUnavailable)
    }

    @Test
    fun `available SIM resolution selects default when present`() {
        val activeSims = listOf(
            SimInfo(subscriptionId = 10, slotIndex = 0, displayName = "SIM 1", carrierName = "Airtel", isDefaultSms = false),
            SimInfo(subscriptionId = 20, slotIndex = 1, displayName = "SIM 2", carrierName = "Vi", isDefaultSms = true)
        )

        val defaultSim = activeSims.find { it.isDefaultSms } ?: activeSims.firstOrNull()
        assertEquals(20, defaultSim?.subscriptionId)
        assertEquals("SIM 2 (Vi)", defaultSim?.displayLabel)
    }
}
