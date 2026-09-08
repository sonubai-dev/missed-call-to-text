package com.misscall.whatsappassistant.presentation.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CallMissed
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.presentation.sms.SmsComposerDialog
import com.misscall.whatsappassistant.presentation.theme.ErrorRed
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.SmsBlue
import com.misscall.whatsappassistant.presentation.theme.TextSecondary
import com.misscall.whatsappassistant.presentation.theme.WhatsAppGreen
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToCustomerDetail: (Long) -> Unit,
    onNavigateToFollowUps: () -> Unit,
    onNavigateToCustomers: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var showSmsComposer by remember { mutableStateOf(false) }
    var selectedCallForSms by remember { mutableStateOf<CallEvent?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let { message ->
            scope.launch {
                snackbarHostState.showSnackbar(message)
                viewModel.clearUserMessage()
            }
        }
    }

    if (showSmsComposer && selectedCallForSms != null) {
        SmsComposerDialog(
            phoneNumber = selectedCallForSms!!.phoneNumber,
            callerName = selectedCallForSms!!.callerName ?: "",
            onDismiss = { 
                showSmsComposer = false
                selectedCallForSms = null 
            }
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text(uiState.businessName) },
                actions = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(end = 16.dp)
                    ) {
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = if (uiState.isMonitoringActive) PrimaryGreen else ErrorRed,
                            modifier = Modifier
                                .size(12.dp)
                                .padding(end = 4.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (uiState.isMonitoringActive) "Active" else "Paused",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (uiState.isMonitoringActive) PrimaryGreen else ErrorRed
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Today's Activity",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TodayStatCard(
                        modifier = Modifier.weight(1f),
                        count = uiState.missedCallsToday,
                        label = "Missed Calls",
                        color = ErrorRed
                    )
                    TodayStatCard(
                        modifier = Modifier.weight(1f),
                        count = uiState.followUpsToday,
                        label = "Follow-ups",
                        color = Color(0xFFFF9800),
                        onClick = onNavigateToFollowUps
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TodayStatCard(
                        modifier = Modifier.weight(1f),
                        count = uiState.whatsAppSentToday,
                        label = "WhatsApp",
                        color = WhatsAppGreen
                    )
                    TodayStatCard(
                        modifier = Modifier.weight(1f),
                        count = uiState.smsSentToday,
                        label = "SMS",
                        color = SmsBlue
                    )
                }
            }

            if (uiState.pendingFollowUpsCount > 0) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToFollowUps() },
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Pending",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${uiState.pendingFollowUpsCount} ${if (uiState.pendingFollowUpsCount == 1) "customer needs" else "customers need"} follow-up",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = "Pending follow-ups",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Missed Calls",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = onNavigateToFollowUps) {
                        Text("See all →")
                    }
                }
            }

            if (uiState.recentMissedCalls.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No missed calls today. Your assistant is monitoring.",
                                style = MaterialTheme.typography.bodyLarge,
                                color = TextSecondary
                            )
                        }
                    }
                }
            } else {
                items(uiState.recentMissedCalls) { callEvent ->
                    val customerId = uiState.customerMap[callEvent.phoneNumber]
                        ?: uiState.customerMap[callEvent.normalizedPhoneNumber]
                        ?: if (callEvent.phoneNumber.length >= 10) uiState.customerMap[callEvent.phoneNumber.takeLast(10)] else null

                    CallEventCard(
                        callEvent = callEvent,
                        onNavigateToCustomerDetail = { 
                            if (customerId != null && customerId > 0L) {
                                onNavigateToCustomerDetail(customerId)
                            } else {
                                onNavigateToCustomers()
                            }
                        },
                        onWhatsAppClick = {
                            val template = uiState.defaultTemplate
                            val message = if (template != null) {
                                TemplateParser.parse(
                                    template = template.content,
                                    callerName = callEvent.callerName,
                                    phoneNumber = callEvent.phoneNumber,
                                    businessName = uiState.businessName
                                )
                            } else {
                                "Hi, sorry we missed your call from ${uiState.businessName}. How can we help you?"
                            }
                            viewModel.sendWhatsAppFollowUp(callEvent, message)
                        },
                        onSmsClick = {
                            selectedCallForSms = callEvent
                            showSmsComposer = true
                        }
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun TodayStatCard(
    modifier: Modifier = Modifier,
    count: Int,
    label: String,
    color: Color,
    onClick: (() -> Unit)? = null
) {
    Card(
        modifier = modifier.then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = TextSecondary
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    title: String,
    count: Int,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    onClick: (() -> Unit)? = null
) {
    Card(
        modifier = modifier.then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = iconTint,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun CallEventCard(
    callEvent: CallEvent,
    onNavigateToCustomerDetail: () -> Unit,
    onWhatsAppClick: () -> Unit,
    onSmsClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier
                    .weight(1f)
                    .clickable { onNavigateToCustomerDetail() }) {
                    val displayName = if (!callEvent.callerName.isNullOrBlank()) {
                        callEvent.callerName
                    } else {
                        NumberNormalizer.formatDisplay(callEvent.phoneNumber)
                    }
                    Text(
                        text = displayName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = NumberNormalizer.formatDisplay(callEvent.phoneNumber),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
                Text(
                    text = DateTimeUtils.formatRelative(callEvent.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onWhatsAppClick,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen)
                ) {
                    Text("WhatsApp")
                }
                OutlinedButton(
                    onClick = onSmsClick,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = SmsBlue)
                ) {
                    Text("SMS")
                }
            }
        }
    }
}
