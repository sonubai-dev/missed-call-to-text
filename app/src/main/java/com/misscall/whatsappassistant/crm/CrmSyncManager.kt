package com.misscall.whatsappassistant.crm

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.crm.webhook.WebhookDispatcher
import com.misscall.whatsappassistant.crm.webhook.WebhookPayload
import com.misscall.whatsappassistant.crm.worker.CrmSyncWorker
import com.misscall.whatsappassistant.database.dao.CrmActivityDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.WebhookDao
import com.misscall.whatsappassistant.database.entity.CrmActivityEntity
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity
import com.misscall.whatsappassistant.database.entity.WebhookEventEntity
import com.misscall.whatsappassistant.domain.model.CrmActivityType
import com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CrmSyncManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val customerDao: CustomerDao,
    private val crmActivityDao: CrmActivityDao,
    private val webhookDao: WebhookDao,
    private val preferencesRepository: UserPreferencesRepository,
    private val webhookDispatcher: WebhookDispatcher
) {
    /**
     * Resolves an incoming phone number to an existing Customer or creates a new one.
     * Normalizes phone numbers so varying formats (+91 9876543210 vs 9876543210) resolve to the same customer.
     */
    suspend fun resolveOrCreateCustomer(
        rawPhoneNumber: String,
        callerName: String? = null,
        source: String = "MISSED_CALL"
    ): Pair<CustomerEntity, Boolean> = withContext(Dispatchers.IO) {
        val normalized = NumberNormalizer.normalize(rawPhoneNumber)
        val national10Digit = if (normalized.length > 10) normalized.takeLast(10) else normalized

        val allCustomers = customerDao.getAllCustomers()
        val existing = allCustomers.firstOrNull { c ->
            c.phoneNumber == rawPhoneNumber ||
                    c.phoneNumber == normalized ||
                    c.phoneNumber.endsWith(national10Digit) ||
                    normalized.endsWith(c.phoneNumber.takeLast(10))
        }

        if (existing != null) {
            val updated = existing.copy(
                name = callerName?.takeIf { it.isNotBlank() } ?: existing.name,
                totalMissedCalls = existing.totalMissedCalls + 1,
                lastCallTimestamp = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            customerDao.updateCustomer(updated)
            Pair(updated, false) // false = existing customer updated
        } else {
            val newCustomer = CustomerEntity(
                phoneNumber = normalized,
                name = callerName?.takeIf { it.isNotBlank() },
                businessStatus = CustomerBusinessStatus.NEW.name,
                source = source,
                totalMissedCalls = 1,
                lastCallTimestamp = System.currentTimeMillis(),
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            val newId = customerDao.insertOrUpdateCustomer(newCustomer)
            val created = newCustomer.copy(id = newId)
            Pair(created, true) // true = new customer created
        }
    }

    /**
     * Records a CRM activity locally.
     * If CRM/Webhook is enabled, automatically queues a webhook event and schedules sync.
     */
    suspend fun recordActivity(
        customerId: Long,
        type: CrmActivityType,
        message: String,
        metadata: Map<String, String> = emptyMap(),
        timestamp: Long = System.currentTimeMillis(),
        callEventId: String? = null,
        messageId: String? = null,
        webhookEventId: String? = null
    ): CrmActivityEntity = withContext(Dispatchers.IO) {
        val metaJson = JSONObject(metadata).toString()
        val activity = CrmActivityEntity(
            customerId = customerId,
            callEventId = callEventId,
            messageId = messageId,
            webhookEventId = webhookEventId,
            type = type.name,
            message = message,
            timestamp = timestamp,
            metadata = metaJson
        )
        val id = crmActivityDao.insertActivity(activity)
        val recorded = activity.copy(id = id)

        // Determine event type for webhook
        val eventType = when (type) {
            CrmActivityType.MISSED_CALL -> "missed_call"
            CrmActivityType.WHATSAPP_SENT -> "whatsapp_sent"
            CrmActivityType.SMS_SENT -> "sms_sent"
            CrmActivityType.CALL_BACK -> "call_back"
            CrmActivityType.CUSTOM_MESSAGE -> "custom_message"
            CrmActivityType.CUSTOMER_REPLY -> "customer_replied"
            CrmActivityType.FOLLOW_UP_CREATED -> "followup_created"
        }

        val customer = customerDao.getCustomerById(customerId)
        if (customer != null) {
            queueWebhookEventIfEnabled(eventType, customer, recorded)
        }

        recorded
    }

    /**
     * Updates customer business status (e.g. NEW -> CONTACTED -> CONVERTED).
     */
    suspend fun updateCustomerStatus(
        customerId: Long,
        status: CustomerBusinessStatus
    ) = withContext(Dispatchers.IO) {
        val customer = customerDao.getCustomerById(customerId) ?: return@withContext
        val updated = customer.copy(
            businessStatus = status.name,
            updatedAt = System.currentTimeMillis()
        )
        customerDao.updateCustomer(updated)
        queueWebhookEventIfEnabled("customer_updated", updated, null)
    }

    /**
     * Queues a webhook event if CRM integration is active and event is subscribed.
     */
    suspend fun queueWebhookEventIfEnabled(
        eventType: String,
        customer: CustomerEntity,
        activity: CrmActivityEntity? = null,
        extra: Map<String, Any?> = emptyMap()
    ): String? = withContext(Dispatchers.IO) {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        if (!prefs.isCrmIntegrationEnabled || prefs.crmWebhookUrl.isBlank()) {
            return@withContext null
        }

        if (!prefs.crmWebhookEvents.contains(eventType)) {
            return@withContext null
        }

        val eventId = UUID.randomUUID().toString()
        val idempotencyKey = activity?.callEventId ?: eventId
        val payload = WebhookPayload.buildPayload(
            event = eventType,
            eventId = eventId,
            idempotencyKey = idempotencyKey,
            customerId = "CUST_${customer.id}",
            customerName = customer.name,
            customerPhone = customer.phoneNumber,
            customerStatus = customer.businessStatus,
            callEventId = activity?.callEventId,
            messageId = activity?.messageId,
            followUpId = activity?.webhookEventId,
            activityType = activity?.type,
            activityMessage = activity?.message,
            businessName = prefs.businessName,
            businessPhone = prefs.businessPhone,
            extra = extra
        )

        val eventEntity = WebhookEventEntity(
            id = eventId,
            eventType = eventType,
            payloadJson = payload,
            status = "PENDING",
            attemptCount = 0,
            nextRetryAt = System.currentTimeMillis()
        )
        webhookDao.insertEvent(eventEntity)

        scheduleSync()
        idempotencyKey
    }

    /**
     * Triggers WorkManager sync worker when online.
     */
    fun scheduleSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<CrmSyncWorker>()
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            "crm_webhook_sync",
            ExistingWorkPolicy.KEEP,
            syncRequest
        )
    }

    /**
     * Sends an immediate test webhook event to verify configuration in Settings.
     */
    suspend fun sendTestWebhook(): WebhookDeliveryEntity = withContext(Dispatchers.IO) {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        val testId = UUID.randomUUID().toString()
        val payload = WebhookPayload.buildPayload(
            event = "test_event",
            eventId = testId,
            idempotencyKey = testId,
            customerId = "TEST_CUSTOMER",
            customerName = "Test Contact",
            customerPhone = "+919999999999",
            customerStatus = "TEST",
            activityType = "CUSTOM_MESSAGE",
            activityMessage = "Test event from MissCall Assistant",
            businessName = prefs.businessName,
            businessPhone = prefs.businessPhone
        )

        val testEvent = WebhookEventEntity(
            id = testId,
            eventType = "test_event",
            payloadJson = payload,
            status = "PROCESSING",
            attemptCount = 0
        )

        webhookDispatcher.dispatch(testEvent, prefs.crmWebhookUrl, prefs.crmWebhookSecret)

        webhookDao.getLatestDeliveryFlow().first() ?: WebhookDeliveryEntity(
            eventId = testId,
            eventType = "test_event",
            url = prefs.crmWebhookUrl,
            status = "FAILED",
            attempt = 1,
            lastError = "No delivery recorded"
        )
    }
}
