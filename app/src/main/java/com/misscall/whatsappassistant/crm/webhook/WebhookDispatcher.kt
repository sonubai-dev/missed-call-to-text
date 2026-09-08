package com.misscall.whatsappassistant.crm.webhook

import android.util.Log
import com.misscall.whatsappassistant.database.dao.WebhookDao
import com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity
import com.misscall.whatsappassistant.database.entity.WebhookEventEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.net.SocketTimeoutException
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

sealed class WebhookDispatchResult {
    data class Success(val responseCode: Int, val deliveryId: Long) : WebhookDispatchResult()
    data class RetryableError(val responseCode: Int?, val message: String, val nextRetryDelayMs: Long) : WebhookDispatchResult()
    data class PermanentError(val responseCode: Int?, val message: String) : WebhookDispatchResult()
}

@Singleton
class WebhookDispatcher @Inject constructor(
    private val webhookDao: WebhookDao
) {
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    companion object {
        private const val TAG = "WebhookDispatcher"
        const val MAX_RETRIES = 5
        private const val BASE_BACKOFF_MS = 2000L // 2s, 4s, 8s, 16s, 32s
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    }

    /**
     * Dispatches an event to the specified webhook endpoint.
     * Enforces HTTPS unless localhost/127.0.0.1 for local testing.
     */
    suspend fun dispatch(
        event: WebhookEventEntity,
        url: String,
        secret: String
    ): WebhookDispatchResult = withContext(Dispatchers.IO) {
        val trimmedUrl = url.trim()

        // HTTPS Enforcement
        val isLocalhost = trimmedUrl.startsWith("http://localhost") ||
                trimmedUrl.startsWith("http://127.0.0.1") ||
                trimmedUrl.startsWith("http://10.0.2.2")
        if (!trimmedUrl.startsWith("https://", ignoreCase = true) && !isLocalhost) {
            val errorMsg = "Insecure URL rejected: Webhooks must use HTTPS"
            Log.w(TAG, errorMsg)
            recordDelivery(event, trimmedUrl, "FAILED", event.attemptCount + 1, null, errorMsg, null)
            webhookDao.updateEventStatus(event.id, "FAILED", event.attemptCount + 1, 0L)
            return@withContext WebhookDispatchResult.PermanentError(null, errorMsg)
        }

        val attempt = event.attemptCount + 1
        val timestamp = System.currentTimeMillis()
        val signature = WebhookSignature.generateSignature(event.payloadJson, timestamp, secret)

        val request = Request.Builder()
            .url(trimmedUrl)
            .post(event.payloadJson.toRequestBody(JSON_MEDIA_TYPE))
            .addHeader(WebhookSignature.HEADER_EVENT, event.eventType)
            .addHeader(WebhookSignature.HEADER_TIMESTAMP, timestamp.toString())
            .addHeader(WebhookSignature.HEADER_IDEMPOTENCY_KEY, event.id)
            .apply {
                if (signature.isNotBlank()) {
                    addHeader(WebhookSignature.HEADER_SIGNATURE, signature)
                }
            }
            .build()

        try {
            val response = okHttpClient.newCall(request).execute()
            response.use { resp ->
                val code = resp.code
                val isSuccess = resp.isSuccessful // 200..299
                val isRetryable = code == 429 || code >= 500 // Rate limit or server error

                if (isSuccess) {
                    val deliveredAt = System.currentTimeMillis()
                    val deliveryId = recordDelivery(event, trimmedUrl, "DELIVERED", attempt, code, null, deliveredAt)
                    webhookDao.updateEventStatus(event.id, "DELIVERED", attempt, 0L)
                    WebhookDispatchResult.Success(code, deliveryId)
                } else if (isRetryable) {
                    handleRetryableFailure(event, trimmedUrl, attempt, code, "HTTP $code ${resp.message}")
                } else {
                    // Non-retryable 4xx client errors (400, 401, 403, 404, etc.)
                    val errorMsg = "HTTP $code Client Error: ${resp.message}"
                    recordDelivery(event, trimmedUrl, "FAILED", attempt, code, errorMsg, null)
                    webhookDao.updateEventStatus(event.id, "FAILED", attempt, 0L)
                    WebhookDispatchResult.PermanentError(code, errorMsg)
                }
            }
        } catch (e: SocketTimeoutException) {
            handleRetryableFailure(event, trimmedUrl, attempt, null, "Timeout: ${e.message}")
        } catch (e: IOException) {
            handleRetryableFailure(event, trimmedUrl, attempt, null, "Network error: ${e.message}")
        } catch (e: Exception) {
            val errorMsg = "Unexpected error: ${e.localizedMessage ?: e.javaClass.simpleName}"
            recordDelivery(event, trimmedUrl, "FAILED", attempt, null, errorMsg, null)
            webhookDao.updateEventStatus(event.id, "FAILED", attempt, 0L)
            WebhookDispatchResult.PermanentError(null, errorMsg)
        }
    }

    private suspend fun handleRetryableFailure(
        event: WebhookEventEntity,
        url: String,
        attempt: Int,
        code: Int?,
        errorMessage: String
    ): WebhookDispatchResult {
        if (attempt >= MAX_RETRIES) {
            val finalError = "$errorMessage (Max retries reached: $attempt/$MAX_RETRIES)"
            recordDelivery(event, url, "FAILED", attempt, code, finalError, null)
            webhookDao.updateEventStatus(event.id, "FAILED", attempt, 0L)
            return WebhookDispatchResult.PermanentError(code, finalError)
        }

        // Exponential backoff: base * 2^(attempt-1)
        val backoffDelayMs = BASE_BACKOFF_MS * (1 shl (attempt - 1))
        val nextRetryAt = System.currentTimeMillis() + backoffDelayMs

        recordDelivery(event, url, "RETRYING", attempt, code, errorMessage, null)
        webhookDao.updateEventStatus(event.id, "PENDING", attempt, nextRetryAt)
        return WebhookDispatchResult.RetryableError(code, errorMessage, backoffDelayMs)
    }

    private suspend fun recordDelivery(
        event: WebhookEventEntity,
        url: String,
        status: String,
        attempt: Int,
        responseCode: Int?,
        lastError: String?,
        deliveredAt: Long?
    ): Long {
        return webhookDao.insertDelivery(
            WebhookDeliveryEntity(
                eventId = event.id,
                eventType = event.eventType,
                url = url,
                status = status,
                attempt = attempt,
                responseCode = responseCode,
                lastError = lastError,
                createdAt = System.currentTimeMillis(),
                deliveredAt = deliveredAt
            )
        )
    }
}
