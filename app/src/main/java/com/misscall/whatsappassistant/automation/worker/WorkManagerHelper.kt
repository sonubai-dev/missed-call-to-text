package com.misscall.whatsappassistant.automation.worker

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.misscall.whatsappassistant.core.util.Constants
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WorkManagerHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {

    private val workManager = WorkManager.getInstance(context)

    fun scheduleFollowUp(
        callEventId: Long?,
        phoneNumber: String,
        messageText: String,
        templateId: Long?,
        delayMinutes: Int
    ) {
        val inputData = Data.Builder()
            .putLong(Constants.EXTRA_CALL_EVENT_ID, callEventId ?: -1L)
            .putString(Constants.EXTRA_PHONE_NUMBER, phoneNumber)
            .putString(Constants.EXTRA_MESSAGE_TEXT, messageText)
            .putLong("extra_template_id", templateId ?: -1L)
            .build()

        val workRequest = OneTimeWorkRequestBuilder<FollowUpWorker>()
            .setInputData(inputData)
            .setInitialDelay(delayMinutes.toLong(), TimeUnit.MINUTES)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                30,
                TimeUnit.SECONDS
            )
            .addTag(Constants.WORK_TAG_FOLLOW_UP)
            .build()

        val uniqueWorkName = "${Constants.UNIQUE_WORK_PREFIX_CALL}${callEventId ?: phoneNumber}"

        workManager.enqueueUniqueWork(
            uniqueWorkName,
            ExistingWorkPolicy.REPLACE,
            workRequest
        )
    }

    fun cancelFollowUp(callEventId: Long) {
        val uniqueWorkName = "${Constants.UNIQUE_WORK_PREFIX_CALL}$callEventId"
        workManager.cancelUniqueWork(uniqueWorkName)
    }
}
