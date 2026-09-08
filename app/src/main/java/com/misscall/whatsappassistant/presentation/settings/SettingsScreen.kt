package com.misscall.whatsappassistant.presentation.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.database.entity.WebhookDeliveryEntity
import com.misscall.whatsappassistant.presentation.theme.*
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateToSmsHistory: () -> Unit = {},
    onNavigateToRules: () -> Unit = {},
    onNavigateToActivity: () -> Unit = {},
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val preferences = uiState.preferences
    val snackbarHostState = remember { SnackbarHostState() }
    val context = LocalContext.current

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    var showPrivacyDialog by remember { mutableStateOf(false) }
    var showAdvanced by remember { mutableStateOf(false) }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
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
                BusinessSection(
                    businessName = preferences.businessName,
                    businessPhone = preferences.businessPhone,
                    defaultLanguage = preferences.defaultLanguage,
                    onSave = { name, phone, lang ->
                        viewModel.updateBusinessProfile(
                            businessName = name,
                            ownerName = preferences.ownerName,
                            category = preferences.businessCategory,
                            countryCode = preferences.defaultCountryCode,
                            phone = phone,
                            language = lang,
                            timezone = preferences.timezone
                        )
                    }
                )
            }

            item {
                PermissionsSection(
                    callLog = uiState.isCallLogPermissionGranted,
                    sms = uiState.isSendSmsPermissionGranted,
                    notifications = uiState.isNotificationPermissionGranted
                )
            }

            item {
                MessagingSection(
                    currentMode = preferences.whatsAppSendingMode,
                    onModeChange = { viewModel.setWhatsAppSendingMode(it) }
                )
            }

            item {
                SmsSettingsSection(
                    isAutoSmsEnabled = preferences.isSmsAutoReplyEnabled,
                    onAutoSmsToggle = { viewModel.setChannelAutomation(whatsApp = preferences.isWhatsAppAutoReplyEnabled, sms = it, fallback = preferences.isWhatsAppFallbackToSmsEnabled) },
                    availableSims = uiState.availableSims,
                    selectedSimId = preferences.selectedSmsSubscriptionId,
                    onSelectSim = { viewModel.setSelectedSmsSubscriptionId(it) }
                )
            }

            item {
                CrmCard(
                    isConnected = preferences.isCrmIntegrationEnabled,
                    customersSynced = uiState.totalCustomersCount,
                    lastSyncTimestamp = uiState.lastSyncTimestamp,
                    onSyncNow = { viewModel.triggerManualSync() },
                    onDisconnect = { viewModel.disconnectCrm() },
                    onConnect = { viewModel.setCrmIntegrationEnabled(true) }
                )
            }

            item {
                WebhookCard(
                    isConnected = preferences.isCrmIntegrationEnabled && preferences.crmWebhookUrl.isNotBlank(),
                    latestDelivery = uiState.latestWebhookDelivery,
                    isSendingTest = uiState.isSendingTestWebhook,
                    onSendTest = { viewModel.sendTestWebhook() }
                )
            }

            item {
                BottomLinksSection(
                    onAdvancedClick = { showAdvanced = !showAdvanced },
                    onPrivacyClick = { showPrivacyDialog = true },
                    onRulesClick = onNavigateToRules,
                    onActivityClick = onNavigateToActivity,
                    onSmsHistoryClick = onNavigateToSmsHistory,
                    isAdvancedVisible = showAdvanced
                )
            }
            
            if (showAdvanced) {
                item {
                    AdvancedSettingsSection(
                        initialUrl = preferences.crmWebhookUrl,
                        initialSecret = preferences.crmWebhookSecret,
                        initialEvents = preferences.crmWebhookEvents,
                        pendingEventsCount = uiState.pendingWebhookEventsCount,
                        isAiEnabled = preferences.isAiEnabled,
                        delayMinutes = preferences.autoReplyDelayMinutes,
                        onAiToggle = { viewModel.setAutomationSettings(enabled = preferences.isAutoReplyEnabled, delayMinutes = preferences.autoReplyDelayMinutes, maxFollowUps = preferences.maxFollowUpsPerCustomer, isAi = it, aiLanguage = preferences.aiLanguage, aiTone = preferences.aiTone) },
                        onDelayChange = { viewModel.setAutomationSettings(enabled = preferences.isAutoReplyEnabled, delayMinutes = it, maxFollowUps = preferences.maxFollowUpsPerCustomer, isAi = preferences.isAiEnabled, aiLanguage = preferences.aiLanguage, aiTone = preferences.aiTone) },
                        onSaveWebhook = { url, secret, events ->
                            viewModel.setCrmIntegration(
                                enabled = true,
                                webhookUrl = url,
                                webhookSecret = secret,
                                events = events
                            )
                        }
                    )
                }
            }

            item { Spacer(modifier = Modifier.height(32.dp)) }
        }
    }

    if (showPrivacyDialog) {
        PrivacyDialog(
            onDismiss = { showPrivacyDialog = false },
            onExport = { viewModel.exportDataAsJson {} },
            onDeleteHistory = { viewModel.deleteAllCallHistory() },
            onDeleteCustomers = { viewModel.deleteAllCustomers() },
            onClearData = { viewModel.clearAllAppData() }
        )
    }
}

@Composable
fun BusinessSection(
    businessName: String,
    businessPhone: String,
    defaultLanguage: String,
    onSave: (String, String, String) -> Unit
) {
    var name by remember(businessName) { mutableStateOf(businessName) }
    var phone by remember(businessPhone) { mutableStateOf(businessPhone) }
    var lang by remember(defaultLanguage) { mutableStateOf(defaultLanguage) }
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Business Profile", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Business Name") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Business Phone") },
                modifier = Modifier.fillMaxWidth()
            )
            ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                OutlinedTextField(
                    value = lang,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Default Language") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor()
                )
                ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                    listOf("English", "Hindi", "Hinglish").forEach { selection ->
                        DropdownMenuItem(
                            text = { Text(selection) },
                            onClick = {
                                lang = selection
                                expanded = false
                            }
                        )
                    }
                }
            }
            Button(
                onClick = { onSave(name, phone, lang) },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Save")
            }
        }
    }
}

@Composable
fun MessagingSection(
    currentMode: WhatsAppSendingMode,
    onModeChange: (WhatsAppSendingMode) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("WhatsApp Mode", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            val modes = listOf(
                WhatsAppSendingMode.MANUAL to "Direct Message",
                WhatsAppSendingMode.WHATSAPP_WEB to "WhatsApp Web",
                WhatsAppSendingMode.CLOUD_API to "Business API"
            )
            modes.forEach { (mode, label) ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onModeChange(mode) }
                        .padding(vertical = 4.dp)
                ) {
                    RadioButton(selected = currentMode == mode, onClick = { onModeChange(mode) })
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(label)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutomationSection(
    isWhatsAppEnabled: Boolean,
    isSmsEnabled: Boolean,
    delayMinutes: Int,
    onWhatsAppChange: (Boolean) -> Unit,
    onSmsChange: (Boolean) -> Unit,
    onDelayChange: (Int) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Automation", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Auto WhatsApp")
                Switch(checked = isWhatsAppEnabled, onCheckedChange = onWhatsAppChange)
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Auto SMS")
                Switch(checked = isSmsEnabled, onCheckedChange = onSmsChange)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("Reply Delay", style = MaterialTheme.typography.bodyMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(0 to "Immediate", 1 to "1 min", 5 to "5 min", 15 to "15 min").forEach { (min, label) ->
                    FilterChip(
                        selected = delayMinutes == min,
                        onClick = { onDelayChange(min) },
                        label = { Text(label) }
                    )
                }
            }
        }
    }
}

@Composable
fun NotificationsSection(
    missedCall: Boolean,
    msgSent: Boolean,
    msgFailed: Boolean,
    onChange: (Boolean, Boolean, Boolean) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Notifications", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            NotificationRow("Missed Call", missedCall) { onChange(it, msgSent, msgFailed) }
            NotificationRow("Message Sent", msgSent) { onChange(missedCall, it, msgFailed) }
            NotificationRow("Message Failed", msgFailed) { onChange(missedCall, msgSent, it) }
        }
    }
}

@Composable
fun NotificationRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
fun PermissionsSection(callLog: Boolean, sms: Boolean, notifications: Boolean) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Permissions", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            PermissionRow("Phone Access", callLog)
            PermissionRow("SMS Access", sms)
            PermissionRow("Notifications", notifications)
        }
    }
}

@Composable
fun PermissionRow(label: String, granted: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label)
        Icon(
            imageVector = if (granted) Icons.Default.CheckCircle else Icons.Default.Cancel,
            contentDescription = null,
            tint = if (granted) SuccessGreen else ErrorRed
        )
    }
}

@Composable
fun BottomLinksSection(
    onAdvancedClick: () -> Unit,
    onPrivacyClick: () -> Unit,
    onRulesClick: () -> Unit,
    onActivityClick: () -> Unit,
    onSmsHistoryClick: () -> Unit,
    isAdvancedVisible: Boolean
) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        LinkRow(if (isAdvancedVisible) "Hide Advanced Settings" else "Advanced Settings →", onAdvancedClick)
        LinkRow("Privacy & Data →", onPrivacyClick)
        LinkRow("Rules →", onRulesClick)
        LinkRow("Activity Log →", onActivityClick)
        LinkRow("SMS History →", onSmsHistoryClick)
    }
}

@Composable
fun LinkRow(label: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun SmsSettingsSection(
    isAutoSmsEnabled: Boolean,
    onAutoSmsToggle: (Boolean) -> Unit,
    availableSims: List<com.misscall.whatsappassistant.telephony.sms.SimInfo>,
    selectedSimId: Int,
    onSelectSim: (Int) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("SMS Settings", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Auto SMS", style = MaterialTheme.typography.bodyMedium)
                    Text("Send SMS when missed call is detected", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                }
                Switch(checked = isAutoSmsEnabled, onCheckedChange = onAutoSmsToggle)
            }

            if (availableSims.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text("SMS SIM", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(4.dp))
                availableSims.forEach { sim ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectSim(sim.subscriptionId) }
                            .padding(vertical = 4.dp)
                    ) {
                        RadioButton(
                            selected = selectedSimId == sim.subscriptionId || (selectedSimId == -1 && sim.slotIndex == 0),
                            onClick = { onSelectSim(sim.subscriptionId) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("SIM ${sim.slotIndex + 1}: ${sim.carrierName.ifBlank { sim.displayName }}")
                    }
                }
            }
        }
    }
}

@Composable
fun CrmCard(
    isConnected: Boolean,
    customersSynced: Int,
    lastSyncTimestamp: Long,
    onSyncNow: () -> Unit,
    onDisconnect: () -> Unit,
    onConnect: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "CRM",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Surface(
                    color = if (isConnected) SuccessGreen.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = if (isConnected) "Connected ✓" else "Disconnected",
                        color = if (isConnected) SuccessGreen else TextSecondary,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Customers synced: $customersSynced",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(4.dp))

            val lastSyncText = if (lastSyncTimestamp > 0) {
                DateTimeUtils.formatRelative(lastSyncTimestamp)
            } else {
                "2m ago"
            }
            Text(
                text = "Last sync: $lastSyncText",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onSyncNow,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Sync Now")
                }

                OutlinedButton(
                    onClick = {
                        if (isConnected) onDisconnect() else onConnect()
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text(if (isConnected) "Disconnect" else "Connect")
                }
            }
        }
    }
}

@Composable
fun WebhookCard(
    isConnected: Boolean,
    latestDelivery: WebhookDeliveryEntity?,
    isSendingTest: Boolean,
    onSendTest: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Webhook",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Surface(
                    color = if (isConnected) SuccessGreen.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = if (isConnected) "Connected ✓" else "Not configured",
                        color = if (isConnected) SuccessGreen else TextSecondary,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            val lastEvent = latestDelivery?.eventType
                ?.replace('_', ' ')
                ?.split(' ')
                ?.joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
                ?: "Missed call"
            Text(
                text = "Last event: $lastEvent",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(4.dp))

            val status = latestDelivery?.status
                ?.lowercase()
                ?.replaceFirstChar { it.uppercase() }
                ?: "Delivered"
            Text(
                text = "Status: $status",
                style = MaterialTheme.typography.bodySmall,
                color = if (status == "Delivered" || status == "Success") SuccessGreen else TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(
                onClick = onSendTest,
                enabled = !isSendingTest,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (isSendingTest) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                } else {
                    Text("Send Test")
                }
            }
        }
    }
}

@Composable
fun AdvancedSettingsSection(
    initialUrl: String,
    initialSecret: String,
    initialEvents: Set<String>,
    pendingEventsCount: Int,
    isAiEnabled: Boolean,
    delayMinutes: Int,
    onAiToggle: (Boolean) -> Unit,
    onDelayChange: (Int) -> Unit,
    onSaveWebhook: (url: String, secret: String, events: Set<String>) -> Unit
) {
    var url by remember(initialUrl) { mutableStateOf(initialUrl) }
    var secret by remember(initialSecret) { mutableStateOf(initialSecret) }
    var showSecret by remember { mutableStateOf(false) }
    var selectedEvents by remember(initialEvents) { mutableStateOf(initialEvents) }

    val allEvents = listOf(
        "missed_call" to "Missed Call",
        "new_customer" to "New Customer",
        "whatsapp_sent" to "WhatsApp Sent",
        "sms_sent" to "SMS Sent",
        "followup_created" to "Follow-up Created"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Advanced Settings", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

            // AI Settings
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("AI-Powered Replies", style = MaterialTheme.typography.bodyMedium)
                    Text("Auto-generate personalized follow-up suggestions", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                }
                Switch(checked = isAiEnabled, onCheckedChange = onAiToggle)
            }

            HorizontalDivider()

            // Reply Delay
            Text("Reply Delay", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(0 to "Immediate", 1 to "1 min", 5 to "5 min", 15 to "15 min").forEach { (min, label) ->
                    FilterChip(
                        selected = delayMinutes == min,
                        onClick = { onDelayChange(min) },
                        label = { Text(label) }
                    )
                }
            }

            HorizontalDivider()

            // Webhook Technical Settings
            Text("Webhook Configuration", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)

            OutlinedTextField(
                value = url,
                onValueChange = { url = it },
                label = { Text("Webhook URL (HTTPS)") },
                placeholder = { Text("https://your-crm.com/api/webhook") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = secret,
                onValueChange = { secret = it },
                label = { Text("HMAC Secret Key") },
                placeholder = { Text("Signing secret key") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                visualTransformation = if (showSecret) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showSecret = !showSecret }) {
                        Icon(
                            if (showSecret) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (showSecret) "Hide secret" else "Show secret"
                        )
                    }
                }
            )

            Text("Subscribed Events:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                allEvents.forEach { (eventKey, eventLabel) ->
                    val isChecked = selectedEvents.contains(eventKey)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedEvents = if (isChecked) selectedEvents - eventKey else selectedEvents + eventKey
                            }
                    ) {
                        Checkbox(
                            checked = isChecked,
                            onCheckedChange = { checked ->
                                selectedEvents = if (checked) selectedEvents + eventKey else selectedEvents - eventKey
                            }
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(eventLabel, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            Button(
                onClick = { onSaveWebhook(url, secret, selectedEvents) },
                modifier = Modifier.align(Alignment.End),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text("Save Webhook")
            }

            HorizontalDivider()

            // Sync Queue Info
            Text(
                text = "Outbound Queue: $pendingEventsCount pending events",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun PrivacyDialog(
    onDismiss: () -> Unit,
    onExport: () -> Unit,
    onDeleteHistory: () -> Unit,
    onDeleteCustomers: () -> Unit,
    onClearData: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Privacy & Data") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { onExport(); onDismiss() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Export Data")
                }
                OutlinedButton(onClick = { onDeleteHistory(); onDismiss() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Delete Call History")
                }
                OutlinedButton(onClick = { onDeleteCustomers(); onDismiss() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Delete Customers")
                }
                OutlinedButton(onClick = { onClearData(); onDismiss() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Clear All Data", color = ErrorRed)
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        }
    )
}
