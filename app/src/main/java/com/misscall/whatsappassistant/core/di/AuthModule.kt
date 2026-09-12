package com.misscall.whatsappassistant.core.di

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.misscall.whatsappassistant.data.remote.AuthApi
import com.misscall.whatsappassistant.data.repository.AuthRepositoryImpl
import com.misscall.whatsappassistant.domain.repository.AuthRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AuthNetworkModule {

    @Provides
    @Singleton
    fun provideAuthApi(): AuthApi {
        val contentType = "application/json".toMediaType()
        val json = Json { ignoreUnknownKeys = true }
        return Retrofit.Builder()
            .baseUrl("https://vigilant-optimism-production-98b8.up.railway.app/api/v1/")
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(AuthApi::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class AuthRepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository
}
