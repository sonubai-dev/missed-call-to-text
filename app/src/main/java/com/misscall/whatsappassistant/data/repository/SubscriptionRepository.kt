package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.api.NetworkClient
import com.misscall.whatsappassistant.data.model.CreateSubscriptionResponse
import com.misscall.whatsappassistant.data.model.SubscriptionStatusResponse
import com.misscall.whatsappassistant.data.model.VerifySubscriptionRequest
import com.misscall.whatsappassistant.data.session.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

sealed class EntitlementResult {
    data class Active(val planId: String?, val currentEnd: Long?) : EntitlementResult()
    data class Inactive(val reason: String, val message: String) : EntitlementResult()
    data class NetworkGrace(val message: String) : EntitlementResult()
    data class Error(val message: String) : EntitlementResult()
    object Unauthenticated : EntitlementResult()
}

class SubscriptionRepository(
    private val sessionManager: SessionManager
) {
    private val api = NetworkClient.apiService

    suspend fun checkEntitlement(): EntitlementResult = withContext(Dispatchers.IO) {
        val token = sessionManager.getAuthToken()
        if (token.isNullOrBlank()) {
            return@withContext EntitlementResult.Unauthenticated
        }

        try {
            val response = api.getSubscriptionStatus("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.active) {
                    sessionManager.recordSuccessfulServerVerification()
                    if (!body.subscription_id.isNullOrBlank()) {
                        sessionManager.updateSubscriptionId(body.subscription_id)
                    }
                    EntitlementResult.Active(body.plan_id, body.current_end)
                } else {
                    EntitlementResult.Inactive(
                        reason = body.status,
                        message = body.message ?: "Your subscription needs attention. Please renew to continue."
                    )
                }
            } else {
                if (response.code() == 401) {
                    sessionManager.clearSession()
                    EntitlementResult.Unauthenticated
                } else {
                    EntitlementResult.Inactive(
                        reason = "SERVER_REJECTED",
                        message = "Subscription verification rejected by server."
                    )
                }
            }
        } catch (e: IOException) {
            // Temporary network failure: check if within conservative monotonic grace period
            if (sessionManager.isWithinNetworkGracePeriod()) {
                EntitlementResult.NetworkGrace(
                    "Working offline temporarily. Will verify subscription when connection restores."
                )
            } else {
                EntitlementResult.Error(
                    "Network connection unavailable. Please check your internet connection to verify your subscription."
                )
            }
        } catch (e: Exception) {
            EntitlementResult.Error("Unable to verify subscription: ${e.localizedMessage ?: "Unknown error"}")
        }
    }

    suspend fun createSubscription(): Result<CreateSubscriptionResponse> = withContext(Dispatchers.IO) {
        val token = sessionManager.getAuthToken()
            ?: return@withContext Result.failure(IllegalStateException("User is not authenticated"))

        try {
            val response = api.createSubscription("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                sessionManager.updateSubscriptionId(data.subscriptionId)
                Result.success(data)
            } else {
                Result.failure(Exception("Failed to initialize Razorpay subscription: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyPayment(subscriptionId: String? = null): Result<SubscriptionStatusResponse> = withContext(Dispatchers.IO) {
        val token = sessionManager.getAuthToken()
            ?: return@withContext Result.failure(IllegalStateException("User is not authenticated"))

        val targetSubId = subscriptionId ?: sessionManager.getSubscriptionId()

        try {
            val response = api.verifySubscription(
                bearerToken = "Bearer $token",
                request = VerifySubscriptionRequest(subscriptionId = targetSubId)
            )
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                if (data.active) {
                    sessionManager.recordSuccessfulServerVerification()
                }
                Result.success(data)
            } else {
                Result.failure(Exception("Verification failed: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
