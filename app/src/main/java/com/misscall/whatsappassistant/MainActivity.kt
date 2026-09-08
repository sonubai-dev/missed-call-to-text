package com.misscall.whatsappassistant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.presentation.navigation.AppNavHost
import com.misscall.whatsappassistant.presentation.theme.MissCallWhatsAppAssistantTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.map
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesRepository: UserPreferencesRepository

    private var initialCustomerId = androidx.compose.runtime.mutableLongStateOf(0L)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)

        setContent {
            MissCallWhatsAppAssistantTheme {
                val hasCompletedOnboarding by preferencesRepository.userPreferencesFlow
                    .map { it.hasCompletedOnboarding }
                    .collectAsStateWithLifecycle(initialValue = true)

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavHost(
                        hasCompletedOnboarding = hasCompletedOnboarding,
                        initialCustomerId = initialCustomerId.longValue
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: android.content.Intent?) {
        val cid = intent?.getLongExtra(com.misscall.whatsappassistant.core.util.Constants.EXTRA_CUSTOMER_ID, 0L) ?: 0L
        if (cid > 0L) {
            initialCustomerId.longValue = cid
        }
    }
}
