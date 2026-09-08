package com.misscall.whatsappassistant.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.domain.generator.LocalMessageGenerator
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.MessageGenerationRequest
import com.misscall.whatsappassistant.domain.model.MessageLanguage
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.MessageTone
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusFailed
import com.misscall.whatsappassistant.presentation.theme.StatusIgnored
import com.misscall.whatsappassistant.presentation.theme.StatusPending
import com.misscall.whatsappassistant.presentation.theme.StatusSent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
fun StatusBadge(
    status: Any,
    modifier: Modifier = Modifier
) {
    val (color, text, icon) = when (status) {
        is CallStatus -> when (status) {
            CallStatus.MISSED -> Triple(StatusFailed, "Missed", Icons.Default.Warning)
            CallStatus.ANSWERED -> Triple(StatusSent, "Answered", Icons.Default.Check)
            CallStatus.RINGING -> Triple(StatusPending, "Ringing", Icons.Default.HourglassEmpty)
            CallStatus.REJECTED -> Triple(StatusIgnored, "Rejected", Icons.Default.Close)
            CallStatus.UNKNOWN -> Triple(StatusIgnored, "Unknown", Icons.Default.Info)
        }
        is WhatsAppFollowUpStatus -> when (status) {
            WhatsAppFollowUpStatus.PENDING -> Triple(StatusPending, "Pending", Icons.Default.HourglassEmpty)
            WhatsAppFollowUpStatus.SCHEDULED -> Triple(PrimaryGreen, "Scheduled", Icons.Default.Schedule)
            WhatsAppFollowUpStatus.SENT -> Triple(StatusSent, "Sent", Icons.Default.CheckCircle)
            WhatsAppFollowUpStatus.FAILED -> Triple(StatusFailed, "Failed", Icons.Default.Clear)
            WhatsAppFollowUpStatus.IGNORED -> Triple(StatusIgnored, "Ignored", Icons.Default.Close)
            WhatsAppFollowUpStatus.SKIPPED -> Triple(StatusIgnored, "Skipped", Icons.Default.Info)
        }
        else -> Triple(StatusIgnored, status.toString(), Icons.Default.Info)
    }

    Surface(
        color = color.copy(alpha = 0.12f),
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = text,
                color = color,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
            )
        }
    }
}

@Composable
fun VipBadge(modifier: Modifier = Modifier) {
    Surface(
        color = com.misscall.whatsappassistant.presentation.theme.StatusVip.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = com.misscall.whatsappassistant.presentation.theme.StatusVip,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "VIP",
                color = com.misscall.whatsappassistant.presentation.theme.StatusVip,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
            )
        }
    }
}

@Composable
fun SectionHeader(
    title: String,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
        )
        if (actionText != null && onActionClick != null) {
            Text(
                text = actionText,
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                color = PrimaryGreen,
                modifier = Modifier.clickable { onActionClick() }
            )
        }
    }
}

@Composable
fun PermissionWarningBanner(
    missingPermissions: List<String>,
    onGrantClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (missingPermissions.isEmpty()) return

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = StatusPending.copy(alpha = 0.12f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = StatusPending,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Telephony Permissions Required",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Allow Call Log access so the app can detect missed calls automatically.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onGrantClick,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Grant", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

@Composable
fun EmptyStateView(
    icon: ImageVector,
    title: String,
    message: String,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(36.dp)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        if (actionText != null && onActionClick != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onActionClick,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text(actionText)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PlaceholderTagsRow(
    onTagSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(
            text = "Insert Dynamic Tag:",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(4.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            TemplateParser.AVAILABLE_TAGS.forEach { tag ->
                SuggestionChip(
                    onClick = { onTagSelected(tag) },
                    label = { Text(tag, fontSize = 12.sp) }
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun QuickFollowUpDialog(
    phoneNumber: String,
    callerName: String?,
    initialMessage: String,
    templates: List<MessageTemplate>,
    businessName: String = "My Business",
    onDismiss: () -> Unit,
    onSend: (message: String, templateId: Long?) -> Unit
) {
    var selectedTemplate by remember {
        mutableStateOf(templates.firstOrNull { it.isDefault } ?: templates.firstOrNull())
    }
    var messageText by remember { mutableStateOf(initialMessage) }
    var currentTone by remember { mutableStateOf(MessageTone.FRIENDLY) }
    var currentLanguage by remember { mutableStateOf(MessageLanguage.ENGLISH) }

    val localGenerator = remember { LocalMessageGenerator() }

    val triggerGeneration = { tone: MessageTone, lang: MessageLanguage ->
        currentTone = tone
        currentLanguage = lang
        CoroutineScope(Dispatchers.Main).launch {
            val req = MessageGenerationRequest(
                businessName = businessName,
                customerPhone = phoneNumber,
                customerName = callerName,
                missedCallTime = "a moment ago",
                tone = tone,
                language = lang
            )
            val res = localGenerator.generate(req)
            messageText = res.content
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = PrimaryGreen)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "WhatsApp Follow-up",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "To: ${callerName ?: "Customer"} ($phoneNumber)",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                    color = PrimaryGreen
                )

                Spacer(modifier = Modifier.height(10.dp))

                // AI / Smart Suggestions Header
                Text(
                    text = "Smart Variations:",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    SuggestionChip(
                        onClick = { triggerGeneration(MessageTone.FRIENDLY, MessageLanguage.ENGLISH) },
                        label = { Text("Regenerate", fontSize = 11.sp) },
                        icon = { Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(12.dp)) }
                    )
                    SuggestionChip(
                        onClick = { triggerGeneration(MessageTone.SHORT, currentLanguage) },
                        label = { Text("Shorter", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = { triggerGeneration(MessageTone.PROFESSIONAL, currentLanguage) },
                        label = { Text("More Professional", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = { triggerGeneration(currentTone, MessageLanguage.HINDI) },
                        label = { Text("Hindi", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = { triggerGeneration(currentTone, MessageLanguage.HINGLISH) },
                        label = { Text("Hinglish", fontSize = 11.sp) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (templates.isNotEmpty()) {
                    Text(
                        text = "Or Choose Template:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        templates.forEach { tmpl ->
                            FilterChip(
                                selected = selectedTemplate?.id == tmpl.id,
                                onClick = {
                                    selectedTemplate = tmpl
                                    messageText = tmpl.content
                                },
                                label = { Text(tmpl.name, fontSize = 11.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                OutlinedTextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    label = { Text("Message Preview & Editor") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 6
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSend(messageText, selectedTemplate?.id) },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Send on WhatsApp")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
