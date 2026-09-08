package com.misscall.whatsappassistant.automation.engine

import com.misscall.whatsappassistant.domain.usecase.ProcessMissedCallUseCase
import com.misscall.whatsappassistant.domain.usecase.ProcessResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AutomationEngine @Inject constructor(
    private val processMissedCallUseCase: ProcessMissedCallUseCase
) {

    suspend fun evaluateAndProcess(
        callEventId: Long,
        phoneNumber: String,
        callerName: String?,
        timestamp: Long = System.currentTimeMillis()
    ): ProcessResult {
        return processMissedCallUseCase(callEventId, phoneNumber, callerName, timestamp)
    }
}
