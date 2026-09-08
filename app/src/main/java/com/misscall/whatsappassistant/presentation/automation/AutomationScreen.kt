package com.misscall.whatsappassistant.presentation.automation

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.HourglassBottom
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerState
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
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
import com.misscall.whatsappassistant.presentation.theme.AccentGreen
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutomationScreen(
    viewModel: AutomationViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val prefs = uiState.preferences

    var showSimulatorDialog by remember { mutableStateOf(false) }
    var showStartTimePicker by remember { mutableStateOf(false) }
    var showEndTimePicker by remember { mutableStateOf(false) }

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
                        "Automation Rules",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen,
                    titleContentColor = Color.White
                )
            )
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
            // Main Master Switch Card
            item {
                ElevatedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.elevatedCardColors(
                        containerColor = if (prefs.isAutoReplyEnabled) AccentGreen.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Speed,
                                contentDescription = null,
                                tint = if (prefs.isAutoReplyEnabled) PrimaryGreen else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Automatic Follow-up",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Text(
                                    text = "Automatically dispatch WhatsApp response on missed calls.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Switch(
                            checked = prefs.isAutoReplyEnabled,
                            onCheckedChange = { viewModel.toggleAutoReply(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = AccentGreen
                            )
                        )
                    }
                }
            }

            // Auto-Reply Delay Slider Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Alarm, contentDescription = null, tint = PrimaryGreen)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Dispatch Delay Timer",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                                )
                            }
                            Text(
                                text = if (prefs.autoReplyDelayMinutes == 0) "Immediate (0m)" else "${prefs.autoReplyDelayMinutes} minutes",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryGreen
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Gives the customer time to call back before receiving a follow-up.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Slider(
                            value = prefs.autoReplyDelayMinutes.toFloat(),
                            onValueChange = { viewModel.setAutoReplyDelay(it.toInt()) },
                            valueRange = 0f..15f,
                            steps = 14,
                            colors = SliderDefaults.colors(
                                thumbColor = PrimaryGreen,
                                activeTrackColor = AccentGreen
                            )
                        )
                    }
                }
            }

            // Caller Cooldown Period Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.HourglassBottom, contentDescription = null, tint = PrimaryGreen)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Caller Cooldown Period",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                                )
                            }
                            val hours = prefs.cooldownMinutes / 60
                            val mins = prefs.cooldownMinutes % 60
                            val text = if (hours > 0 && mins > 0) "${hours}h ${mins}m" else if (hours > 0) "${hours} hours" else "$mins mins"
                            Text(
                                text = text,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryGreen
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Avoids spamming the same caller if they call multiple times in succession.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Slider(
                            value = (prefs.cooldownMinutes / 15).toFloat(),
                            onValueChange = { viewModel.setCooldownMinutes(it.toInt() * 15) },
                            valueRange = 1f..48f, // 15 min to 12 hours
                            steps = 47,
                            colors = SliderDefaults.colors(
                                thumbColor = PrimaryGreen,
                                activeTrackColor = AccentGreen
                            )
                        )
                    }
                }
            }

            // Working Hours Schedule Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Schedule, contentDescription = null, tint = PrimaryGreen)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Operating Business Hours",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                                )
                            }
                            Switch(
                                checked = prefs.workingHoursEnabled,
                                onCheckedChange = {
                                    viewModel.updateWorkingHours(
                                        enabled = it,
                                        startHour = prefs.workingHoursStartHour,
                                        startMinute = prefs.workingHoursStartMinute,
                                        endHour = prefs.workingHoursEndHour,
                                        endMinute = prefs.workingHoursEndMinute
                                    )
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = AccentGreen
                                )
                            )
                        }

                        if (prefs.workingHoursEnabled) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { showStartTimePicker = true },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp)) {
                                        Text("Starts", style = MaterialTheme.typography.labelSmall)
                                        Text(
                                            DateTimeUtils.formatHourMinute24(prefs.workingHoursStartHour, prefs.workingHoursStartMinute),
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                        )
                                    }
                                }

                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { showEndTimePicker = true },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp)) {
                                        Text("Ends", style = MaterialTheme.typography.labelSmall)
                                        Text(
                                            DateTimeUtils.formatHourMinute24(prefs.workingHoursEndHour, prefs.workingHoursEndMinute),
                                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Interactive Simulator Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PrimaryGreen.copy(alpha = 0.08f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, tint = PrimaryGreen)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Simulate Inbound Missed Call",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Test the complete rule engine, message placeholder generator, and notification flow without needing a real SIM call.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { showSimulatorDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Launch Call Simulator")
                        }
                    }
                }
            }
        }
    }

    // Call Simulator Modal
    if (showSimulatorDialog) {
        var testNumber by remember { mutableStateOf("+919876543210") }
        var testName by remember { mutableStateOf("John Doe") }

        AlertDialog(
            onDismissRequest = {
                if (!uiState.isSimulating) {
                    showSimulatorDialog = false
                    viewModel.clearSimulationResult()
                }
            },
            title = { Text("Simulate Inbound Missed Call") },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    if (uiState.simulationResult != null) {
                        Text(
                            text = uiState.simulationResult!!,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    } else {
                        Text("Enter a test caller number and name to trigger the engine:")
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = testNumber,
                            onValueChange = { testNumber = it },
                            label = { Text("Phone Number") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = testName,
                            onValueChange = { testName = it },
                            label = { Text("Caller Name") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }
            },
            confirmButton = {
                if (uiState.simulationResult == null) {
                    Button(
                        onClick = {
                            if (testNumber.isNotBlank()) {
                                viewModel.simulateMissedCall(testNumber, testName)
                            }
                        },
                        enabled = !uiState.isSimulating,
                        colors = ButtonDefaults.buttonColors(containerColor = AccentGreen)
                    ) {
                        if (uiState.isSimulating) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White)
                        } else {
                            Text("Simulate Missed Call")
                        }
                    }
                } else {
                    Button(
                        onClick = {
                            showSimulatorDialog = false
                            viewModel.clearSimulationResult()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                    ) {
                        Text("Done")
                    }
                }
            },
            dismissButton = {
                if (uiState.simulationResult == null) {
                    TextButton(
                        onClick = {
                            showSimulatorDialog = false
                            viewModel.clearSimulationResult()
                        }
                    ) {
                        Text("Cancel")
                    }
                }
            }
        )
    }

    // Time Pickers
    if (showStartTimePicker) {
        var startH by remember { mutableIntStateOf(prefs.workingHoursStartHour) }
        var startM by remember { mutableIntStateOf(prefs.workingHoursStartMinute) }
        AlertDialog(
            onDismissRequest = { showStartTimePicker = false },
            title = { Text("Select Start Time") },
            text = {
                Column {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = startH.toString(),
                            onValueChange = { startH = it.toIntOrNull()?.coerceIn(0, 23) ?: 0 },
                            label = { Text("Hour (0-23)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = startM.toString(),
                            onValueChange = { startM = it.toIntOrNull()?.coerceIn(0, 59) ?: 0 },
                            label = { Text("Minute (0-59)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateWorkingHours(
                            enabled = prefs.workingHoursEnabled,
                            startHour = startH,
                            startMinute = startM,
                            endHour = prefs.workingHoursEndHour,
                            endMinute = prefs.workingHoursEndMinute
                        )
                        showStartTimePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStartTimePicker = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showEndTimePicker) {
        var endH by remember { mutableIntStateOf(prefs.workingHoursEndHour) }
        var endM by remember { mutableIntStateOf(prefs.workingHoursEndMinute) }
        AlertDialog(
            onDismissRequest = { showEndTimePicker = false },
            title = { Text("Select End Time") },
            text = {
                Column {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = endH.toString(),
                            onValueChange = { endH = it.toIntOrNull()?.coerceIn(0, 23) ?: 0 },
                            label = { Text("Hour (0-23)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = endM.toString(),
                            onValueChange = { endM = it.toIntOrNull()?.coerceIn(0, 59) ?: 0 },
                            label = { Text("Minute (0-59)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateWorkingHours(
                            enabled = prefs.workingHoursEnabled,
                            startHour = prefs.workingHoursStartHour,
                            startMinute = prefs.workingHoursStartMinute,
                            endHour = endH,
                            endMinute = endM
                        )
                        showEndTimePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEndTimePicker = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
