package com.misscall.whatsappassistant.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    // Bottom nav screens (4 tabs)
    data object Home : Screen("home", "Home", Icons.Default.Home)
    data object Customers : Screen("customers", "Customers", Icons.Default.People)
    data object FollowUps : Screen("followups", "Follow-ups", Icons.Default.Notifications)
    data object Settings : Screen("settings", "Settings", Icons.Default.Settings)

    // Detail / nested screens (no bottom nav)
    data object CustomerDetail : Screen("customer_detail/{customerId}", "Customer", Icons.Default.People) {
        fun createRoute(customerId: Long) = "customer_detail/$customerId"
    }
    data object Onboarding : Screen("onboarding", "Setup", Icons.Default.Home)
    data object SmsHistory : Screen("sms_history", "SMS History", Icons.Default.Notifications)

    // Advanced screens accessible from Settings → Advanced
    data object Rules : Screen("rules", "Rules", Icons.Default.Settings)
    data object Activity : Screen("activity", "Activity", Icons.Default.Settings)

    companion object {
        val bottomNavItems = listOf(
            Home,
            Customers,
            FollowUps,
            Settings
        )
    }
}
