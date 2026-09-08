package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CustomerDao {

    @Query("SELECT * FROM customers")
    suspend fun getAllCustomers(): List<CustomerEntity>

    @Query("SELECT * FROM customers ORDER BY last_call_timestamp DESC")
    fun getAllCustomersFlow(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE is_vip = 1 ORDER BY last_call_timestamp DESC")
    fun getVipCustomersFlow(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE is_blacklisted = 1 ORDER BY last_call_timestamp DESC")
    fun getBlacklistedCustomersFlow(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE phone_number = :phoneNumber LIMIT 1")
    suspend fun getCustomerByPhoneNumber(phoneNumber: String): CustomerEntity?

    @Query("SELECT * FROM customers WHERE id = :id LIMIT 1")
    suspend fun getCustomerById(id: Long): CustomerEntity?

    @Query("SELECT * FROM customers WHERE name LIKE '%' || :query || '%' OR phone_number LIKE '%' || :query || '%' OR company LIKE '%' || :query || '%' ORDER BY last_call_timestamp DESC")
    fun searchCustomersFlow(query: String): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateCustomer(customer: CustomerEntity): Long

    @Update
    suspend fun updateCustomer(customer: CustomerEntity)

    @Query("UPDATE customers SET is_vip = :isVip, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateVipStatus(id: Long, isVip: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE customers SET is_blacklisted = :isBlacklisted, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateBlacklistStatus(id: Long, isBlacklisted: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE customers SET is_whitelisted = :isWhitelisted, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateWhitelistStatus(id: Long, isWhitelisted: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE customers SET notes = :notes, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateNotes(id: Long, notes: String, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM customers WHERE id = :id")
    suspend fun deleteCustomer(id: Long)

    @Query("DELETE FROM customers")
    suspend fun clearAllCustomers()

    @Query("SELECT COUNT(*) FROM customers")
    fun getTotalCustomerCountFlow(): Flow<Int>
}
