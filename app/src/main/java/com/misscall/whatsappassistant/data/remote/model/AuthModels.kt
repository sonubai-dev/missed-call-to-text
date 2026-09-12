package com.misscall.whatsappassistant.data.remote.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val businessName: String
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserDto
)

@Serializable
data class UserResponse(
    val user: UserDto
)

@Serializable
data class UserDto(
    @SerialName("subscription_status")
    val subscriptionStatus: String
)

