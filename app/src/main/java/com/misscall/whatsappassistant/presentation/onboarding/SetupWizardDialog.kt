package com.misscall.whatsappassistant.presentation.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneCallback
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusSent
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode

@Composable
fun SetupWizardDialog(
    hasCallScreeningRole: Boolean,
    hasNotificationPermission: Boolean,
    onRequestRole: () -> Unit,
    onRequestNotification: () -> Unit,
    onTestMissedCall: (phoneNumber: String) -> Unit,
    templates: List<MessageTemplate>,
    onCompleteSetup: (
        businessName: String,
        category: String,
        phone: String,
        mode: WhatsAppSendingMode,
        autoReply: Boolean,
        delayMinutes: Int,
        maxFollowUps: Int
    ) -> Unit,
    onDismiss: () -> Unit
) {
    var step by remember { mutableIntStateOf(1) }

    // Step 1: Business Profile
    var businessName by remember { mutableStateOf("ABC Dental Clinic") }
    var category by remember { mutableStateOf("Healthcare / Clinic") }
    var phone by remember { mutableStateOf("+91 98765 43210") }

    // Step 3: Test State
    var testPerformed by remember { mutableStateOf(false) }

    // Step 4: WhatsApp Mode
    var selectedMode by remember { mutableStateOf(WhatsAppSendingMode.MANUAL) }

    // Step 5: Template
    var selectedTemplate by remember {
        mutableStateOf(templates.firstOrNull { it.isDefault } ?: templates.firstOrNull())
    }

    // Step 6: Automation
    var autoReplyEnabled by remember { mutableStateOf(false) }
    var delayMinutes by remember { mutableIntStateOf(1) }
    var maxFollowUps by remember { mutableIntStateOf(1) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Quick Setup Wizard",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Step $step of 7",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryGreen
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { step / 7f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = PrimaryGreen,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                when (step) {
                    // STEP 1: BUSINESS PROFILE
                    1 -> {
                        WizardHeader(
                            icon = Icons.Default.Business,
                            title = "Your Business Profile",
                            subtitle = "Personalize your auto-replies with your business name and details."
                        )
                        OutlinedTextField(
                            value = businessName,
                            onValueChange = { businessName = it },
                            label = { Text("Business Name *") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("Business Category") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Business Phone Number") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // STEP 2: PHONE PERMISSIONS
                    2 -> {
                        WizardHeader(
                            icon = Icons.Default.Phone,
                            title = "Phone & Screening Permissions",
                            subtitle = "Enable Android Call Screening to reliably detect incoming missed calls without call recording."
                        )
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("1. Call Screening Role", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                        Text("Detects missed calls without audio recording", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    if (hasCallScreeningRole) {
                                        Text("Active", color = StatusSent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    } else {
                                        Button(onClick = onRequestRole, colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)) {
                                            Text("Set Role", fontSize = 11.sp)
                                        }
                                    }
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("2. Notification Access", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                        Text("Interactive reply/ignore prompts", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    if (hasNotificationPermission) {
                                        Text("Active", color = StatusSent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    } else {
                                        Button(onClick = onRequestNotification, colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)) {
                                            Text("Allow", fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // STEP 3: MISSED CALL DETECTION TEST
                    3 -> {
                        WizardHeader(
                            icon = Icons.Default.PhoneCallback,
                            title = "Test Missed Call Pipeline",
                            subtitle = "Simulate a test missed call to verify that the detection pipeline triggers instantly."
                        )
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                if (testPerformed) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = StatusSent, modifier = Modifier.size(40.dp))
                                    Text("Pipeline Test Successful!", fontWeight = FontWeight.Bold, color = StatusSent)
                                    Text("Test call event created and follow-up suggestion generated.", style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
                                } else {
                                    Icon(Icons.Default.HourglassEmpty, contentDescription = null, tint = PrimaryGreen, modifier = Modifier.size(40.dp))
                                    Text("Ready to Test", fontWeight = FontWeight.Bold)
                                    Text("Tap below to trigger an in-memory simulated missed call event.", style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
                                    Button(
                                        onClick = {
                                            onTestMissedCall("+919876543210")
                                            testPerformed = true
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                                    ) {
                                        Text("Simulate Missed Call")
                                    }
                                }
                            }
                        }
                    }

                    // STEP 4: WHATSAPP SETUP
                    4 -> {
                        WizardHeader(
                            icon = Icons.Default.Settings,
                            title = "Select WhatsApp Sending Mode",
                            subtitle = "Choose how follow-up messages are dispatched to your customers."
                        )
                        listOf(
                            Triple(WhatsAppSendingMode.MANUAL, "Mode 1: Manual (Recommended)", "Opens official WhatsApp chat deep-link with pre-filled message."),
                            Triple(WhatsAppSendingMode.CLOUD_API, "Mode 2: Official Cloud API", "Direct Meta Graph API integration with encrypted tokens.")
                        ).forEach { (mode, title, desc) ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedMode == mode) PrimaryGreen.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = selectedMode == mode,
                                        onClick = { selectedMode = mode },
                                        colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                        Text(desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }

                    // STEP 5: MESSAGE TEMPLATE
                    5 -> {
                        WizardHeader(
                            icon = Icons.Default.Description,
                            title = "Choose Default Template",
                            subtitle = "Pick the default reply template for your missed calls."
                        )
                        templates.forEach { tmpl ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedTemplate?.id == tmpl.id) PrimaryGreen.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = selectedTemplate?.id == tmpl.id,
                                        onClick = { selectedTemplate = tmpl },
                                        colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(tmpl.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                        Text("\"${tmpl.content}\"", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }

                    // STEP 6: AUTOMATION
                    6 -> {
                        WizardHeader(
                            icon = Icons.Default.AutoAwesome,
                            title = "Automation & Delays",
                            subtitle = "Configure automated dispatch delays and maximum follow-up limits."
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Enable Auto-Reply", fontWeight = FontWeight.Bold)
                                Text("Automatically send follow-ups after missed calls", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Switch(checked = autoReplyEnabled, onCheckedChange = { autoReplyEnabled = it })
                        }

                        if (autoReplyEnabled) {
                            Text("Dispatch Delay:", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf(0 to "Immediate", 1 to "1 min", 5 to "5 min", 15 to "15 min").forEach { (min, label) ->
                                    Button(
                                        onClick = { delayMinutes = min },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (delayMinutes == min) PrimaryGreen else MaterialTheme.colorScheme.surfaceVariant
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(label, fontSize = 11.sp, color = if (delayMinutes == min) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.onSurface)
                                    }
                                }
                            }
                        }
                    }

                    // STEP 7: DONE
                    7 -> {
                        WizardHeader(
                            icon = Icons.Default.RocketLaunch,
                            title = "Setup Complete!",
                            subtitle = "MissCall WhatsApp Assistant is ready to handle your missed calls."
                        )
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = PrimaryGreen.copy(alpha = 0.1f))
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Summary Configuration:", fontWeight = FontWeight.Bold, color = PrimaryGreen)
                                Text("• Business: $businessName", style = MaterialTheme.typography.bodySmall)
                                Text("• WhatsApp Mode: ${selectedMode.name}", style = MaterialTheme.typography.bodySmall)
                                Text("• Auto-Reply: ${if (autoReplyEnabled) "ON (${delayMinutes}m delay)" else "OFF (Manual approval)"}", style = MaterialTheme.typography.bodySmall)
                                Text("• Permissions: Granted & Local-First", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (step < 7) {
                Button(
                    onClick = { step++ },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Next")
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                }
            } else {
                Button(
                    onClick = {
                        onCompleteSetup(
                            businessName,
                            category,
                            phone,
                            selectedMode,
                            autoReplyEnabled,
                            delayMinutes,
                            maxFollowUps
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGreen)
                ) {
                    Icon(Icons.Default.RocketLaunch, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Launch Assistant")
                }
            }
        },
        dismissButton = {
            if (step > 1) {
                TextButton(onClick = { step-- }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Back")
                }
            } else {
                TextButton(onClick = onDismiss) {
                    Text("Skip")
                }
            }
        }
    )
}

@Composable
private fun WizardHeader(icon: ImageVector, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(PrimaryGreen.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = PrimaryGreen, modifier = Modifier.size(22.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(text = title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
