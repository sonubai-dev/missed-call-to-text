package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.database.dao.ActivityLogDao
import com.misscall.whatsappassistant.database.entity.ActivityLogEntity
import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ActivityStatus
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ActivityLogRepositoryImpl @Inject constructor(
    private val activityLogDao: ActivityLogDao
) : ActivityLogRepository {

    override fun getAllActivityLogsFlow(): Flow<List<ActivityLog>> {
        return activityLogDao.getAllActivityLogsFlow().map { list ->
            list.map { it.toDomainModel() }
        }
    }

    override fun getLogsByChannelFlow(channelType: ChannelType): Flow<List<ActivityLog>> {
        return activityLogDao.getLogsByChannelFlow(channelType.name).map { list ->
            list.map { it.toDomainModel() }
        }
    }

    override suspend fun getLatestLogForRecipient(recipient: String): ActivityLog? {
        return activityLogDao.getLatestLogForRecipient(recipient)?.toDomainModel()
    }

    override suspend fun findRecentSentLogForRecipient(recipient: String, sinceTimestamp: Long): ActivityLog? {
        return activityLogDao.findRecentSentLogForRecipient(recipient, sinceTimestamp)?.toDomainModel()
    }

    override suspend fun insertActivityLog(log: ActivityLog): Long {
        return activityLogDao.insertActivityLog(ActivityLogEntity.fromDomain(log))
    }

    override suspend fun updateLogStatus(id: Long, status: ActivityStatus, errorReason: String?) {
        activityLogDao.updateLogStatus(id, status.name, errorReason)
    }

    override suspend fun deleteActivityLog(id: Long) {
        activityLogDao.deleteActivityLog(id)
    }

    override suspend fun clearAllActivityLogs() {
        activityLogDao.clearAllActivityLogs()
    }

    override fun getSuccessCountFlow(): Flow<Int> {
        return activityLogDao.getSuccessCountFlow()
    }

    override fun getFailureCountFlow(): Flow<Int> {
        return activityLogDao.getFailureCountFlow()
    }
}
