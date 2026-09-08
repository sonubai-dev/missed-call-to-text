package com.misscall.whatsappassistant.presentation.customers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.domain.model.Customer
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

private fun CustomerEntity.toModel(): Customer = Customer(
    id = id,
    phoneNumber = phoneNumber,
    name = name,
    company = company,
    notes = notes,
    isVip = isVip,
    isBlacklisted = isBlacklisted,
    isWhitelisted = isWhitelisted,
    totalMissedCalls = totalMissedCalls,
    lastCallTimestamp = lastCallTimestamp,
    createdAt = createdAt,
    updatedAt = updatedAt
)

@HiltViewModel
class CustomersViewModel @Inject constructor(
    private val customerDao: CustomerDao
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _activeFilter = MutableStateFlow(CustomerFilter.ALL)

    val uiState: StateFlow<CustomersUiState> = combine(
        customerDao.getAllCustomersFlow(),
        _searchQuery,
        _activeFilter
    ) { customerEntities: List<CustomerEntity>, query: String, filter: CustomerFilter ->
        val allCustomers = customerEntities.map { it.toModel() }
        
        val newCount = allCustomers.count { it.totalMissedCalls == 1 }
        val activeCount = allCustomers.count { it.totalMissedCalls >= 2 && !it.isVip }
        val vipCount = allCustomers.count { it.isVip }
        val totalCount = allCustomers.size
        
        val filteredCustomers = allCustomers.filter { customer ->
            val matchesFilter = when (filter) {
                CustomerFilter.ALL -> true
                CustomerFilter.NEW -> customer.totalMissedCalls == 1
                CustomerFilter.ACTIVE -> customer.totalMissedCalls >= 2 && !customer.isVip
                CustomerFilter.VIP -> customer.isVip
            }
            
            val matchesSearch = if (query.isBlank()) {
                true
            } else {
                (customer.name?.contains(query, ignoreCase = true) == true) ||
                customer.phoneNumber.contains(query, ignoreCase = true)
            }
            
            matchesFilter && matchesSearch
        }

        CustomersUiState(
            isLoading = false,
            customers = filteredCustomers,
            searchQuery = query,
            activeFilter = filter,
            totalCount = totalCount,
            newCount = newCount,
            activeCount = activeCount,
            vipCount = vipCount
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = CustomersUiState(isLoading = true)
    )

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setFilter(filter: CustomerFilter) {
        _activeFilter.value = filter
    }
}
