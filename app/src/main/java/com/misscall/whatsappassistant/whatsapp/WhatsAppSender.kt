package com.misscall.whatsappassistant.whatsapp

import android.content.Intent

interface WhatsAppSender {
    suspend fun sendMessage(phoneNumber: String, messageText: String): Boolean
    fun createLaunchIntent(phoneNumber: String, messageText: String): Intent?
    fun isAppAvailable(): Boolean
}
