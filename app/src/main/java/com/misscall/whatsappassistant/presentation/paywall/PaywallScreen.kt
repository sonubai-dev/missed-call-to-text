package com.misscall.whatsappassistant.presentation.paywall

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.misscall.whatsappassistant.data.repository.SubscriptionRepository
import kotlinx.coroutines.launch

@Composable
fun PaywallScreen(
    statusReason: String,
    statusMessage: String,
    subscriptionRepository: SubscriptionRepository,
    onPaymentVerified: () -> Unit,
    onSignOut: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isCheckingStatus by remember { mutableStateOf(false) }
    var isCreatingSub by remember { mutableStateOf(false) }
    var localError by remember { mutableStateOf<String?>(null) }
    var localSuccessMessage by remember { mutableStateOf<String?>(null) }

    val primaryGreen = Color(0xFF25D366)
    val darkBackground = Color(0xFF0C1317)
    val cardBackground = Color(0xFF1F2C34)

    val isFailure = statusReason.equals("halted", ignoreCase = true) ||
            statusReason.equals("cancelled", ignoreCase = true) ||
            statusReason.equals("expired", ignoreCase = true)

    fun openRazorpayCheckout(url: String) {
        try {
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()
            customTabsIntent.launchUrl(context, Uri.parse(url))
        } catch (e: Exception) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(browserIntent)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBackground)
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Status Icon Header
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(
                        if (isFailure) Color(0x33EF4444) else primaryGreen.copy(alpha = 0.2f),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isFailure) Icons.Default.Warning else Icons.Default.Lock,
                    contentDescription = null,
                    tint = if (isFailure) Color(0xFFEF4444) else primaryGreen,
                    modifier = Modifier.size(40.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (isFailure) "Subscription Needs Attention" else "Unlock MissCall Assistant",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (isFailure)
                    "Please update your payment method or renew your subscription to continue."
                else
                    statusMessage.ifBlank { "Automate customer call screening, SMS follow-up, and instant WhatsApp replies." },
                fontSize = 14.sp,
                color = Color(0xFF8696A0),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Plan Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = cardBackground),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(primaryGreen.copy(alpha = 0.5f))
                )
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Pro Business AutoPay",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Automated recurring renewal via Razorpay",
                                fontSize = 12.sp,
                                color = Color(0xFF8696A0)
                            )
                        }
                        Text(
                            text = "₹499/mo",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = primaryGreen
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = Color(0xFF2A3942))
                    Spacer(modifier = Modifier.height(16.dp))

                    val features = listOf(
                        "Unlimited missed-call detection & instant follow-ups",
                        "Dual-SIM slot routing & offline-first SMS queue",
                        "WhatsApp Web and Cloud API integration",
                        "Automatic duplicate-call protection",
                        "Secure server-verified AutoPay mandate"
                    )

                    features.forEach { feature ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = primaryGreen,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = feature, color = Color(0xFFE9EDEF), fontSize = 13.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Notification / Feedback Messages
            if (!localError.isNullOrBlank()) {
                Surface(
                    color = Color(0x33EF4444),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                ) {
                    Text(
                        text = localError ?: "",
                        color = Color(0xFFFCA5A5),
                        fontSize = 13.sp,
                        modifier = Modifier.padding(12.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }

            if (!localSuccessMessage.isNullOrBlank()) {
                Surface(
                    color = Color(0x3325D366),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                ) {
                    Text(
                        text = localSuccessMessage ?: "",
                        color = primaryGreen,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(12.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Primary Action: Start/Renew Subscription via Razorpay
            Button(
                onClick = {
                    isCreatingSub = true
                    localError = null
                    localSuccessMessage = null

                    coroutineScope.launch {
                        val result = subscriptionRepository.createSubscription()
                        isCreatingSub = false
                        result.onSuccess { sub ->
                            localSuccessMessage = "Opening secure Razorpay subscription checkout..."
                            openRazorpayCheckout(sub.shortUrl)
                        }.onFailure { err ->
                            localError = "Could not initialize Razorpay checkout. Please check internet connection and try again."
                        }
                    }
                },
                enabled = !isCreatingSub && !isCheckingStatus,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = primaryGreen)
            ) {
                if (isCreatingSub) {
                    CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = Color.Black,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isFailure) "Update Payment Method / Renew" else "Subscribe via Razorpay",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.Black
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Secondary Action: Server-Side Entitlement Check Button
            OutlinedButton(
                onClick = {
                    isCheckingStatus = true
                    localError = null
                    localSuccessMessage = null

                    coroutineScope.launch {
                        val result = subscriptionRepository.verifyPayment()
                        isCheckingStatus = false
                        result.onSuccess { status ->
                            if (status.active) {
                                onPaymentVerified()
                            } else {
                                localError = status.message ?: "Payment verification in progress. If you just paid, please allow a few moments and tap verify again."
                            }
                        }.onFailure { err ->
                            localError = "Server verification check failed. Please ensure you are connected to internet."
                        }
                    }
                },
                enabled = !isCheckingStatus && !isCreatingSub,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF2A3942))
                )
            ) {
                if (isCheckingStatus) {
                    CircularProgressIndicator(color = primaryGreen, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Icon(imageVector = Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "I Have Completed Payment / Refresh", fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Sign out button
            TextButton(onClick = onSignOut) {
                Text(text = "Sign Out", color = Color(0xFF8696A0), fontSize = 13.sp)
            }
        }
    }
}
