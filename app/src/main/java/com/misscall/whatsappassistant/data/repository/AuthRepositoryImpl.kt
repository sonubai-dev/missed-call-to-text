package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.data.remote.AuthApi
import com.misscall.whatsappassistant.data.remote.model.LoginRequest
import com.misscall.whatsappassistant.data.remote.model.RegisterRequest
import com.misscall.whatsappassistant.domain.repository.AuthRepository
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val preferencesRepository: UserPreferencesRepository
) : AuthRepository {

    override suspend fun register(request: RegisterRequest): Result<Unit> {
        return try {
            val response = authApi.register(request)
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    preferencesRepository.setAuthDetails(body.token, body.user.subscriptionStatus)
                    Result.success(Unit)
                } ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.message() ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun login(request: LoginRequest): Result<Unit> {
        return try {
            val response = authApi.login(request)
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    preferencesRepository.setAuthDetails(body.token, body.user.subscriptionStatus)
                    Result.success(Unit)
                } ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.message() ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun checkSubscriptionStatus(): Result<String> {
        return try {
            val token = preferencesRepository.userPreferencesFlow.first().jwtToken
            if (token.isEmpty()) {
                return Result.failure(Exception("No token found"))
            }
            val response = authApi.me("Bearer $token")
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    val status = body.user.subscriptionStatus
                    preferencesRepository.setSubscriptionStatus(status)
                    Result.success(status)
                } ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun logout() {
        preferencesRepository.clearAuth()
    }
}
