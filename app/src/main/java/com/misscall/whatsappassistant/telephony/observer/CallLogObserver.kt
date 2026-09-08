package com.misscall.whatsappassistant.telephony.observer

import android.content.Context
import android.database.ContentObserver
import android.database.Cursor
import android.os.Handler
import android.os.Looper
import android.provider.CallLog
import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.PermissionHelper
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.telephony.pipeline.CallEventPipeline
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CallLogObserver @Inject constructor(
    @ApplicationContext private val context: Context,
    private val callEventPipeline: CallEventPipeline,
    private val preferencesRepository: UserPreferencesRepository
) : ContentObserver(Handler(Looper.getMainLooper())) {

    private var lastProcessedCallTime: Long = System.currentTimeMillis() - 10000L

    override fun onChange(selfChange: Boolean) {
        super.onChange(selfChange)
        checkRecentMissedCalls()
    }

    fun checkRecentMissedCalls() {
        if (!PermissionHelper.isPermissionGranted(context, android.Manifest.permission.READ_CALL_LOG)) {
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val prefs = preferencesRepository.userPreferencesFlow.first()
                if (!prefs.isMonitoringServiceEnabled) return@launch

                val projection = arrayOf(
                    CallLog.Calls.NUMBER,
                    CallLog.Calls.CACHED_NAME,
                    CallLog.Calls.TYPE,
                    CallLog.Calls.DATE
                )

                val selection = "${CallLog.Calls.TYPE} = ? AND ${CallLog.Calls.DATE} > ?"
                val selectionArgs = arrayOf(
                    CallLog.Calls.MISSED_TYPE.toString(),
                    lastProcessedCallTime.toString()
                )
                val sortOrder = "${CallLog.Calls.DATE} DESC LIMIT 5"

                val cursor: Cursor? = context.contentResolver.query(
                    CallLog.Calls.CONTENT_URI,
                    projection,
                    selection,
                    selectionArgs,
                    sortOrder
                )

                cursor?.use { c ->
                    val numberIndex = c.getColumnIndex(CallLog.Calls.NUMBER)
                    val nameIndex = c.getColumnIndex(CallLog.Calls.CACHED_NAME)
                    val dateIndex = c.getColumnIndex(CallLog.Calls.DATE)

                    while (c.moveToNext()) {
                        val number = if (numberIndex != -1) c.getString(numberIndex) else null
                        val name = if (nameIndex != -1) c.getString(nameIndex) else null
                        val date = if (dateIndex != -1) c.getLong(dateIndex) else System.currentTimeMillis()

                        if (!number.isNullOrBlank() && date > lastProcessedCallTime) {
                            lastProcessedCallTime = date
                            AppLogger.i("CallLogObserver", "Detected missed call in CallLog for $number at $date")
                            callEventPipeline.onDirectMissedCall(
                                phoneNumber = number,
                                callerName = name,
                                timestamp = date,
                                source = CallDetectionSource.CALL_LOG
                            )
                        }
                    }
                }
            } catch (e: Exception) {
                AppLogger.e("CallLogObserver", "Error querying CallLog.Calls", e)
            }
        }
    }
}
