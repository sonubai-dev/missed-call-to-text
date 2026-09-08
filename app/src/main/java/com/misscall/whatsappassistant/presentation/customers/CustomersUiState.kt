package com.misscall.whatsappassistant.presentation.customers

import com.misscall.whatsappassistant.domain.model.Customer

enum class CustomerFilter { ALL, NEW, ACTIVE, VIP }

data class CustomersUiState(
    val isLoading: Boolean = false,
    val customers: List<Customer> = emptyList(),
    val searchQuery: String = "",
    val activeFilter: CustomerFilter = CustomerFilter.ALL,
    val totalCount: Int = 0,
    val newCount: Int = 0,
    val activeCount: Int = 0,
    val vipCount: Int = 0
)
