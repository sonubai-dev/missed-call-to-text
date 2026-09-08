package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.misscall.whatsappassistant.database.entity.CrmActivityEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CrmActivityDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActivity(activity: CrmActivityEntity): Long

    @Query("SELECT * FROM crm_activities WHERE customer_id = :customerId ORDER BY timestamp DESC")
    fun getActivitiesForCustomerFlow(customerId: Long): Flow<List<CrmActivityEntity>>

    @Query("SELECT * FROM crm_activities WHERE customer_id = :customerId ORDER BY timestamp DESC")
    suspend fun getActivitiesForCustomer(customerId: Long): List<CrmActivityEntity>

    @Query("SELECT * FROM crm_activities ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentActivitiesFlow(limit: Int = 50): Flow<List<CrmActivityEntity>>

    @Query("SELECT COUNT(*) FROM crm_activities WHERE type IN ('WHATSAPP_SENT', 'SMS_SENT', 'CALL_BACK', 'CUSTOM_MESSAGE') AND timestamp >= :since")
    fun getFollowUpsCountSinceFlow(since: Long): Flow<Int>

    @Query("DELETE FROM crm_activities WHERE customer_id = :customerId")
    suspend fun deleteActivitiesForCustomer(customerId: Long)

    @Query("DELETE FROM crm_activities")
    suspend fun deleteAllActivities()
}
