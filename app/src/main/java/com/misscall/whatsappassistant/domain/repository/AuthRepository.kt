package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.data.remote.model.LoginRequest
import com.misscall.whatsappassistant.data.remote.model.RegisterRequest

interface AuthRepository {
    suspend fun register(request: RegisterRequest): Result<Unit>
    suspend fun login(request: LoginRequest): Result<Unit>
    suspend fun checkSubscriptionStatus(): Result<String>
    suspend fun logout()
}
