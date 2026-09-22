package com.misscall.whatsappassistant.presentation.missedcalls

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CallMissed
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.presentation.components.EmptyStateView
import com.misscall.whatsappassistant.presentation.components.QuickFollowUpDialog
import com.misscall.whatsappassistant.presentation.components.StatusBadge
import com.misscall.whatsappassistant.presentation.sms.SmsComposerDialog
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MissedCallsScreen(
    viewModel: MissedCallsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var selectedCallForFollowUp by remember { mutableStateOf<CallEvent?>(null) }
    var selectedCallForSms by remember { mutableStateOf<CallEvent?>(null) }
    var showClearConfirmDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearUserMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Missed Call Records",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                actions = {
                    if (uiState.calls.isNotEmpty()) {
                        IconButton(onClick = { showClearConfirmDialog = true }) {
                            Icon(Icons.Default.Delete, contentDescription = "Clear All", tint = Color.White)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen,
                    titleContentColor = Color.White
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Input
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                placeholder = { Text("Search by name or number...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.setSearchQuery("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear search")
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Filter Chips Row
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = uiState.activeFilter == CallFilter.ALL,
                        onClick = { viewModel.setFilter(CallFilter.ALL) },
                        label = { Text("All (${uiState.calls.size})") }
                    )
                }
                item {
                    FilterChip(
                        selected = uiState.activeFilter == CallFilter.PENDING,
                        onClick = { viewModel.setFilter(CallFilter.PENDING) },
                        label = { Text("Pending (${uiState.calls.count { it.whatsappStatus == WhatsAppFollowUpStatus.PENDING || it.whatsappStatus == WhatsAppFollowUpStatus.SCHEDULED }})") }
                    )
                }
                item {
                    FilterChip(
                        selected = uiState.activeFilter == CallFilter.SENT,
                        onClick = { viewModel.setFilter(CallFilter.SENT) },
                        label = { Text("Sent (${uiState.calls.count { it.whatsappStatus == WhatsAppFollowUpStatus.SENT }})") }
                    )
                }
                item {
                    FilterChip(
                        selected = uiState.activeFilter == CallFilter.IGNORED,
                        onClick = { viewModel.setFilter(CallFilter.IGNORED) },
                        label = { Text("Ignored (${uiState.calls.count { it.whatsappStatus == WhatsAppFollowUpStatus.IGNORED || it.whatsappStatus == WhatsAppFollowUpStatus.SKIPPED }})") }
                    )
                }
            }

            // Calls List
            if (uiState.filteredCalls.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.CallMissed,
                    title = "No Calls Found",
                    message = if (uiState.searchQuery.isNotEmpty()) "No results matching \"${uiState.searchQuery}\"" else "No missed calls in this filter category.",
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(uiState.filteredCalls, key = { it.id }) { call ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedCallForFollowUp = call },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = call.callerName ?: NumberNormalizer.formatDisplay(call.normalizedPhoneNumber),
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Text(
                                            text = NumberNormalizer.formatDisplay(call.normalizedPhoneNumber),
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "${DateTimeUtils.formatFull(call.timestamp)} • Source: ${call.source.name}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }

                                    StatusBadge(status = call.whatsappStatus)
                                }

                                if (call.notes.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Note: ${call.notes}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (call.whatsappStatus == WhatsAppFollowUpStatus.PENDING || call.whatsappStatus == WhatsAppFollowUpStatus.SCHEDULED) {
                                        TextButton(onClick = { viewModel.markAsIgnored(call) }) {
                                            Text("Ignore")
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        OutlinedButton(
                                            onClick = { selectedCallForSms = call },
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Sms, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color(0xFF2196F3))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("SMS", color = Color(0xFF2196F3))
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Button(
                                            onClick = { selectedCallForFollowUp = call },
                                            colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("WhatsApp")
                                        }
                                    } else {
                                        OutlinedButton(
                                            onClick = { selectedCallForSms = call },
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Sms, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color(0xFF2196F3))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("SMS", color = Color(0xFF2196F3))
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Button(
                                            onClick = { selectedCallForFollowUp = call },
                                            colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("WhatsApp")
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        IconButton(onClick = { viewModel.deleteCallEvent(call) }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Follow-up Dialog (WhatsApp)
    selectedCallForFollowUp?.let { call ->
        val defaultTmpl = uiState.templates.firstOrNull { it.isDefault } ?: uiState.templates.firstOrNull()
        val defaultText = defaultTmpl?.content ?: "Hello {caller_name}, thank you for calling. How can we help you?"
        QuickFollowUpDialog(
            phoneNumber = call.phoneNumber,
            callerName = call.callerName,
            initialMessage = defaultText,
            templates = uiState.templates,
            onDismiss = { selectedCallForFollowUp = null },
            onSend = { message, templateId ->
                viewModel.sendFollowUp(call, message, templateId)
                selectedCallForFollowUp = null
            }
        )
    }

    // Native SIM SMS Composer Dialog
    selectedCallForSms?.let { call ->
        val defaultTmpl = uiState.templates.firstOrNull { it.isDefault } ?: uiState.templates.firstOrNull()
        val defaultText = defaultTmpl?.content ?: "Hi, thank you for calling. Sorry we missed your call. How can we help you?"
        SmsComposerDialog(
            phoneNumber = call.phoneNumber,
            initialMessage = defaultText,
            
            
            
                viewModel.sendNativeSms(call, message, subId)
                selectedCallForSms = null
            },
            onDismiss = { selectedCallForSms = null }
        )
    }

    // Clear Confirmation Dialog
    if (showClearConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showClearConfirmDialog = false },
            title = { Text("Clear All Call Logs?") },
            text = { Text("This will remove all call history records from local storage. Customers and message logs will be retained.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clearAllHistory()
                        showClearConfirmDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Clear All")
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
