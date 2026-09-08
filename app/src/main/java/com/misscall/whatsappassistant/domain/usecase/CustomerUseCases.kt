package com.misscall.whatsappassistant.domain.usecase

import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetCustomersUseCase @Inject constructor(
    private val customerRepository: CustomerRepository
) {
    fun getAll(): Flow<List<Customer>> = customerRepository.getAllCustomersFlow()
    fun getVip(): Flow<List<Customer>> = customerRepository.getVipCustomersFlow()
    fun getBlacklisted(): Flow<List<Customer>> = customerRepository.getBlacklistedCustomersFlow()
    fun search(query: String): Flow<List<Customer>> = customerRepository.searchCustomersFlow(query)
}

class ManageCustomerUseCase @Inject constructor(
    private val customerRepository: CustomerRepository
) {
    suspend fun toggleVip(id: Long, currentVip: Boolean) {
        customerRepository.updateVipStatus(id, !currentVip)
    }

    suspend fun toggleBlacklist(id: Long, currentBlacklisted: Boolean) {
        customerRepository.updateBlacklistStatus(id, !currentBlacklisted)
    }

    suspend fun toggleWhitelist(id: Long, currentWhitelisted: Boolean) {
        customerRepository.updateWhitelistStatus(id, !currentWhitelisted)
    }

    suspend fun updateNotes(id: Long, notes: String) {
        customerRepository.updateNotes(id, notes)
    }

    suspend fun upsert(customer: Customer): Long {
        return customerRepository.upsertCustomer(customer)
    }

    suspend fun delete(id: Long) {
        customerRepository.deleteCustomer(id)
    }
}
