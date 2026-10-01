package com.misscall.whatsappassistant.data.session

import android.content.Context
import android.content.SharedPreferences
import android.os.SystemClock

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "misscall_secure_auth_prefs",
        Context.MODE_PRIVATE
    )

    companion object {
        private const val KEY_JWT_TOKEN = "jwt_auth_token"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_ACTIVE_SUB_ID = "active_subscription_id"
        
        // Entitlement Grace Period Settings:
        // Grace period is strictly measured using SystemClock.elapsedRealtime() (monotonic time
        // since boot), preventing any bypass by changing device system date/time.
        const val NETWORK_GRACE_PERIOD_MS = 5 * 60 * 1000L // 5 minutes max on temporary network outage
    }

    // Ephemeral in-memory grace tracking across app execution (never persisted to disk as paid=true)
    private var lastSuccessfulServerCheckElapsedRealtime: Long = 0L

    fun saveAuthSession(token: String, email: String, userId: String, subId: String? = null) {
        prefs.edit()
            .putString(KEY_JWT_TOKEN, token)
            .putString(KEY_USER_EMAIL, email)
            .putString(KEY_USER_ID, userId)
            .putString(KEY_ACTIVE_SUB_ID, subId)
            .apply()
    }

    fun updateSubscriptionId(subId: String?) {
        prefs.edit().putString(KEY_ACTIVE_SUB_ID, subId).apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString(KEY_JWT_TOKEN, null)
    }

    fun getUserEmail(): String? {
        return prefs.getString(KEY_USER_EMAIL, null)
    }

    fun getUserId(): String? {
        return prefs.getString(KEY_USER_ID, null)
    }

    fun getSubscriptionId(): String? {
        return prefs.getString(KEY_ACTIVE_SUB_ID, null)
    }

    fun isAuthenticated(): Boolean {
        return !getAuthToken().isNullOrBlank()
    }

    fun recordSuccessfulServerVerification() {
        lastSuccessfulServerCheckElapsedRealtime = SystemClock.elapsedRealtime()
    }

    fun isWithinNetworkGracePeriod(): Boolean {
        if (lastSuccessfulServerCheckElapsedRealtime <= 0L) {
            return false
        }
        val elapsed = SystemClock.elapsedRealtime() - lastSuccessfulServerCheckElapsedRealtime
        return elapsed in 0..NETWORK_GRACE_PERIOD_MS
    }

    fun clearSession() {
        lastSuccessfulServerCheckElapsedRealtime = 0L
        prefs.edit().clear().apply()
    }
}
