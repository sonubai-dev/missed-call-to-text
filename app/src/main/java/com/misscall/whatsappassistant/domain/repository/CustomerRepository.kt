package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.Customer
import kotlinx.coroutines.flow.Flow

interface CustomerRepository {
    fun getAllCustomersFlow(): Flow<List<Customer>>
    fun getVipCustomersFlow(): Flow<List<Customer>>
    fun getBlacklistedCustomersFlow(): Flow<List<Customer>>
    fun searchCustomersFlow(query: String): Flow<List<Customer>>
    suspend fun getCustomerByPhoneNumber(phoneNumber: String): Customer?
    suspend fun getCustomerById(id: Long): Customer?
    suspend fun upsertCustomer(customer: Customer): Long
    suspend fun updateVipStatus(id: Long, isVip: Boolean)
    suspend fun updateBlacklistStatus(id: Long, isBlacklisted: Boolean)
    suspend fun updateWhitelistStatus(id: Long, isWhitelisted: Boolean)
    suspend fun updateNotes(id: Long, notes: String)
    suspend fun deleteCustomer(id: Long)
    fun getTotalCustomerCountFlow(): Flow<Int>
    suspend fun onMissedCallFrom(phoneNumber: String, callerName: String?, callEventId: String? = null): Customer
}
