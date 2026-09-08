package com.misscall.whatsappassistant.crm.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.crm.webhook.WebhookDispatchResult
import com.misscall.whatsappassistant.crm.webhook.WebhookDispatcher
import com.misscall.whatsappassistant.database.dao.WebhookDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

@HiltWorker
class CrmSyncWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val webhookDao: WebhookDao,
    private val webhookDispatcher: WebhookDispatcher,
    private val preferencesRepository: UserPreferencesRepository
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "CrmSyncWorker"
    }

    override suspend fun doWork(): Result {
        val prefs = preferencesRepository.userPreferencesFlow.first()
        if (!prefs.isCrmIntegrationEnabled || prefs.crmWebhookUrl.isBlank()) {
            AppLogger.d(TAG, "CRM Integration disabled or URL empty. Skipping sync.")
            return Result.success()
        }

        AppLogger.i(TAG, "Starting CRM outbound webhook queue sync...")
        val pendingEvents = webhookDao.getPendingEvents(System.currentTimeMillis(), limit = 20)
        if (pendingEvents.isEmpty()) {
            AppLogger.d(TAG, "No pending webhook events in queue.")
            return Result.success()
        }

        var hasRetryableFailure = false

        for (event in pendingEvents) {
            val result = webhookDispatcher.dispatch(
                event = event,
                url = prefs.crmWebhookUrl,
                secret = prefs.crmWebhookSecret
            )

            when (result) {
                is WebhookDispatchResult.Success -> {
                    AppLogger.d(TAG, "Event ${event.id} (${event.eventType}) delivered successfully (HTTP ${result.responseCode})")
                }
                is WebhookDispatchResult.RetryableError -> {
                    AppLogger.w(TAG, "Event ${event.id} retryable error: ${result.message}")
                    hasRetryableFailure = true
                }
                is WebhookDispatchResult.PermanentError -> {
                    AppLogger.e(TAG, "Event ${event.id} permanent failure: ${result.message}")
                }
            }
        }

        webhookDao.pruneProcessedEvents()

        return if (hasRetryableFailure) {
            Result.retry()
        } else {
            Result.success()
        }
    }
}
