package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.api.NetworkClient
import com.misscall.whatsappassistant.data.model.AuthResponse
import com.misscall.whatsappassistant.data.model.LoginRequest
import com.misscall.whatsappassistant.data.model.RegisterRequest
import com.misscall.whatsappassistant.data.session.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository(
    private val sessionManager: SessionManager
) {
    private val api = NetworkClient.apiService

    suspend fun login(email: String, pass: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.login(LoginRequest(email.trim(), pass))
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                sessionManager.saveAuthSession(
                    token = data.token,
                    email = data.user.email,
                    userId = data.user.id,
                    subId = data.user.subscription_id
                )
                Result.success(data)
            } else {
                Result.failure(Exception("Login failed: ${response.errorBody()?.string() ?: "Invalid credentials"}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(email: String, pass: String, bizName: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.register(RegisterRequest(email.trim(), pass, bizName.trim()))
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                sessionManager.saveAuthSession(
                    token = data.token,
                    email = data.user.email,
                    userId = data.user.id,
                    subId = data.user.subscription_id
                )
                Result.success(data)
            } else {
                Result.failure(Exception("Registration failed: ${response.errorBody()?.string() ?: "Registration error"}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        sessionManager.clearSession()
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.isAuthenticated()
    }

    fun getUserEmail(): String? {
        return sessionManager.getUserEmail()
    }
}
