package com.misscall.whatsappassistant.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val businessName: String? = null
)

@Serializable
data class AuthUser(
    val id: String,
    val email: String,
    val subscription_status: String? = null,
    val subscription_id: String? = null
)

@Serializable
data class AuthResponse(
    val user: AuthUser,
    val token: String,
    val message: String? = null
)

@Serializable
data class SubscriptionStatusResponse(
    val active: Boolean,
    val status: String,
    val message: String? = null,
    val plan_id: String? = null,
    val current_end: Long? = null,
    val subscription_id: String? = null
)

@Serializable
data class CreateSubscriptionResponse(
    val subscriptionId: String,
    val shortUrl: String,
    val keyId: String,
    val token: String? = null
)

@Serializable
data class VerifySubscriptionRequest(
    val subscriptionId: String? = null
)
