package com.misscall.whatsappassistant.core.util

object Constants {
    const val DATABASE_NAME = "misscall_assistant.db"
    const val DATASTORE_NAME = "misscall_preferences"

    // Notifications
    const val NOTIFICATION_CHANNEL_SERVICE = "channel_call_monitoring"
    const val NOTIFICATION_CHANNEL_MISSED_CALL = "channel_missed_call"
    const val NOTIFICATION_CHANNEL_SENT = "channel_follow_up_sent"
    const val MONITORING_NOTIFICATION_ID = 1001

    // Notification Action Broadcasts
    const val ACTION_SEND_NOW = "com.misscall.whatsappassistant.ACTION_SEND_NOW"
    const val ACTION_IGNORE = "com.misscall.whatsappassistant.ACTION_IGNORE"
    const val ACTION_DISMISS = "com.misscall.whatsappassistant.ACTION_DISMISS"

    // Intent Extras
    const val EXTRA_CALL_EVENT_ID = "extra_call_event_id"
    const val EXTRA_CUSTOMER_ID = "extra_customer_id"
    const val EXTRA_PHONE_NUMBER = "extra_phone_number"
    const val EXTRA_CALLER_NAME = "extra_caller_name"
    const val EXTRA_MESSAGE_TEXT = "extra_message_text"
    const val EXTRA_NOTIFICATION_ID = "extra_notification_id"

    // WorkManager Unique Work Names & Tags
    const val WORK_TAG_FOLLOW_UP = "work_tag_follow_up"
    const val UNIQUE_WORK_PREFIX_CALL = "unique_work_call_"

    // WhatsApp Packages
    const val PACKAGE_WHATSAPP = "com.whatsapp"
    const val PACKAGE_WHATSAPP_BUSINESS = "com.whatsapp.w4b"
}
