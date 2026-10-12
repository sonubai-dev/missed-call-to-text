package com.misscall.whatsappassistant.presentation

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.misscall.whatsappassistant.data.repository.AuthRepository
import com.misscall.whatsappassistant.data.repository.EntitlementResult
import com.misscall.whatsappassistant.data.repository.SubscriptionRepository
import com.misscall.whatsappassistant.data.session.SessionManager
import com.misscall.whatsappassistant.presentation.auth.LoginScreen
import com.misscall.whatsappassistant.presentation.paywall.PaywallScreen
import com.misscall.whatsappassistant.presentation.whatsapp.WhatsAppScreen
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

sealed class AppNavState {
    object Loading : AppNavState()
    object Auth : AppNavState()
    data class Paywall(val reason: String, val message: String) : AppNavState()
    object MainApp : AppNavState()
}

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private lateinit var sessionManager: SessionManager
    private lateinit var authRepository: AuthRepository
    private lateinit var subscriptionRepository: SubscriptionRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sessionManager = SessionManager(applicationContext)
        authRepository = AuthRepository(sessionManager)
        subscriptionRepository = SubscriptionRepository(sessionManager)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0C1317)
                ) {
                    MissCallMainFlow(
                        authRepository = authRepository,
                        subscriptionRepository = subscriptionRepository,
                        checkPermissions = { requestAppPermissions() }
                    )
                }
            }
        }
    }

    private fun requestAppPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_CONTACTS
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val neededPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (neededPermissions.isNotEmpty()) {
            requestPermissions(neededPermissions.toTypedArray(), 101)
        }
    }
}

@Composable
fun MissCallMainFlow(
    authRepository: AuthRepository,
    subscriptionRepository: SubscriptionRepository,
    checkPermissions: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var navState by remember { mutableStateOf<AppNavState>(AppNavState.Loading) }

    fun refreshEntitlement() {
        navState = AppNavState.Loading
        coroutineScope.launch {
            if (!authRepository.isLoggedIn()) {
                navState = AppNavState.Auth
                return@launch
            }

            when (val entitlement = subscriptionRepository.checkEntitlement()) {
                is EntitlementResult.Active, is EntitlementResult.NetworkGrace -> {
                    checkPermissions()
                    navState = AppNavState.MainApp
                }
                is EntitlementResult.Inactive -> {
                    navState = AppNavState.Paywall(entitlement.reason, entitlement.message)
                }
                is EntitlementResult.Unauthenticated -> {
                    navState = AppNavState.Auth
                }
                is EntitlementResult.Error -> {
                    // On server error or grace, default to paywall with error explanation
                    navState = AppNavState.Paywall("NETWORK_ERROR", entitlement.message)
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshEntitlement()
    }

    when (val state = navState) {
        is AppNavState.Loading -> {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0C1317)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color(0xFF25D366))
            }
        }
        is AppNavState.Auth -> {
            LoginScreen(
                authRepository = authRepository,
                onAuthSuccess = {
                    refreshEntitlement()
                }
            )
        }
        is AppNavState.Paywall -> {
            PaywallScreen(
                statusReason = state.reason,
                statusMessage = state.message,
                subscriptionRepository = subscriptionRepository,
                onPaymentVerified = {
                    refreshEntitlement()
                },
                onSignOut = {
                    authRepository.logout()
                    navState = AppNavState.Auth
                }
            )
        }
        is AppNavState.MainApp -> {
            WhatsAppScreen()
        }
    }
}
