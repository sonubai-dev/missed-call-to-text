package com.misscall.whatsappassistant.presentation.whatsapp

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.presentation.components.PlaceholderTagsRow
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusFailed
import com.misscall.whatsappassistant.presentation.theme.StatusPending
import com.misscall.whatsappassistant.presentation.theme.StatusSent
import com.misscall.whatsappassistant.whatsapp.provider.ProviderConnectionState
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppScreen(
    viewModel: WhatsAppViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val prefs = uiState.preferences

    var showEditDialog by remember { mutableStateOf(false) }
    var templateToEdit by remember { mutableStateOf<MessageTemplate?>(null) }
    var showCloudConfigDialog by remember { mutableStateOf(false) }
    var showWebPairDialog by remember { mutableStateOf(false) }
    var manualMessageToEdit by remember { mutableStateOf<Pair<String, String>?>(null) }

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
                        "WhatsApp Setup",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen,
                    titleContentColor = Color.White
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    templateToEdit = null
                    showEditDialog = true
                },
                containerColor = AccentGreen,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Template")
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // WHATSAPP SENDING MODE SELECTOR CARD
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Devices, contentDescription = null, tint = PrimaryGreen)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "WhatsApp Sending Mode",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Mode 1: Manual
                        ModeSelectorRow(
                            title = "Manual (Recommended)",
                            description = "Standard & safe Android Intent. Opens official WhatsApp chat.",
                            selected = prefs.whatsAppSendingMode == WhatsAppSendingMode.MANUAL,
                            icon = Icons.Default.PhoneAndroid,
                            onSelect = { viewModel.setSendingMode(WhatsAppSendingMode.MANUAL) }
                        )

                        // Mode 2: Official Cloud API
                        ModeSelectorRow(
                            title = "Official Cloud API",
                            description = "Meta Graph API for headless business sending (Tokens encrypted).",
                            selected = prefs.whatsAppSendingMode == WhatsAppSendingMode.CLOUD_API,
                            icon = Icons.Default.Cloud,
                            onSelect = { viewModel.setSendingMode(WhatsAppSendingMode.CLOUD_API) }
                        )
                    }
                }
            }

            // MODE-SPECIFIC ACTIVE CARD
            when (prefs.whatsAppSendingMode) {
                WhatsAppSendingMode.MANUAL -> {
                    item {
                        ManualModeCard(
                            defaultTemplate = uiState.defaultTemplate,
                            onSendMessage = { phone, msg ->
                                viewModel.sendFollowUp(phone, msg)
                            },
                            onEditMessage = { phone, msg ->
                                manualMessageToEdit = Pair(phone, msg)
                            }
                        )
                    }
                }
                WhatsAppSendingMode.CLOUD_API -> {
                    item {
                        CloudApiConfigCard(
                            uiState = uiState,
                            onConfigureClick = { showCloudConfigDialog = true },
                            onValidateClick = { viewModel.validateConnection() }
                        )
                    }
                }
            }

            // Auto-Reply Settings Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (prefs.isAutoReplyEnabled) PrimaryGreen.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Automatic WhatsApp Follow-Up",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (prefs.isAutoReplyEnabled) "Active • Sends WhatsApp when you miss a call" else "Manual Only (Default) • Suggestion created with Reply & Ignore buttons",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (prefs.isAutoReplyEnabled) PrimaryGreen else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Switch(
                                checked = prefs.isAutoReplyEnabled,
                                onCheckedChange = { viewModel.toggleAutoReply(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = PrimaryGreen
                                )
                            )
                        }
                    }
                }
            }

            // Current Active Default Template Card
            item {
                ElevatedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = AccentGreen)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Default Follow-Up Template",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                            TextButton(
                                onClick = {
                                    templateToEdit = uiState.defaultTemplate
                                    showEditDialog = true
                                }
                            ) {
                                Text("Edit")
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        val previewContent = uiState.defaultTemplate?.content
                            ?: "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?"

                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = previewContent,
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }
            }

            // All Templates Section
            item {
                Text(
                    text = "Message Templates (${uiState.templates.size})",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            items(uiState.templates, key = { it.id }) { template ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = template.name,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                if (template.isDefault) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Surface(
                                        color = StatusSent.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = "Default",
                                            color = StatusSent,
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }

                            Row {
                                if (!template.isDefault) {
                                    TextButton(onClick = { viewModel.setDefaultTemplate(template) }) {
                                        Text("Set Default")
                                    }
                                }
                                IconButton(
                                    onClick = {
                                        templateToEdit = template
                                        showEditDialog = true
                                    }
                                ) {
                                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = PrimaryGreen)
                                }
                                if (!template.isDefault && uiState.templates.size > 1) {
                                    IconButton(onClick = { viewModel.deleteTemplate(template) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = template.content,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }

    // Modal 1: Edit/Create Template
    if (showEditDialog) {
        val isEditing = templateToEdit != null
        var name by remember { mutableStateOf(templateToEdit?.name ?: "") }
        var content by remember { mutableStateOf(templateToEdit?.content ?: "") }
        var isDefault by remember { mutableStateOf(templateToEdit?.isDefault ?: false) }

        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text(if (isEditing) "Edit Message Template" else "New Message Template") },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Template Name (e.g., Template 1)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Tap a variable tag to insert:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    PlaceholderTagsRow(onTagSelected = { tag ->
                        content = "$content $tag"
                    })

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text("Message Text (supports {{name}}, {{business_name}}, {{phone}}, {{time}}, {{date}})") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isDefault = !isDefault }
                    ) {
                        Checkbox(checked = isDefault, onCheckedChange = { isDefault = it })
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Make this my default template")
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank() && content.isNotBlank()) {
                            viewModel.saveTemplate(
                                id = templateToEdit?.id ?: 0L,
                                title = name.trim(),
                                content = content.trim(),
                                isDefault = isDefault
                            )
                            showEditDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Save Template")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Modal 2: Edit Custom Message & Send
    manualMessageToEdit?.let { (phone, defaultMsg) ->
        var customMsg by remember { mutableStateOf(defaultMsg) }
        AlertDialog(
            onDismissRequest = { manualMessageToEdit = null },
            title = { Text("Edit Message for $phone") },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = customMsg,
                        onValueChange = { customMsg = it },
                        label = { Text("Message Content") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.sendFollowUp(phone, customMsg)
                        manualMessageToEdit = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Send on WhatsApp")
                }
            },
            dismissButton = {
                TextButton(onClick = { manualMessageToEdit = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Modal 3: WhatsApp Web Pair Dialog
    if (showWebPairDialog) {
        var businessNum by remember { mutableStateOf(prefs.whatsAppWebConnectedNumber.ifBlank { "+91 " }) }
        AlertDialog(
            onDismissRequest = { showWebPairDialog = false },
            title = { Text("WhatsApp Web Dashboard Connection") },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "1. Open WhatsApp on your primary phone.\n2. Tap Settings/Menu > Linked Devices > Link a Device.\n3. Enter your linked business phone number below to activate the browser session bridge:",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = businessNum,
                        onValueChange = { businessNum = it },
                        label = { Text("Linked Business WhatsApp Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Note: Unofficial integration helper. No passwords or cryptographic keys are extracted or stored.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showWebPairDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Connect Session")
                }
            },
            dismissButton = {
                TextButton(onClick = { showWebPairDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Modal 4: Cloud API Credentials Dialog
    if (showCloudConfigDialog) {
        var phoneId by remember { mutableStateOf(prefs.cloudApiPhoneId) }
        var accountId by remember { mutableStateOf(prefs.cloudApiBusinessAccountId) }
        var token by remember { mutableStateOf("") }
        var webhookUrl by remember { mutableStateOf(prefs.cloudApiWebhookUrl) }
        var verifyToken by remember { mutableStateOf(prefs.cloudApiVerifyToken) }
        var showToken by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showCloudConfigDialog = false },
            title = { Text("WhatsApp Cloud API Configuration") },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = phoneId,
                        onValueChange = { phoneId = it },
                        label = { Text("Phone Number ID") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = accountId,
                        onValueChange = { accountId = it },
                        label = { Text("Business Account ID") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = token,
                        onValueChange = { token = it },
                        label = { Text("Permanent Access Token (Encrypted)") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (showToken) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            TextButton(onClick = { showToken = !showToken }) {
                                Text(if (showToken) "Hide" else "Show")
                            }
                        },
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = webhookUrl,
                        onValueChange = { webhookUrl = it },
                        label = { Text("Webhook URL (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = verifyToken,
                        onValueChange = { verifyToken = it },
                        label = { Text("Verify Token (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = PrimaryGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Never stored in plaintext. Encrypted in Android Keystore AES-256.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.saveCloudApiCredentials(
                            phoneNumberId = phoneId,
                            businessAccountId = accountId,
                            accessToken = token,
                            webhookUrl = webhookUrl,
                            verifyToken = verifyToken
                        )
                        showCloudConfigDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Save & Encrypt")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCloudConfigDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// -------------------------------------------------------------
// COMPONENT 1: Mode Selector Row
// -------------------------------------------------------------
@Composable
private fun ModeSelectorRow(
    title: String,
    description: String,
    selected: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onSelect: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onSelect
        )
        Spacer(modifier = Modifier.width(6.dp))
        Icon(icon, contentDescription = null, tint = if (selected) PrimaryGreen else MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                color = if (selected) PrimaryGreen else MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// -------------------------------------------------------------
// COMPONENT 2: MODE 1 — MANUAL CARD
// -------------------------------------------------------------
@Composable
private fun ManualModeCard(
    defaultTemplate: MessageTemplate?,
    onSendMessage: (String, String) -> Unit,
    onEditMessage: (String, String) -> Unit
) {
    val sampleCustomer = "+91 98765 43210"
    val sampleMessage = defaultTemplate?.content
        ?.replace("{{name}}", "there")
        ?.replace("{{business_name}}", "Our Team")
        ?: "Hi, sorry we missed your call. How can we help you today?"

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.PhoneAndroid, contentDescription = null, tint = PrimaryGreen)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Mode 1: Manual Intent Workflow",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = "Customer:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = sampleCustomer,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Suggested message:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "\"$sampleMessage\"",
                        style = MaterialTheme.typography.bodyMedium
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { onEditMessage(sampleCustomer, sampleMessage) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Edit Message")
                        }

                        Button(
                            onClick = { onSendMessage(sampleCustomer, sampleMessage) },
                            modifier = Modifier.weight(1.3f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                        ) {
                            Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Send on WhatsApp")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.Top) {
                Icon(
                    Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(16.dp).padding(top = 2.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "\"Send on WhatsApp\" opens the conversation directly via Android deep-links. Consumer WhatsApp requires user confirmation and does not permit silent background dispatch.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun WhatsAppWebDashboardCard(
    uiState: WhatsAppUiState,
    onConnectClick: () -> Unit,
    onDisconnectClick: () -> Unit,
    onSendFollowUp: (String, String, Long?) -> Unit,
    onEditCustomMessage: (String, String) -> Unit
) {
    val isConnected = uiState.providerStatus?.state == ProviderConnectionState.CONNECTED
    val isQrRequired = uiState.providerStatus?.state == ProviderConnectionState.PAIRING_QR_REQUIRED
    val connectedNumber = uiState.providerStatus?.connectedNumber ?: "Not Linked"

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.QrCode, contentDescription = null, tint = PrimaryGreen)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "WhatsApp Web Dashboard",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Surface(
                    color = if (isConnected) StatusSent.copy(alpha = 0.15f) else StatusPending.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = if (isConnected) "Connected" else "QR Required",
                        color = if (isConnected) StatusSent else StatusPending,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (!isConnected && !isQrRequired) {
                // Not connected, user needs to click Connect
                Button(
                    onClick = onConnectClick,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Connect WhatsApp")
                }
            } else if (isQrRequired) {
                // QR Required State
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Scan QR Code",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Fake QR Box (Since we don't have ZXing included)
                        Box(
                            modifier = Modifier
                                .size(200.dp)
                                .background(Color.White)
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "[ QR CODE PLACEHOLDER ]\n\nData: ${uiState.providerStatus?.qrCodeData ?: "..."}",
                                color = Color.Black,
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Open WhatsApp on your phone → Linked Devices → Link a device → Scan this QR.",
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                // Connected Session Info
                Surface(
                    color = PrimaryGreen.copy(alpha = 0.08f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Business Number:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(NumberNormalizer.formatDisplay(connectedNumber), style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                            Text("Session Status: Active & Linked", style = MaterialTheme.typography.labelSmall, color = PrimaryGreen)
                        }
                        OutlinedButton(
                            onClick = onDisconnectClick,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Disconnect")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Dashboard 4-Box Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    MetricBox(title = "Conversations", count = "${uiState.missedCalls.size}", modifier = Modifier.weight(1f))
                    MetricBox(title = "Missed Calls", count = "${uiState.missedCalls.size}", modifier = Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    MetricBox(title = "Pending", count = "${uiState.pendingFollowUps.size}", modifier = Modifier.weight(1f))
                    MetricBox(title = "Templates", count = "${uiState.templates.size}", modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ADVANCED METRICS (MOCKED FOR NOW)
                Text(
                    text = "ADVANCED",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Queue: 0 messages waiting", style = MaterialTheme.typography.bodySmall)
                        Text("Retry Count: 0 failures", style = MaterialTheme.typography.bodySmall)
                        Text("Last Error: None", style = MaterialTheme.typography.bodySmall)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Test Message
                Button(
                    onClick = { onEditCustomMessage("+91 99999 99999", "This is a test message from MissCall WhatsApp Assistant.") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                ) {
                    Text("Send Test Message")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Compliance note: Unofficial integration helper. No authentication credentials or QR secrets are ever stored.",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun MetricBox(
    title: String,
    count: String,
    modifier: Modifier = Modifier
) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(title, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(count, style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
        }
    }
}

// -------------------------------------------------------------
// COMPONENT 4: MODE 3 — OFFICIAL CLOUD API CARD
// -------------------------------------------------------------
@Composable
private fun CloudApiConfigCard(
    uiState: WhatsAppUiState,
    onConfigureClick: () -> Unit,
    onValidateClick: () -> Unit
) {
    val prefs = uiState.preferences
    val isConfigured = prefs.cloudApiPhoneId.isNotBlank() && prefs.encryptedCloudApiToken.isNotBlank()
    val validation = uiState.validationResult

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Cloud, contentDescription = null, tint = PrimaryGreen)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Official Meta Cloud API",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }

                Surface(
                    color = if (isConfigured) StatusSent.copy(alpha = 0.15f) else StatusPending.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = if (isConfigured) "Configured" else "Setup Needed",
                        color = if (isConfigured) StatusSent else StatusPending,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Phone Number ID: ${prefs.cloudApiPhoneId.ifBlank { "Not set" }}", style = MaterialTheme.typography.bodyMedium)
                    Text("Business Account ID: ${prefs.cloudApiBusinessAccountId.ifBlank { "Not set" }}", style = MaterialTheme.typography.bodyMedium)
                    Text("Access Token: ${if (prefs.encryptedCloudApiToken.isNotBlank()) "•••••••• Encrypted (AES-256)" else "Not set"}", style = MaterialTheme.typography.bodyMedium)
                    if (prefs.cloudApiWebhookUrl.isNotBlank()) {
                        Text("Webhook URL: ${prefs.cloudApiWebhookUrl}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onValidateClick,
                    enabled = isConfigured && !uiState.isValidating,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    if (uiState.isValidating) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    } else {
                        Text("Test Connection")
                    }
                }

                Button(
                    onClick = onConfigureClick,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text(if (isConfigured) "Edit API Keys" else "Configure API")
                }
            }

            validation?.let { res ->
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = if (res.isValid) StatusSent.copy(alpha = 0.12f) else StatusFailed.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (res.isValid) Icons.Default.CheckCircle else Icons.Default.ErrorOutline,
                            contentDescription = null,
                            tint = if (res.isValid) StatusSent else StatusFailed,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = res.message,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
