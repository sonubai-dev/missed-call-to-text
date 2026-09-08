package com.misscall.whatsappassistant.crm.webhook

import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object WebhookPayload {

    fun buildPayload(
        event: String,
        eventId: String, // Canonical Webhook Event ID
        idempotencyKey: String, // Can be same as callEventId
        timestamp: Long = System.currentTimeMillis(),
        customerId: String? = null,
        customerName: String?,
        customerPhone: String,
        customerStatus: String = "NEW",
        callEventId: String? = null,
        callStatus: String? = null,
        callTimestamp: Long? = null,
        followUpId: String? = null,
        messageId: String? = null,
        activityType: String? = null,
        activityMessage: String? = null,
        businessName: String,
        businessPhone: String = "",
        extra: Map<String, Any?> = emptyMap()
    ): String {
        val root = JSONObject()
        root.put("event_version", "1.0")
        root.put("event", event)
        root.put("event_id", eventId)
        root.put("idempotency_key", idempotencyKey)

        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        root.put("timestamp", isoFormat.format(Date(timestamp)))
        root.put("timestamp_millis", timestamp)

        // Customer Object
        val customerObj = JSONObject()
        customerId?.let { customerObj.put("id", it) }
        customerObj.put("name", customerName ?: "")
        customerObj.put("phone", customerPhone)
        customerObj.put("status", customerStatus)
        root.put("customer", customerObj)

        // Call Object
        if (callStatus != null || callTimestamp != null || callEventId != null) {
            val callObj = JSONObject()
            callEventId?.let { callObj.put("id", it) }
            callObj.put("status", callStatus ?: "missed")
            callObj.put("timestamp", callTimestamp ?: timestamp)
            root.put("call", callObj)
        }

        // Activity Object
        if (activityType != null || activityMessage != null || messageId != null || followUpId != null) {
            val activityObj = JSONObject()
            messageId?.let { activityObj.put("message_id", it) }
            followUpId?.let { activityObj.put("follow_up_id", it) }
            activityObj.put("type", activityType ?: "")
            activityObj.put("message", activityMessage ?: "")
            root.put("activity", activityObj)
        }

        // Business Object
        val businessObj = JSONObject()
        businessObj.put("name", businessName)
        if (businessPhone.isNotBlank()) {
            businessObj.put("phone", businessPhone)
        }
        root.put("business", businessObj)

        // Extra metadata
        if (extra.isNotEmpty()) {
            val extraObj = JSONObject()
            extra.forEach { (k, v) -> extraObj.put(k, v) }
            root.put("extra", extraObj)
        }

        return root.toString()
    }
}
