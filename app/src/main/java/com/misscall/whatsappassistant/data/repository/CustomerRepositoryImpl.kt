package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.crm.CrmSyncManager
import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.CustomerDao
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.domain.model.CrmActivityType
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CustomerRepositoryImpl @Inject constructor(
    private val customerDao: CustomerDao,
    private val crmSyncManager: CrmSyncManager
) : CustomerRepository {

    override fun getAllCustomersFlow(): Flow<List<Customer>> {
        return customerDao.getAllCustomersFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getVipCustomersFlow(): Flow<List<Customer>> {
        return customerDao.getVipCustomersFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getBlacklistedCustomersFlow(): Flow<List<Customer>> {
        return customerDao.getBlacklistedCustomersFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun searchCustomersFlow(query: String): Flow<List<Customer>> {
        return customerDao.searchCustomersFlow(query).map { list -> list.map { it.toDomain() } }
    }

    override suspend fun getCustomerByPhoneNumber(phoneNumber: String): Customer? {
        return customerDao.getCustomerByPhoneNumber(phoneNumber)?.toDomain()
    }

    override suspend fun getCustomerById(id: Long): Customer? {
        return customerDao.getCustomerById(id)?.toDomain()
    }

    override suspend fun upsertCustomer(customer: Customer): Long {
        return customerDao.insertOrUpdateCustomer(customer.toEntity())
    }

    override suspend fun updateVipStatus(id: Long, isVip: Boolean) {
        customerDao.updateVipStatus(id, isVip)
    }

    override suspend fun updateBlacklistStatus(id: Long, isBlacklisted: Boolean) {
        customerDao.updateBlacklistStatus(id, isBlacklisted)
    }

    override suspend fun updateWhitelistStatus(id: Long, isWhitelisted: Boolean) {
        customerDao.updateWhitelistStatus(id, isWhitelisted)
    }

    override suspend fun updateNotes(id: Long, notes: String) {
        customerDao.updateNotes(id, notes)
    }

    override suspend fun deleteCustomer(id: Long) {
        customerDao.deleteCustomer(id)
    }

    override fun getTotalCustomerCountFlow(): Flow<Int> {
        return customerDao.getTotalCustomerCountFlow()
    }

    override suspend fun onMissedCallFrom(phoneNumber: String, callerName: String?, callEventId: String?): Customer {
        val (customerEntity, _) = crmSyncManager.resolveOrCreateCustomer(phoneNumber, callerName, source = "MISSED_CALL")
        crmSyncManager.recordActivity(
            customerId = customerEntity.id,
            type = CrmActivityType.MISSED_CALL,
            message = "Missed call from ${callerName ?: phoneNumber}",
            callEventId = callEventId,
            metadata = mapOf(
                "callerName" to (callerName ?: ""),
                "phoneNumber" to phoneNumber
            )
        )
        return customerEntity.toDomain()
    }
}
