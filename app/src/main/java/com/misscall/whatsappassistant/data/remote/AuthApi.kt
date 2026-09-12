package com.misscall.whatsappassistant.data.remote

import com.misscall.whatsappassistant.data.remote.model.LoginRequest
import com.misscall.whatsappassistant.data.remote.model.AuthResponse
import com.misscall.whatsappassistant.data.remote.model.RegisterRequest
import com.misscall.whatsappassistant.data.remote.model.UserResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApi {

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @GET("auth/me")
    suspend fun me(
        @Header("Authorization") token: String
    ): Response<UserResponse>
}
