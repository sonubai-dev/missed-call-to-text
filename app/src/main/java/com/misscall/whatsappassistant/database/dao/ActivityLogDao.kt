package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.ActivityLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ActivityLogDao {

    @Query("SELECT * FROM activity_logs ORDER BY dispatched_at DESC")
    fun getAllActivityLogsFlow(): Flow<List<ActivityLogEntity>>

    @Query("SELECT * FROM activity_logs WHERE channel_type = :channelType ORDER BY dispatched_at DESC")
    fun getLogsByChannelFlow(channelType: String): Flow<List<ActivityLogEntity>>

    @Query("SELECT * FROM activity_logs WHERE recipient = :recipient ORDER BY dispatched_at DESC LIMIT 1")
    suspend fun getLatestLogForRecipient(recipient: String): ActivityLogEntity?

    @Query("SELECT * FROM activity_logs WHERE recipient = :recipient AND dispatched_at >= :sinceTimestamp AND status IN ('SENT', 'DELIVERED') ORDER BY dispatched_at DESC LIMIT 1")
    suspend fun findRecentSentLogForRecipient(recipient: String, sinceTimestamp: Long): ActivityLogEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActivityLog(log: ActivityLogEntity): Long

    @Update
    suspend fun updateActivityLog(log: ActivityLogEntity)

    @Query("UPDATE activity_logs SET status = :status, error_reason = :errorReason WHERE id = :id")
    suspend fun updateLogStatus(id: Long, status: String, errorReason: String? = null)

    @Query("DELETE FROM activity_logs WHERE id = :id")
    suspend fun deleteActivityLog(id: Long)

    @Query("DELETE FROM activity_logs")
    suspend fun clearAllActivityLogs()

    @Query("SELECT COUNT(*) FROM activity_logs WHERE status IN ('SENT', 'DELIVERED')")
    fun getSuccessCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM activity_logs WHERE status = 'FAILED'")
    fun getFailureCountFlow(): Flow<Int>
}
