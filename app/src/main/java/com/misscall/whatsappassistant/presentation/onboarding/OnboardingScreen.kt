package com.misscall.whatsappassistant.presentation.onboarding

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import com.misscall.whatsappassistant.presentation.settings.SettingsViewModel
import com.misscall.whatsappassistant.presentation.theme.*
import com.misscall.whatsappassistant.whatsapp.provider.WhatsAppSendingMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScreen(
    onOnboardingComplete: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    var currentStep by remember { mutableIntStateOf(1) }
    
    var businessName by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Service") }

    var whatsappMode by remember { mutableStateOf(WhatsAppSendingMode.MANUAL) }
    var smsEnabled by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(5) { index ->
                            val step = index + 1
                            Box(
                                modifier = Modifier
                                    .padding(horizontal = 4.dp)
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (step <= currentStep) PrimaryGreen else Color(0xFFE0E0E0))
                            )
                        }
                    }
                },
                navigationIcon = {
                    if (currentStep > 1) {
                        IconButton(onClick = { currentStep-- }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                }
            )
        }
    ) { padding ->
        AnimatedContent(
            targetState = currentStep,
            transitionSpec = {
                if (targetState > initialState) {
                    slideInHorizontally(animationSpec = tween(300)) { it } + fadeIn() togetherWith
                            slideOutHorizontally(animationSpec = tween(300)) { -it } + fadeOut()
                } else {
                    slideInHorizontally(animationSpec = tween(300)) { -it } + fadeIn() togetherWith
                            slideOutHorizontally(animationSpec = tween(300)) { it } + fadeOut()
                }
            },
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            label = "onboarding_step"
        ) { step ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                when (step) {
                    1 -> Step1BusinessInfo(
                        businessName = businessName,
                        onNameChange = { businessName = it },
                        category = category,
                        onCategoryChange = { category = it },
                        onNext = { currentStep++ }
                    )
                    2 -> Step2Permissions(
                        onNext = { currentStep++ }
                    )
                    3 -> Step3WhatsApp(
                        selectedMode = whatsappMode,
                        onModeSelect = { whatsappMode = it },
                        onNext = { currentStep++ }
                    )
                    4 -> Step4Sms(
                        smsEnabled = smsEnabled,
                        onToggle = { smsEnabled = it },
                        onNext = { currentStep++ }
                    )
                    5 -> Step5Summary(
                        businessName = businessName,
                        whatsappMode = whatsappMode,
                        smsEnabled = smsEnabled,
                        onComplete = {
                            viewModel.completeSetupWizard(
                                businessName = businessName,
                                category = category,
                                phone = "",
                                mode = whatsappMode,
                                autoReply = true,
                                delayMinutes = 5,
                                maxFollowUps = 3
                            )
                            viewModel.setAutomaticSmsEnabled(smsEnabled)
                            onOnboardingComplete()
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Step1BusinessInfo(
    businessName: String,
    onNameChange: (String) -> Unit,
    category: String,
    onCategoryChange: (String) -> Unit,
    onNext: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val categories = listOf("Restaurant", "Salon", "Clinic", "Shop", "Service", "Other")

    Text(
        text = "What's your business name?",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(bottom = 32.dp)
    )

    OutlinedTextField(
        value = businessName,
        onValueChange = onNameChange,
        label = { Text("Business Name") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )

    Spacer(modifier = Modifier.height(16.dp))

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded }
    ) {
        OutlinedTextField(
            value = category,
            onValueChange = {},
            readOnly = true,
            label = { Text("Business Category") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            categories.forEach { cat ->
                DropdownMenuItem(
                    text = { Text(cat) },
                    onClick = {
                        onCategoryChange(cat)
                        expanded = false
                    }
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(32.dp))

    Button(
        onClick = onNext,
        enabled = businessName.isNotBlank(),
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(top = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
    ) {
        Text("Next", fontSize = 16.sp)
    }
}

@Composable
private fun Step2Permissions(onNext: () -> Unit) {
    val context = LocalContext.current
    
    var hasPhonePerms by remember { 
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED
        )
    }
    var hasNotifPerms by remember { 
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            } else true
        )
    }

    val phoneLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { perms ->
        hasPhonePerms = perms.values.all { it }
    }

    val notifLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasNotifPerms = granted
    }

    Text(
        text = "Let's set up permissions",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(bottom = 32.dp)
    )

    PermissionCard(
        title = "Phone Calls",
        description = "We need this to detect when you miss a call",
        isGranted = hasPhonePerms,
        onRequest = {
            phoneLauncher.launch(
                arrayOf(Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_PHONE_STATE)
            )
        }
    )

    Spacer(modifier = Modifier.height(16.dp))

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        PermissionCard(
            title = "Notifications",
            description = "So we can alert you about missed calls",
            isGranted = hasNotifPerms,
            onRequest = {
                notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        )
    }

    Spacer(modifier = Modifier.height(32.dp))

    Button(
        onClick = onNext,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(top = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
    ) {
        Text("Next", fontSize = 16.sp)
    }
}

@Composable
private fun PermissionCard(
    title: String,
    description: String,
    isGranted: Boolean,
    onRequest: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text(description, color = TextSecondary, fontSize = 14.sp)
            }
            if (isGranted) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = "Granted",
                    tint = AccentGreen,
                    modifier = Modifier.size(32.dp)
                )
            } else {
                Button(onClick = onRequest) {
                    Text("Allow")
                }
            }
        }
    }
}

@Composable
private fun Step3WhatsApp(
    selectedMode: WhatsAppSendingMode,
    onModeSelect: (WhatsAppSendingMode) -> Unit,
    onNext: () -> Unit
) {
    Text(
        text = "How do you want to send WhatsApp?",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(bottom = 32.dp)
    )

    ModeCard(
        title = "Direct Message (Recommended)",
        description = "Opens WhatsApp with pre-filled message. You tap Send.",
        isSelected = selectedMode == WhatsAppSendingMode.MANUAL,
        onClick = { onModeSelect(WhatsAppSendingMode.MANUAL) }
    )

    Spacer(modifier = Modifier.height(16.dp))

    ModeCard(
        title = "WhatsApp Web",
        description = "Connect via QR code for web-based sending.",
        isSelected = selectedMode == WhatsAppSendingMode.WHATSAPP_WEB,
        onClick = { onModeSelect(WhatsAppSendingMode.WHATSAPP_WEB) }
    )

    Spacer(modifier = Modifier.height(16.dp))

    ModeCard(
        title = "Business API",
        description = "For businesses with Meta Business account. Sends automatically.",
        isSelected = selectedMode == WhatsAppSendingMode.CLOUD_API,
        onClick = { onModeSelect(WhatsAppSendingMode.CLOUD_API) }
    )

    Spacer(modifier = Modifier.height(32.dp))

    Button(
        onClick = onNext,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(top = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
    ) {
        Text("Next", fontSize = 16.sp)
    }
}

@Composable
private fun ModeCard(
    title: String,
    description: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Color(0xFFE8F5E9) else MaterialTheme.colorScheme.surfaceVariant
        ),
        border = if (isSelected) BorderStroke(2.dp, AccentGreen) else null
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                colors = RadioButtonDefaults.colors(selectedColor = AccentGreen)
            )
            Column(modifier = Modifier.padding(start = 8.dp)) {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(description, color = TextSecondary, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun Step4Sms(
    smsEnabled: Boolean,
    onToggle: (Boolean) -> Unit,
    onNext: () -> Unit
) {
    val context = LocalContext.current
    val smsLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) onToggle(true)
        else onToggle(false)
    }

    Text(
        text = "Enable SMS replies?",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(bottom = 32.dp)
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Send SMS when you miss a call", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("SMS uses your phone SIM. Standard messaging rates apply.", color = TextSecondary, fontSize = 14.sp)
            }
            Switch(
                checked = smsEnabled,
                onCheckedChange = { isChecked ->
                    if (isChecked && ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
                        smsLauncher.launch(Manifest.permission.SEND_SMS)
                    } else {
                        onToggle(isChecked)
                    }
                },
                colors = SwitchDefaults.colors(checkedTrackColor = SmsBlue)
            )
        }
    }

    Spacer(modifier = Modifier.height(32.dp))

    Button(
        onClick = onNext,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(top = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
    ) {
        Text("Next", fontSize = 16.sp)
    }
}

@Composable
private fun Step5Summary(
    businessName: String,
    whatsappMode: WhatsAppSendingMode,
    smsEnabled: Boolean,
    onComplete: () -> Unit
) {
    Text(
        text = "You're all set! 🎉",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(bottom = 32.dp)
    )

    Icon(
        Icons.Default.CheckCircle,
        contentDescription = "Success",
        tint = WhatsAppGreen,
        modifier = Modifier
            .size(120.dp)
            .padding(bottom = 32.dp)
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            SummaryRow("Business", businessName)
            SummaryRow("WhatsApp", whatsappMode.name.replace("_", " ").lowercase().replaceFirstChar { it.uppercase() })
            SummaryRow("SMS", if (smsEnabled) "ON" else "OFF")
        }
    }

    Spacer(modifier = Modifier.height(32.dp))

    Button(
        onClick = onComplete,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(top = 24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
    ) {
        Text("Start Using App", fontSize = 16.sp)
    }
}

@Composable
private fun SummaryRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = TextSecondary, fontSize = 16.sp)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
    }
}
