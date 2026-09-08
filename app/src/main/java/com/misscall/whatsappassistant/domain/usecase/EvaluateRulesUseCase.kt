package com.misscall.whatsappassistant.domain.usecase

import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.domain.model.CallerCondition
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import com.misscall.whatsappassistant.domain.repository.RuleRepository
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

sealed class RuleEvaluationResult {
    data class Match(val rule: DispatchRule) : RuleEvaluationResult()
    data class SkippedCooldown(val rule: DispatchRule, val lastDispatchedAt: Long) : RuleEvaluationResult()
    data object NoMatch : RuleEvaluationResult()
}

@Singleton
class EvaluateRulesUseCase @Inject constructor(
    private val ruleRepository: RuleRepository,
    private val activityLogRepository: ActivityLogRepository
) {
    companion object {
        private const val TAG = "EvaluateRulesUseCase"
    }

    suspend operator fun invoke(
        callerNumber: String,
        customer: Customer?,
        currentTimestamp: Long = System.currentTimeMillis()
    ): RuleEvaluationResult {
        val activeRules = ruleRepository.getActiveRules().sortedByDescending { it.priority }
        AppLogger.i(TAG, "Evaluating ${activeRules.size} active rules for $callerNumber")

        for (rule in activeRules) {
            // 1. Evaluate Caller Condition
            val matchesCaller = when (rule.callerCondition) {
                CallerCondition.ALL_CALLERS -> true
                CallerCondition.UNKNOWN_ONLY -> customer == null || customer.name.isNullOrBlank()
                CallerCondition.CONTACTS_ONLY -> customer != null && !customer.name.isNullOrBlank()
                CallerCondition.SPECIFIC_NUMBERS -> rule.specificNumbers.any { callerNumber.contains(it.trim()) }
                CallerCondition.VIP_ONLY -> customer?.isVip == true
            }

            if (!matchesCaller) {
                AppLogger.d(TAG, "Rule '${rule.name}' skipped: Caller condition mismatch (${rule.callerCondition})")
                continue
            }

            // 2. Evaluate Time Window Condition
            if (rule.timeWindow.enabled) {
                val cal = Calendar.getInstance().apply { timeInMillis = currentTimestamp }
                val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK) // 1=Sun, 2=Mon... 7=Sat
                val currentHour = cal.get(Calendar.HOUR_OF_DAY)
                val currentMinute = cal.get(Calendar.MINUTE)
                val currentMinutesOfDay = currentHour * 60 + currentMinute

                val startMinutesOfDay = rule.timeWindow.startHour * 60 + rule.timeWindow.startMinute
                val endMinutesOfDay = rule.timeWindow.endHour * 60 + rule.timeWindow.endMinute

                val dayMatches = rule.timeWindow.activeDays.contains(dayOfWeek)
                val timeMatches = if (startMinutesOfDay <= endMinutesOfDay) {
                    currentMinutesOfDay in startMinutesOfDay..endMinutesOfDay
                } else {
                    // Over midnight window (e.g. 22:00 to 06:00)
                    currentMinutesOfDay >= startMinutesOfDay || currentMinutesOfDay <= endMinutesOfDay
                }

                if (!dayMatches || !timeMatches) {
                    AppLogger.d(TAG, "Rule '${rule.name}' skipped: Time window mismatch (Day: $dayOfWeek, Time: $currentHour:$currentMinute)")
                    continue
                }
            }

            // 3. Evaluate Cooldown
            if (rule.cooldownMinutes > 0) {
                val cooldownMs = rule.cooldownMinutes * 60 * 1000L
                val recentLog = activityLogRepository.findRecentSentLogForRecipient(callerNumber, currentTimestamp - cooldownMs)
                if (recentLog != null) {
                    AppLogger.i(TAG, "Rule '${rule.name}' skipped due to active cooldown of ${rule.cooldownMinutes}m (last sent at ${recentLog.dispatchedAt})")
                    return RuleEvaluationResult.SkippedCooldown(rule, recentLog.dispatchedAt)
                }
            }

            // Matched!
            AppLogger.i(TAG, "Rule matched: '${rule.name}' (Priority: ${rule.priority}, Channel: ${rule.channelType})")
            return RuleEvaluationResult.Match(rule)
        }

        return RuleEvaluationResult.NoMatch
    }
}
