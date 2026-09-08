package com.misscall.whatsappassistant.presentation.customers

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.misscall.whatsappassistant.core.util.DateTimeUtils
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.presentation.theme.PrimaryGreen
import com.misscall.whatsappassistant.presentation.theme.StatusActive
import com.misscall.whatsappassistant.presentation.theme.StatusNewLead
import com.misscall.whatsappassistant.presentation.theme.StatusVip
import com.misscall.whatsappassistant.presentation.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(
    onNavigateToCustomerDetail: (Long) -> Unit,
    viewModel: CustomersViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customers") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::setSearchQuery,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search by name or phone") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                singleLine = true
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.activeFilter == CustomerFilter.ALL,
                    onClick = { viewModel.setFilter(CustomerFilter.ALL) },
                    label = { Text("All (${uiState.totalCount})") }
                )
                FilterChip(
                    selected = uiState.activeFilter == CustomerFilter.NEW,
                    onClick = { viewModel.setFilter(CustomerFilter.NEW) },
                    label = { Text("New (${uiState.newCount})") }
                )
                FilterChip(
                    selected = uiState.activeFilter == CustomerFilter.ACTIVE,
                    onClick = { viewModel.setFilter(CustomerFilter.ACTIVE) },
                    label = { Text("Active (${uiState.activeCount})") }
                )
                FilterChip(
                    selected = uiState.activeFilter == CustomerFilter.VIP,
                    onClick = { viewModel.setFilter(CustomerFilter.VIP) },
                    label = { Text("VIP (${uiState.vipCount})") }
                )
            }

            if (uiState.customers.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No customers yet. When you miss a call, customers will appear here automatically.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = TextSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(32.dp)
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.customers, key = { it.id }) { customer ->
                        CustomerCard(
                            customer = customer,
                            onClick = { onNavigateToCustomerDetail(customer.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CustomerCard(customer: Customer, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(48.dp),
                shape = CircleShape,
                color = PrimaryGreen.copy(alpha = 0.2f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    val initial = customer.name?.firstOrNull()?.toString()?.uppercase() ?: "#"
                    Text(
                        text = initial,
                        style = MaterialTheme.typography.titleLarge,
                        color = PrimaryGreen,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = customer.name?.ifBlank { customer.phoneNumber } ?: customer.phoneNumber,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = customer.phoneNumber,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(4.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
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
                            style = MaterialTheme.typography.labelSmall,
                            color = statusColor,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))
                    
                    val dateStr = DateTimeUtils.formatRelative(customer.lastCallTimestamp)
                    Text(
                        text = "${customer.totalMissedCalls} calls · Last: $dateStr",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = TextSecondary
            )
        }
    }
}
