package com.misscall.whatsappassistant.presentation.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.misscall.whatsappassistant.presentation.activity.ActivityLogScreen
import com.misscall.whatsappassistant.presentation.customers.CustomerDetailScreen
import com.misscall.whatsappassistant.presentation.customers.CustomersScreen
import com.misscall.whatsappassistant.presentation.dashboard.DashboardScreen
import com.misscall.whatsappassistant.presentation.followups.FollowUpsScreen
import com.misscall.whatsappassistant.presentation.onboarding.OnboardingScreen
import com.misscall.whatsappassistant.presentation.rules.RulesScreen
import com.misscall.whatsappassistant.presentation.settings.SettingsScreen
import com.misscall.whatsappassistant.presentation.sms.SmsHistoryScreen

@Composable
fun AppNavHost(
    hasCompletedOnboarding: Boolean = true,
    initialCustomerId: Long = 0L,
    navController: NavHostController = rememberNavController()
) {
    androidx.compose.runtime.LaunchedEffect(initialCustomerId) {
        if (initialCustomerId > 0L) {
            navController.navigate(Screen.CustomerDetail.createRoute(initialCustomerId)) {
                launchSingleTop = true
            }
        }
    }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Hide bottom bar on onboarding, customer detail, and nested screens
    val showBottomBar = currentRoute in Screen.bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = showBottomBar,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it })
            ) {
                BottomNavBar(navController = navController)
            }
        }
    ) { innerPadding ->
        val startDestination = Screen.Splash.route

        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Splash.route) {
                com.misscall.whatsappassistant.presentation.auth.SplashScreen(
                    onNavigateToLogin = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToPaywall = {
                        navController.navigate(Screen.Paywall.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    },
                    onNavigateToHome = {
                        val dest = if (hasCompletedOnboarding) Screen.Home.route else Screen.Onboarding.route
                        navController.navigate(dest) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }
            
            composable(Screen.Login.route) {
                com.misscall.whatsappassistant.presentation.auth.LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Splash.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = {
                        navController.navigate(Screen.Register.route)
                    }
                )
            }
            
            composable(Screen.Register.route) {
                com.misscall.whatsappassistant.presentation.auth.RegisterScreen(
                    onRegisterSuccess = {
                        navController.navigate(Screen.Splash.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    },
                    onNavigateToLogin = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                )
            }
            
            composable(Screen.Paywall.route) {
                com.misscall.whatsappassistant.presentation.auth.PaywallScreen(
                    onSubscribed = {
                        navController.navigate(Screen.Splash.route) {
                            popUpTo(Screen.Paywall.route) { inclusive = true }
                        }
                    }
                )
            }

            // ── Onboarding ──
            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onOnboardingComplete = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            // ── Tab 1: Home ──
            composable(Screen.Home.route) {
                DashboardScreen(
                    onNavigateToCustomerDetail = { customerId ->
                        navController.navigate(Screen.CustomerDetail.createRoute(customerId))
                    },
                    onNavigateToFollowUps = {
                        navController.navigate(Screen.FollowUps.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onNavigateToCustomers = {
                        navController.navigate(Screen.Customers.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            // ── Tab 2: Customers ──
            composable(Screen.Customers.route) {
                CustomersScreen(
                    onNavigateToCustomerDetail = { customerId ->
                        navController.navigate(Screen.CustomerDetail.createRoute(customerId))
                    }
                )
            }

            // ── Tab 3: Follow-ups ──
            composable(Screen.FollowUps.route) {
                FollowUpsScreen(
                    onNavigateToCustomerDetail = { customerId ->
                        navController.navigate(Screen.CustomerDetail.createRoute(customerId))
                    }
                )
            }

            // ── Tab 4: Settings ──
            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateToSmsHistory = { navController.navigate(Screen.SmsHistory.route) },
                    onNavigateToRules = { navController.navigate(Screen.Rules.route) },
                    onNavigateToActivity = { navController.navigate(Screen.Activity.route) }
                )
            }

            // ── Detail / Nested Screens ──
            composable(
                route = Screen.CustomerDetail.route,
                arguments = listOf(navArgument("customerId") { type = NavType.LongType })
            ) {
                CustomerDetailScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.SmsHistory.route) {
                SmsHistoryScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Rules.route) {
                RulesScreen()
            }

            composable(Screen.Activity.route) {
                ActivityLogScreen()
            }
        }
    }
}
