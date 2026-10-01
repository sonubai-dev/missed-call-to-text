package com.misscall.whatsappassistant.data.api

import com.misscall.whatsappassistant.data.model.AuthResponse
import com.misscall.whatsappassistant.data.model.CreateSubscriptionResponse
import com.misscall.whatsappassistant.data.model.LoginRequest
import com.misscall.whatsappassistant.data.model.RegisterRequest
import com.misscall.whatsappassistant.data.model.SubscriptionStatusResponse
import com.misscall.whatsappassistant.data.model.VerifySubscriptionRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface BackendApiService {
    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("api/v1/subscription/status")
    suspend fun getSubscriptionStatus(
        @Header("Authorization") bearerToken: String
    ): Response<SubscriptionStatusResponse>

    @POST("api/v1/subscription/create")
    suspend fun createSubscription(
        @Header("Authorization") bearerToken: String
    ): Response<CreateSubscriptionResponse>

    @POST("api/v1/subscription/verify")
    suspend fun verifySubscription(
        @Header("Authorization") bearerToken: String,
        @Body request: VerifySubscriptionRequest
    ): Response<SubscriptionStatusResponse>
}
