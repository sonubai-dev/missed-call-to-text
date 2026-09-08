package com.misscall.whatsappassistant.domain.usecase

import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.domain.model.DashboardStats
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import java.util.Calendar
import javax.inject.Inject

class GetDashboardStatsUseCase @Inject constructor(
    private val callEventRepository: CallEventRepository,
    private val customerRepository: CustomerRepository,
    private val userPreferencesRepository: UserPreferencesRepository
) {

    operator fun invoke(): Flow<DashboardStats> {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfToday = calendar.timeInMillis

        return combine(
            callEventRepository.getMissedCallCountSinceFlow(startOfToday),
            callEventRepository.getPendingFollowUpCountFlow(),
            callEventRepository.getSentCountSinceFlow(startOfToday),
            customerRepository.getTotalCustomerCountFlow(),
            userPreferencesRepository.userPreferencesFlow
        ) { missedToday: Int, pending: Int, sentToday: Int, customers: Int, prefs ->
            DashboardStats(
                totalMissedCallsToday = missedToday,
                followUpsPendingToday = pending,
                messagesSentToday = sentToday,
                repliesReceivedToday = 0, // Local-first offline tracking
                totalCustomers = customers,
                isAutoReplyActive = prefs.isAutoReplyEnabled,
                isMonitoringActive = prefs.isMonitoringServiceEnabled
            )
        }
    }
}
