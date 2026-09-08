package com.misscall.whatsappassistant

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import com.misscall.whatsappassistant.telephony.service.CallMonitoringService
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class MissCallAssistantApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var preferencesRepository: UserPreferencesRepository

    @Inject
    lateinit var callEventPipeline: CallEventPipeline

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()

        // Reconcile any unhandled events from previous app process death or crash
        callEventPipeline.reconcileUnprocessedEvents()

        // Start Call Monitoring Service if enabled
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                if (prefs.isMonitoringServiceEnabled) {
                    CallMonitoringService.startService(this@MissCallAssistantApp)
                }
            } catch (e: Exception) {
                // Handled
            }
        }
    }
}
