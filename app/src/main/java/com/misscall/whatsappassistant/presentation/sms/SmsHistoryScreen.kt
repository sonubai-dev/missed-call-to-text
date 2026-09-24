package com.misscall.whatsappassistant.presentation.sms

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ClearAll
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SimCard
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.domain.model.SmsMessage
import com.misscall.whatsappassistant.domain.model.SmsMessageStatus
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusFailed
import com.misscall.whatsappassistant.presentation.theme.StatusSent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmsHistoryScreen(
    onNavigateBack: (() -> Unit)? = null,
    viewModel: SmsHistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedSmsForDetails by remember { mutableStateOf<SmsMessage?>(null) }

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    if (onNavigateBack != null) {
                        IconButton(onClick = onNavigateBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Sms, contentDescription = null, tint = Color(0xFF2196F3), modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Native SMS History",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                },
                actions = {
                    if (uiState.messages.isNotEmpty()) {
                        IconButton(onClick = { viewModel.clearAllSms() }) {
                            Icon(Icons.Default.ClearAll, contentDescription = "Clear All SMS")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color(0xFF2196F3))
            }
            return@Scaffold
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Metrics Summary Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SmsMetricPill(
                    title = "Sent",
                    count = uiState.sentCount,
                    color = StatusSent,
                    modifier = Modifier.weight(1f)
                )
                SmsMetricPill(
                    title = "Scheduled",
                    count = uiState.scheduledCount,
                    color = Color(0xFFFFA000),
                    modifier = Modifier.weight(1f)
                )
                SmsMetricPill(
                    title = "Failed",
                    count = uiState.failedCount,
                    color = StatusFailed,
                    modifier = Modifier.weight(1f)
                )
            }

            // Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = uiState.selectedFilter == null,
                    onClick = { viewModel.setFilter(null) },
                    label = { Text("All") }
                )
                listOf(
                    SmsMessageStatus.SENT,
                    SmsMessageStatus.DELIVERED,
                    SmsMessageStatus.FAILED,
                    SmsMessageStatus.SCHEDULED,
                    SmsMessageStatus.SKIPPED
                ).forEach { status ->
                    FilterChip(
                        selected = uiState.selectedFilter == status,
                        onClick = { viewModel.setFilter(status) },
                        label = { Text(status.name) }
                    )
                }
            }

            if (uiState.filteredMessages.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No SMS Dispatches",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Native SIM SMS messages triggered by missed calls will appear here.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(uiState.filteredMessages, key = { it.id }) { sms ->
                        SmsCard(
                            sms = sms,
                            onClick = { selectedSmsForDetails = sms }
                        )
                    }
                }
            }
        }
    }

    // SMS Details Dialog
    selectedSmsForDetails?.let { sms ->
        SmsDetailsDialog(
            sms = sms,
            onRetry = {
                selectedSmsForDetails = null
            },
            onCancelScheduled = {
                viewModel.cancelScheduledSms(sms.id)
                selectedSmsForDetails = null
            },
            onDelete = {
                viewModel.deleteSms(sms.id)
                selectedSmsForDetails = null
            },
            onDismiss = { selectedSmsForDetails = null }
        )
    }
}

@Composable
private fun SmsCard(
    sms: SmsMessage,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Sms, contentDescription = null, tint = Color(0xFF2196F3), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = sms.phoneNumber,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                }
                SmsStatusBadge(status = sms.status)
            }

            Spacer(modifier = Modifier.height(6.dp))

            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "\"${sms.message}\"",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(8.dp),
                    maxLines = 2
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = DateTimeUtils.formatFull(sms.createdAt),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (sms.subscriptionId != null) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.SimCard, contentDescription = null, modifier = Modifier.size(12.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "SIM Sub #${sms.subscriptionId}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            if (!sms.failureReason.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Error, contentDescription = null, tint = StatusFailed, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = sms.failureReason,
                        style = MaterialTheme.typography.labelSmall,
                        color = StatusFailed,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

@Composable
private fun SmsDetailsDialog(
    sms: SmsMessage,
    onRetry: () -> Unit,
    onCancelScheduled: () -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Sms, contentDescription = null, tint = Color(0xFF2196F3), modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("SMS Dispatch Details", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Recipient: ${sms.phoneNumber}", fontWeight = FontWeight.SemiBold)
                Text("Status: ${sms.status.name}", color = if (sms.status == SmsMessageStatus.SENT) StatusSent else MaterialTheme.colorScheme.onSurface)
                if (sms.callEventId != null) {
                    Text("Triggered by Missed Call ID: #${sms.callEventId}", style = MaterialTheme.typography.labelSmall)
                }
                Text("Created: ${DateTimeUtils.formatFull(sms.createdAt)}", style = MaterialTheme.typography.labelSmall)
                if (sms.sentAt != null) {
                    Text("Sent at: ${DateTimeUtils.formatFull(sms.sentAt)}", style = MaterialTheme.typography.labelSmall)
                }
                if (sms.deliveredAt != null) {
                    Text("Delivered at: ${DateTimeUtils.formatFull(sms.deliveredAt)}", style = MaterialTheme.typography.labelSmall)
                }
                if (!sms.failureReason.isNullOrBlank()) {
                    Text("Reason: ${sms.failureReason}", color = StatusFailed, style = MaterialTheme.typography.bodySmall)
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                Text("Message:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = sms.message,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (sms.status == SmsMessageStatus.FAILED) {
                    Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3))) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Retry SMS")
                    }
                } else if (sms.status == SmsMessageStatus.SCHEDULED) {
                    Button(onClick = onCancelScheduled, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)) {
                        Icon(Icons.Default.Cancel, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Cancel")
                    }
                }
                TextButton(onClick = onDelete) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        }
    )
}

@Composable
private fun SmsMetricPill(title: String, count: Int, color: Color, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(title, style = MaterialTheme.typography.labelSmall, color = color)
            Text(
                text = count.toString(),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = color
            )
        }
    }
}

@Composable
private fun SmsStatusBadge(status: SmsMessageStatus) {
    val (color, label) = when (status) {
        SmsMessageStatus.SENT -> StatusSent to "SENT"
        SmsMessageStatus.DELIVERED -> StatusSent to "DELIVERED"
        SmsMessageStatus.SENDING -> Color(0xFFFFA000) to "SENDING"
        SmsMessageStatus.SCHEDULED -> Color(0xFFFFA000) to "SCHEDULED"
        SmsMessageStatus.FAILED -> StatusFailed to "FAILED"
        SmsMessageStatus.SKIPPED -> Color(0xFF757575) to "SKIPPED"
        SmsMessageStatus.CANCELLED -> Color(0xFF757575) to "CANCELLED"
        SmsMessageStatus.DRAFT -> Color(0xFF757575) to "DRAFT"
    }

    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp)
    ) {
        Text(
            text = label,
            color = color,
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}
