package com.misscall.whatsappassistant.presentation.customers

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.PhoneCallback
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus
import com.misscall.whatsappassistant.presentation.sms.SmsComposerDialog
import com.misscall.whatsappassistant.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerDetailScreen(
    onNavigateBack: () -> Unit,
    viewModel: CustomerDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    var showSmsDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    if (showSmsDialog && uiState.customer != null) {
        SmsComposerDialog(
            phoneNumber = uiState.customer!!.phoneNumber,
            onDismiss = { showSmsDialog = false }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            uiState.customer?.let { customer ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    // Header Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Surface(
                                modifier = Modifier.size(72.dp),
                                shape = CircleShape,
                                color = PrimaryGreen.copy(alpha = 0.2f)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    val initial = customer.name?.firstOrNull()?.toString()?.uppercase() ?: "#"
                                    Text(
                                         text = initial,
                                         style = MaterialTheme.typography.headlineMedium,
                                         color = PrimaryGreen,
                                         fontWeight = FontWeight.Bold
                                     )
                                 }
                             }
                             
                             Spacer(modifier = Modifier.height(16.dp))
                             
                             Text(
                                 text = customer.name?.ifBlank { customer.phoneNumber } ?: customer.phoneNumber,
                                 style = MaterialTheme.typography.headlineMedium
                             )
                             
                             Text(
                                 text = customer.phoneNumber,
                                 style = MaterialTheme.typography.bodyLarge,
                                 color = TextSecondary
                             )
                             
                             Spacer(modifier = Modifier.height(8.dp))
                             
                             Row(
                                 horizontalArrangement = Arrangement.spacedBy(8.dp),
                                 verticalAlignment = Alignment.CenterVertically
                             ) {
                                 val statusText: String
                                 val statusColor: Color
                                 if (customer.isVip) {
                                     statusText = "VIP ⭐"
                                     statusColor = StatusVip
                                 } else if (customer.totalMissedCalls >= 2) {
                                     statusText = "Active"
                                     statusColor = StatusActive
                                 } else {
                                     statusText = "New Lead"
                                     statusColor = StatusNewLead
                                 }
                                 
                                 Surface(
                                     color = statusColor.copy(alpha = 0.1f),
                                     shape = MaterialTheme.shapes.small
                                 ) {
                                     Text(
                                         text = statusText,
                                         style = MaterialTheme.typography.labelLarge,
                                         color = statusColor,
                                         modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                                     )
                                 }

                                 var showStatusMenu by remember { mutableStateOf(false) }
                                 Box {
                                     FilterChip(
                                         selected = true,
                                         onClick = { showStatusMenu = true },
                                         label = { Text("Stage: ${customer.businessStatus.name}") },
                                         trailingIcon = { Icon(Icons.Default.ArrowDropDown, contentDescription = null) }
                                     )
                                     DropdownMenu(
                                         expanded = showStatusMenu,
                                         onDismissRequest = { showStatusMenu = false }
                                     ) {
                                         CustomerBusinessStatus.values().forEach { status ->
                                             DropdownMenuItem(
                                                 text = { Text(status.name) },
                                                 onClick = {
                                                     viewModel.updateBusinessStatus(status)
                                                     showStatusMenu = false
                                                 }
                                             )
                                         }
                                     }
                                 }
                             }
                             
                             Spacer(modifier = Modifier.height(8.dp))
                             
                             val dateStr = DateTimeUtils.formatRelative(customer.lastCallTimestamp)
                             Text(
                                 text = "Total calls: ${customer.totalMissedCalls} · Last: $dateStr",
                                 style = MaterialTheme.typography.bodyMedium,
                                 color = TextSecondary
                             )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "How would you like to follow up?",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                    )

                    // Action Buttons
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.sendWhatsApp(uiState.suggestedMessage) },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen)
                        ) {
                            Text("WhatsApp")
                        }
                        
                        OutlinedButton(
                            onClick = { showSmsDialog = true },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = SmsBlue)
                        ) {
                            Text("SMS")
                        }
                        
                        OutlinedButton(
                            onClick = {
                                viewModel.recordCallBack()
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${customer.phoneNumber}"))
                                context.startActivity(intent)
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Call Back")
                        }
                    }

                    // Follow-up Card
                    val focusRequester = remember { androidx.compose.ui.focus.FocusRequester() }
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Suggested message:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            OutlinedTextField(
                                value = uiState.suggestedMessage,
                                onValueChange = viewModel::updateSuggestedMessage,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .focusRequester(focusRequester),
                                minLines = 3,
                                maxLines = 5
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    TextButton(onClick = { focusRequester.requestFocus() }) {
                                        Text("Edit")
                                    }
                                    TextButton(onClick = { viewModel.generateAiMessage() }) {
                                        Text("✨ Generate")
                                    }
                                }
                                Button(
                                    onClick = { viewModel.sendWhatsApp(uiState.suggestedMessage) },
                                    colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen)
                                ) {
                                    Text("Send")
                                }
                            }
                        }
                    }

                    // Timeline Section
                    Text(
                        text = "Timeline",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                    
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.timeline) { item ->
                            TimelineCard(item)
                        }
                    }
                }
            } ?: run {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Customer not found", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun TimelineCard(item: TimelineItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val (icon, color) = when (item.type) {
                TimelineType.MISSED_CALL -> Icons.Default.Call to PrimaryGreen
                TimelineType.WHATSAPP_SENT -> Icons.AutoMirrored.Filled.Send to WhatsAppGreen
                TimelineType.WHATSAPP_FAILED -> Icons.Default.Warning to MaterialTheme.colorScheme.error
                TimelineType.SMS_SENT -> Icons.AutoMirrored.Filled.Message to SmsBlue
                TimelineType.SMS_FAILED -> Icons.Default.Warning to MaterialTheme.colorScheme.error
                TimelineType.CALL_BACK -> Icons.Default.PhoneCallback to SecondaryTeal
                TimelineType.CUSTOM_MESSAGE -> Icons.Default.Chat to PrimaryGreen
                TimelineType.CUSTOMER_REPLY -> Icons.Default.Chat to AccentGreen
                TimelineType.FOLLOW_UP_CREATED -> Icons.Default.Schedule to StatusVip
            }
            
            Surface(
                modifier = Modifier.size(40.dp),
                shape = CircleShape,
                color = color.copy(alpha = 0.1f)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.padding(8.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(text = item.title, style = MaterialTheme.typography.titleSmall)
                if (item.subtitle.isNotBlank()) {
                    Text(
                        text = item.subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary,
                        maxLines = 1
                    )
                }
            }
            
            Text(
                text = DateTimeUtils.formatTime(item.timestamp),
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary
            )
        }
    }
}
