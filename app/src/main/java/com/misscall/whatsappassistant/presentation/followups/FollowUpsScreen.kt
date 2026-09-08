package com.misscall.whatsappassistant.presentation.followups

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.presentation.sms.SmsComposerDialog
import com.misscall.whatsappassistant.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FollowUpsScreen(
    onNavigateToCustomerDetail: (Long) -> Unit,
    viewModel: FollowUpsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    var showSmsComposer by remember { mutableStateOf(false) }
    var selectedCallForSms by remember { mutableStateOf<CallEvent?>(null) }

    if (showSmsComposer && selectedCallForSms != null) {
        SmsComposerDialog(
            phoneNumber = selectedCallForSms!!.phoneNumber,
            callerName = selectedCallForSms!!.callerName,
            onDismiss = { showSmsComposer = false; selectedCallForSms = null }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Follow-ups") }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.activeFilter == FollowUpFilter.PENDING,
                    onClick = { viewModel.setFilter(FollowUpFilter.PENDING) },
                    label = { Text("Pending (${uiState.pendingCount})") }
                )
                FilterChip(
                    selected = uiState.activeFilter == FollowUpFilter.SENT,
                    onClick = { viewModel.setFilter(FollowUpFilter.SENT) },
                    label = { Text("Sent (${uiState.sentCount})") }
                )
                FilterChip(
                    selected = uiState.activeFilter == FollowUpFilter.ALL,
                    onClick = { viewModel.setFilter(FollowUpFilter.ALL) },
                    label = { Text("All (${uiState.totalCount})") }
                )
            }

            if (uiState.items.isEmpty()) {
                val emptyMessage = when (uiState.activeFilter) {
                    FollowUpFilter.PENDING -> "No pending follow-ups. When you miss a call, follow-ups appear here."
                    FollowUpFilter.SENT -> "No sent follow-ups yet."
                    FollowUpFilter.ALL -> "No follow-ups found."
                }
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = emptyMessage, color = TextSecondary)
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(uiState.items) { item ->
                        FollowUpCard(
                            item = item,
                            onWhatsAppClick = { viewModel.sendWhatsApp(item.callEvent, item.suggestedMessage) },
                            onSmsClick = {
                                selectedCallForSms = item.callEvent
                                showSmsComposer = true
                            },
                            onCustomerClick = {
                                onNavigateToCustomerDetail(item.callEvent.id)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FollowUpCard(
    item: FollowUpItem,
    onWhatsAppClick: () -> Unit,
    onSmsClick: () -> Unit,
    onCustomerClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            val displayName = item.customerName ?: NumberNormalizer.formatDisplay(item.callEvent.phoneNumber)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = displayName,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.clickable { onCustomerClick() }
                    )
                    Text(
                        text = item.callEvent.phoneNumber,
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
                Text(
                    text = DateTimeUtils.formatRelative(item.callEvent.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Text(
                    text = item.suggestedMessage,
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    modifier = Modifier.padding(8.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            if (item.callEvent.whatsappStatus == WhatsAppFollowUpStatus.SENT) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Sent",
                        tint = SuccessGreen
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Sent", color = SuccessGreen)
                }
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
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
}
