package com.misscall.whatsappassistant.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.misscall.whatsappassistant.database.dao.ActivityLogDao
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CrmActivityDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.FollowUpSuggestionDao
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.database.dao.RuleDao
import com.misscall.whatsappassistant.database.dao.SmsMessageDao
import com.misscall.whatsappassistant.database.dao.WebhookDao
import com.misscall.whatsappassistant.database.dao.WhatsAppMessageDao
import com.misscall.whatsappassistant.database.entity.ActivityLogEntity
import com.misscall.whatsappassistant.database.entity.CallEventEntity
import com.misscall.whatsappassistant.database.entity.CrmActivityEntity
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.database.entity.FollowUpSuggestionEntity
import com.misscall.whatsappassistant.database.entity.MessageLogEntity
import com.misscall.whatsappassistant.database.entity.MessageTemplateEntity
import com.misscall.whatsappassistant.database.entity.RuleEntity
import com.misscall.whatsappassistant.database.entity.SmsMessageEntity
import com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity
import com.misscall.whatsappassistant.database.entity.WebhookEventEntity
import com.misscall.whatsappassistant.database.entity.WhatsAppMessageEntity
import com.misscall.whatsappassistant.domain.model.CallerCondition
import com.misscall.whatsappassistant.domain.model.ChannelType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Provider

@Database(
    entities = [
        CallEventEntity::class,
        CustomerEntity::class,
        MessageTemplateEntity::class,
        MessageLogEntity::class,
        FollowUpSuggestionEntity::class,
        RuleEntity::class,
        ActivityLogEntity::class,
        SmsMessageEntity::class,
        CrmActivityEntity::class,
        WebhookEventEntity::class,
        WebhookDeliveryEntity::class,
        WhatsAppMessageEntity::class
    ],
    version = 8,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun customerDao(): CustomerDao
    abstract fun callEventDao(): CallEventDao
    abstract fun messageTemplateDao(): MessageTemplateDao
    abstract fun followUpSuggestionDao(): FollowUpSuggestionDao
    abstract fun smsMessageDao(): SmsMessageDao
    abstract fun messageLogDao(): MessageLogDao
    abstract fun activityLogDao(): ActivityLogDao
    abstract fun webhookDao(): WebhookDao
    abstract fun crmActivityDao(): CrmActivityDao
    abstract fun ruleDao(): RuleDao
    abstract fun whatsAppMessageDao(): WhatsAppMessageDao

    companion object {
        val MIGRATION_4_5 = object : Migration(4, 5) {
            override fun migrate(db: SupportSQLiteDatabase) {
                // Add business_status and source to customers table
                db.execSQL("ALTER TABLE customers ADD COLUMN business_status TEXT NOT NULL DEFAULT 'NEW'")
                db.execSQL("ALTER TABLE customers ADD COLUMN source TEXT NOT NULL DEFAULT 'MISSED_CALL'")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_customers_business_status ON customers(business_status)")

                // Create crm_activities table
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS crm_activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        customer_id INTEGER NOT NULL,
                        type TEXT NOT NULL,
                        message TEXT NOT NULL,
                        timestamp INTEGER NOT NULL,
                        metadata TEXT NOT NULL DEFAULT '{}'
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_customer_id ON crm_activities(customer_id)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_type ON crm_activities(type)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_timestamp ON crm_activities(timestamp)")

                // Create webhook_events table
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS webhook_events (
                        id TEXT PRIMARY KEY NOT NULL,
                        event_type TEXT NOT NULL,
                        payload_json TEXT NOT NULL,
                        status TEXT NOT NULL DEFAULT 'PENDING',
                        attempt_count INTEGER NOT NULL DEFAULT 0,
                        next_retry_at INTEGER NOT NULL DEFAULT 0,
                        created_at INTEGER NOT NULL,
                        updated_at INTEGER NOT NULL
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS index_webhook_events_status ON webhook_events(status)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_webhook_events_created_at ON webhook_events(created_at)")

                // Create webhook_deliveries table
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS webhook_deliveries (
                        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        event_id TEXT NOT NULL,
                        event_type TEXT NOT NULL,
                        url TEXT NOT NULL,
                        status TEXT NOT NULL,
                        attempt INTEGER NOT NULL,
                        response_code INTEGER,
                        last_error TEXT,
                        created_at INTEGER NOT NULL,
                        delivered_at INTEGER
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS index_webhook_deliveries_event_id ON webhook_deliveries(event_id)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_webhook_deliveries_status ON webhook_deliveries(status)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_webhook_deliveries_created_at ON webhook_deliveries(created_at)")
            }
        }

        val MIGRATION_5_6 = object : Migration(5, 6) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE call_events ADD COLUMN idempotency_key TEXT")
                db.execSQL("UPDATE call_events SET idempotency_key = CAST(id AS TEXT)")
                db.execSQL("CREATE UNIQUE INDEX IF NOT EXISTS index_call_events_idempotency_key ON call_events(idempotency_key)")
            }
        }

        val MIGRATION_6_7 = object : Migration(6, 7) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("CREATE TABLE IF NOT EXISTS whatsapp_queue (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, message_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, phone_number TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL, retry_count INTEGER NOT NULL, next_retry_at INTEGER NOT NULL, created_at INTEGER NOT NULL, last_error TEXT)")
                db.execSQL("CREATE UNIQUE INDEX IF NOT EXISTS index_whatsapp_queue_idempotency_key ON whatsapp_queue(idempotency_key)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_whatsapp_queue_status_next_retry_at ON whatsapp_queue(status, next_retry_at)")
            }
        }

        val MIGRATION_7_8 = object : Migration(7, 8) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE crm_activities ADD COLUMN call_event_id TEXT")
                db.execSQL("ALTER TABLE crm_activities ADD COLUMN message_id TEXT")
                db.execSQL("ALTER TABLE crm_activities ADD COLUMN webhook_event_id TEXT")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_call_event_id ON crm_activities(call_event_id)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_message_id ON crm_activities(message_id)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_crm_activities_webhook_event_id ON crm_activities(webhook_event_id)")
            }
        }
    }

    class SeedCallback(
        private val templateDaoProvider: Provider<MessageTemplateDao>,
        private val ruleDaoProvider: Provider<RuleDao>,
        private val coroutineScope: CoroutineScope
    ) : Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            coroutineScope.launch(Dispatchers.IO) {
                val templateDao = templateDaoProvider.get()
                val ruleDao = ruleDaoProvider.get()

                val defaultTemplates = listOf(
                    MessageTemplateEntity(
                        name = "WhatsApp Default",
                        content = "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?",
                        channelType = ChannelType.WHATSAPP.name,
                        language = "en",
                        isDefault = true
                    ),
                    MessageTemplateEntity(
                        name = "SMS Template 1",
                        content = "Hi {{name}}, sorry we missed your call. Please call us back or reply to this SMS and we'll be happy to help.",
                        channelType = ChannelType.SMS.name,
                        language = "en",
                        isDefault = true
                    ),
                    MessageTemplateEntity(
                        name = "SMS Template 2",
                        content = "Hello {{name}}, you recently called {{business_name}}. Sorry we couldn't answer. Please let us know how we can assist you.",
                        channelType = ChannelType.SMS.name,
                        language = "en",
                        isDefault = false
                    ),
                    MessageTemplateEntity(
                        name = "SMS Template 3",
                        content = "Hi, this is {{business_name}}. We missed your call. Please call us back or reply to this SMS.",
                        channelType = ChannelType.SMS.name,
                        language = "en",
                        isDefault = false
                    ),
                    MessageTemplateEntity(
                        name = "Email Follow-up",
                        subject = "Missed call from {{business_name}}",
                        content = "Hello {{name}},\n\nThank you for reaching out to {{business_name}}. We missed your call today at {{time}}. Please let us know how we can assist you.\n\nBest regards,\n{{business_name}} Team",
                        channelType = ChannelType.EMAIL.name,
                        language = "en",
                        isDefault = true
                    )
                )
                templateDao.insertTemplates(defaultTemplates)

                // Seed Default Priority Rules
                val defaultRules = listOf(
                    RuleEntity(
                        name = "Default WhatsApp Auto-Reply",
                        priority = 10,
                        isActive = true,
                        callerCondition = CallerCondition.ALL_CALLERS.name,
                        channelType = ChannelType.WHATSAPP.name,
                        templateId = 1,
                        delaySeconds = 0,
                        cooldownMinutes = 120
                    ),
                    RuleEntity(
                        name = "Native SIM SMS Auto-Reply",
                        priority = 5,
                        isActive = false,
                        callerCondition = CallerCondition.ALL_CALLERS.name,
                        channelType = ChannelType.SMS.name,
                        templateId = 2,
                        delaySeconds = 0,
                        cooldownMinutes = 1440 // 24 hours
                    )
                )
                defaultRules.forEach { ruleDao.insertRule(it) }
            }
        }
    }
}

