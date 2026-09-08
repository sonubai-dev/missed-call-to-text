package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.misscall.whatsappassistant.database.entity.MessageLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageLogDao {

    @Query("SELECT * FROM message_logs ORDER BY timestamp DESC")
    fun getAllMessageLogsFlow(): Flow<List<MessageLogEntity>>

    @Query("SELECT * FROM message_logs WHERE phone_number = :phoneNumber ORDER BY timestamp DESC")
    fun getMessageLogsForNumberFlow(phoneNumber: String): Flow<List<MessageLogEntity>>

    @Query("SELECT * FROM message_logs WHERE call_event_id = :callEventId LIMIT 1")
    suspend fun getMessageLogForCallEvent(callEventId: Long): MessageLogEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessageLog(log: MessageLogEntity): Long

    @Query("SELECT COUNT(*) FROM message_logs WHERE status = 'SUCCESS'")
    fun getSuccessfulMessagesCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM message_logs WHERE status = 'SUCCESS' AND timestamp >= :since")
    fun getSuccessfulMessagesCountSinceFlow(since: Long): Flow<Int>

    @Query("DELETE FROM message_logs")
    suspend fun clearAllLogs()
}
