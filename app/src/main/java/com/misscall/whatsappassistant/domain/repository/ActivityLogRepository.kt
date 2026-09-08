package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ChannelType
import kotlinx.coroutines.flow.Flow

interface ActivityLogRepository {
    fun getAllActivityLogsFlow(): Flow<List<ActivityLog>>
    fun getLogsByChannelFlow(channelType: ChannelType): Flow<List<ActivityLog>>
    suspend fun getLatestLogForRecipient(recipient: String): ActivityLog?
    suspend fun findRecentSentLogForRecipient(recipient: String, sinceTimestamp: Long): ActivityLog?
    suspend fun insertActivityLog(log: ActivityLog): Long
    suspend fun updateLogStatus(id: Long, status: com.misscall.whatsappassistant.domain.model.ActivityStatus, errorReason: String? = null)
    suspend fun deleteActivityLog(id: Long)
    suspend fun clearAllActivityLogs()
    fun getSuccessCountFlow(): Flow<Int>
    fun getFailureCountFlow(): Flow<Int>
}
