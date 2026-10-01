package com.misscall.whatsappassistant.data.api

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object NetworkClient {
    // Default backend URL: Railway production URL or local development fallback
    private const val DEFAULT_BASE_URL = "https://misscall-assistant-production.up.railway.app/"
    
    // We can also allow dynamic base URL configuration for development / testing
    @Volatile
    var customBaseUrl: String? = null

    val baseUrl: String
        get() = customBaseUrl ?: DEFAULT_BASE_URL

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    fun createService(url: String = baseUrl): BackendApiService {
        val sanitizedUrl = if (url.endsWith("/")) url else "$url/"
        return Retrofit.Builder()
            .baseUrl(sanitizedUrl)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(BackendApiService::class.java)
    }

    val apiService: BackendApiService by lazy {
        createService()
    }
}
