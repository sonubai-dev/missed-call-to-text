package com.misscall.whatsappassistant.core.di

import android.content.Context
import androidx.room.Room
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.database.AppDatabase
import com.misscall.whatsappassistant.database.dao.ActivityLogDao
import com.misscall.whatsappassistant.database.dao.CallEventDao
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.dao.FollowUpSuggestionDao
import com.misscall.whatsappassistant.database.dao.MessageLogDao
import com.misscall.whatsappassistant.database.dao.MessageTemplateDao
import com.misscall.whatsappassistant.database.dao.RuleDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Provider
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context,
        templateDaoProvider: Provider<MessageTemplateDao>,
        ruleDaoProvider: Provider<RuleDao>
    ): AppDatabase {
        val databaseScope = CoroutineScope(SupervisorJob())
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            Constants.DATABASE_NAME
        )
            .addMigrations(AppDatabase.MIGRATION_4_5, AppDatabase.MIGRATION_5_6, AppDatabase.MIGRATION_6_7, AppDatabase.MIGRATION_7_8)
            .addCallback(AppDatabase.SeedCallback(templateDaoProvider, ruleDaoProvider, databaseScope))
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideCallEventDao(database: AppDatabase): CallEventDao = database.callEventDao()

    @Provides
    fun provideCustomerDao(database: AppDatabase): CustomerDao = database.customerDao()

    @Provides
    fun provideMessageTemplateDao(database: AppDatabase): MessageTemplateDao = database.messageTemplateDao()

    @Provides
    fun provideMessageLogDao(database: AppDatabase): MessageLogDao = database.messageLogDao()

    @Provides
    fun provideFollowUpSuggestionDao(database: AppDatabase): FollowUpSuggestionDao = database.followUpSuggestionDao()

    @Provides
    fun provideRuleDao(database: AppDatabase): RuleDao = database.ruleDao()

    @Provides
    fun provideActivityLogDao(database: AppDatabase): ActivityLogDao = database.activityLogDao()

    @Provides
    fun provideSmsMessageDao(database: AppDatabase): com.misscall.whatsappassistant.database.dao.SmsMessageDao = database.smsMessageDao()

    @Provides
    fun provideCrmActivityDao(database: AppDatabase): com.misscall.whatsappassistant.database.dao.CrmActivityDao = database.crmActivityDao()

    @Provides
    fun provideWebhookDao(database: AppDatabase): com.misscall.whatsappassistant.database.dao.WebhookDao = database.webhookDao()

    @Provides
    fun provideWhatsAppMessageDao(database: AppDatabase): com.misscall.whatsappassistant.database.dao.WhatsAppMessageDao = database.whatsAppMessageDao()
}

