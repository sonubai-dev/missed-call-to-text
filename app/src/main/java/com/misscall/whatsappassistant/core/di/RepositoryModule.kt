package com.misscall.whatsappassistant.core.di

import com.misscall.whatsappassistant.data.repository.ActivityLogRepositoryImpl
import com.misscall.whatsappassistant.data.repository.CallEventRepositoryImpl
import com.misscall.whatsappassistant.data.repository.CustomerRepositoryImpl
import com.misscall.whatsappassistant.data.repository.FollowUpSuggestionRepositoryImpl
import com.misscall.whatsappassistant.data.repository.MessageLogRepositoryImpl
import com.misscall.whatsappassistant.data.repository.RuleRepositoryImpl
import com.misscall.whatsappassistant.data.repository.SmsMessageRepositoryImpl
import com.misscall.whatsappassistant.data.repository.TemplateRepositoryImpl
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import com.misscall.whatsappassistant.domain.repository.FollowUpSuggestionRepository
import com.misscall.whatsappassistant.domain.repository.MessageLogRepository
import com.misscall.whatsappassistant.domain.repository.RuleRepository
import com.misscall.whatsappassistant.domain.repository.SmsMessageRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository


import com.misscall.whatsappassistant.whatsapp.WhatsAppIntentSender
import com.misscall.whatsappassistant.whatsapp.WhatsAppSender
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindCallEventRepository(impl: CallEventRepositoryImpl): CallEventRepository

    @Binds
    @Singleton
    abstract fun bindCustomerRepository(impl: CustomerRepositoryImpl): CustomerRepository

    @Binds
    @Singleton
    abstract fun bindTemplateRepository(impl: TemplateRepositoryImpl): TemplateRepository

    @Binds
    @Singleton
    abstract fun bindFollowUpSuggestionRepository(impl: FollowUpSuggestionRepositoryImpl): FollowUpSuggestionRepository

    @Binds
    @Singleton
    abstract fun bindMessageLogRepository(impl: MessageLogRepositoryImpl): MessageLogRepository

    @Binds
    @Singleton
    abstract fun bindRuleRepository(impl: RuleRepositoryImpl): RuleRepository

    @Binds
    @Singleton
    abstract fun bindActivityLogRepository(impl: ActivityLogRepositoryImpl): ActivityLogRepository

    @Binds
    @Singleton
    abstract fun bindSmsMessageRepository(impl: SmsMessageRepositoryImpl): SmsMessageRepository

    @Binds
    @Singleton


    @Binds
    @Singleton
    abstract fun bindWhatsAppSender(impl: WhatsAppIntentSender): WhatsAppSender
}
