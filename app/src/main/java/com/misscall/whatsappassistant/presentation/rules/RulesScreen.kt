package com.misscall.whatsappassistant.presentation.rules

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.domain.model.CallerCondition
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.TimeWindow
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusSent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RulesScreen(
    viewModel: RulesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    var ruleToEdit by remember { mutableStateOf<DispatchRule?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.userMessage) {
        uiState.userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Rule Engine",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = PrimaryGreen,
                contentColor = MaterialTheme.colorScheme.surface
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Rule")
            }
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
                CircularProgressIndicator(color = PrimaryGreen)
            }
            return@Scaffold
        }

        if (uiState.rules.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No Rules Configured",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "Tap + to create your first multi-channel auto-reply rule.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.rules, key = { it.id }) { rule ->
                    RuleCard(
                        rule = rule,
                        onToggle = { viewModel.toggleRuleActive(rule) },
                        onEdit = { ruleToEdit = rule },
                        onDelete = { viewModel.deleteRule(rule) }
                    )
                }
            }
        }
    }

    if (showCreateDialog || ruleToEdit != null) {
        val initialRule = ruleToEdit ?: DispatchRule(name = "New Rule", priority = 5)
        RuleEditorDialog(
            initialRule = initialRule,
            templates = uiState.templates,
            onSave = { updatedRule ->
                viewModel.saveRule(updatedRule)
                showCreateDialog = false
                ruleToEdit = null
            },
            onDismiss = {
                showCreateDialog = false
                ruleToEdit = null
            }
        )
    }
}

@Composable
private fun RuleCard(
    rule: DispatchRule,
    onToggle: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ChannelBadge(channel = rule.channelType)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = rule.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                Switch(checked = rule.isActive, onCheckedChange = { onToggle() })
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Priority ${rule.priority} • When: ${rule.callerCondition.name.replace("_", " ")}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (rule.timeWindow.enabled) {
                Text(
                    text = "Active Schedule: %02d:%02d - %02d:%02d".format(
                        rule.timeWindow.startHour,
                        rule.timeWindow.startMinute,
                        rule.timeWindow.endHour,
                        rule.timeWindow.endMinute
                    ),
                    style = MaterialTheme.typography.labelSmall,
                    color = PrimaryGreen
                )
            }

            Text(
                text = "Delay: ${rule.delaySeconds}s • Cooldown: ${rule.cooldownMinutes}m",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(18.dp), tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun ChannelBadge(channel: ChannelType) {
    val (color, icon) = when (channel) {
        ChannelType.WHATSAPP -> StatusSent to Icons.AutoMirrored.Filled.Message
        ChannelType.SMS -> Color(0xFF2196F3) to Icons.Default.Sms
        ChannelType.EMAIL -> Color(0xFFFF9800) to Icons.Default.Email
    }

    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(12.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(channel.name, color = color, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RuleEditorDialog(
    initialRule: DispatchRule,
    templates: List<MessageTemplate>,
    onSave: (DispatchRule) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(initialRule.name) }
    var priority by remember { mutableIntStateOf(initialRule.priority) }
    var channelType by remember { mutableStateOf(initialRule.channelType) }
    var callerCondition by remember { mutableStateOf(initialRule.callerCondition) }
    var specificNumbers by remember { mutableStateOf(initialRule.specificNumbers.joinToString(", ")) }
    var timeWindowEnabled by remember { mutableStateOf(initialRule.timeWindow.enabled) }
    var startHour by remember { mutableIntStateOf(initialRule.timeWindow.startHour) }
    var endHour by remember { mutableIntStateOf(initialRule.timeWindow.endHour) }
    var selectedTemplateId by remember { mutableStateOf(initialRule.templateId) }
    var delaySeconds by remember { mutableIntStateOf(initialRule.delaySeconds) }
    var cooldownMinutes by remember { mutableIntStateOf(initialRule.cooldownMinutes) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (initialRule.id == 0L) "Create Auto-Reply Rule" else "Edit Rule", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Rule Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Dispatch Channel:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    ChannelType.values().forEach { ch ->
                        FilterChip(
                            selected = channelType == ch,
                            onClick = { channelType = ch },
                            label = { Text(ch.name) }
                        )
                    }
                }

                Text("Caller Match Condition:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(CallerCondition.ALL_CALLERS, CallerCondition.UNKNOWN_ONLY, CallerCondition.CONTACTS_ONLY).forEach { cond ->
                        FilterChip(
                            selected = callerCondition == cond,
                            onClick = { callerCondition = cond },
                            label = { Text(cond.name.replace("_ONLY", "").replace("_", " ")) }
                        )
                    }
                }

                OutlinedTextField(
                    value = priority.toString(),
                    onValueChange = { priority = it.toIntOrNull() ?: 0 },
                    label = { Text("Rule Priority (Higher runs first)") },
                    modifier = Modifier.fillMaxWidth()
                )

                // Time Window Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Schedule / Working Hours Window", style = MaterialTheme.typography.bodyMedium)
                    Switch(checked = timeWindowEnabled, onCheckedChange = { timeWindowEnabled = it })
                }

                if (timeWindowEnabled) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = startHour.toString(),
                            onValueChange = { startHour = it.toIntOrNull() ?: 9 },
                            label = { Text("Start Hour (0-23)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = endHour.toString(),
                            onValueChange = { endHour = it.toIntOrNull() ?: 18 },
                            label = { Text("End Hour (0-23)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Template Selector
                if (templates.isNotEmpty()) {
                    Text("Select Template:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        templates.filter { it.channelType == channelType || it.channelType == ChannelType.WHATSAPP }.take(3).forEach { tmpl ->
                            FilterChip(
                                selected = selectedTemplateId == tmpl.id,
                                onClick = { selectedTemplateId = tmpl.id },
                                label = { Text(tmpl.name, fontSize = 11.sp) }
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = delaySeconds.toString(),
                    onValueChange = { delaySeconds = it.toIntOrNull() ?: 0 },
                    label = { Text("Delay before sending (Seconds)") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = cooldownMinutes.toString(),
                    onValueChange = { cooldownMinutes = it.toIntOrNull() ?: 120 },
                    label = { Text("Cooldown per recipient (Minutes)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        initialRule.copy(
                            name = name,
                            priority = priority,
                            channelType = channelType,
                            callerCondition = callerCondition,
                            specificNumbers = specificNumbers.split(",").map { it.trim() }.filter { it.isNotBlank() },
                            timeWindow = TimeWindow(
                                enabled = timeWindowEnabled,
                                startHour = startHour,
                                endHour = endHour
                            ),
                            templateId = selectedTemplateId,
                            delaySeconds = delaySeconds,
                            cooldownMinutes = cooldownMinutes
                        )
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text("Save Rule")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
