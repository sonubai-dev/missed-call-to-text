package com.misscall.whatsappassistant.presentation.auth

import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun PaywallScreen(
    viewModel: PaywallViewModel = hiltViewModel(),
    onSubscribed: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(state) {
        if (state is PaywallState.Subscribed) {
            onSubscribed()
        }
    }

    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Subscription Required",
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(16.dp))

            if (state is PaywallState.Error) {
                Text(
                    text = (state as PaywallState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            Button(
                onClick = {
                    val url = "https://rzp.io/rzp/DCET6eO8"
                    val builder = CustomTabsIntent.Builder()
                    val customTabsIntent = builder.build()
                    customTabsIntent.launchUrl(context, Uri.parse(url))
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Pay & Subscribe")
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = { viewModel.checkStatus() },
                modifier = Modifier.fillMaxWidth(),
                enabled = state !is PaywallState.Loading
            ) {
                if (state is PaywallState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                } else {
                    Text("I have paid, Refresh Status")
                }
            }
        }
    }
}
