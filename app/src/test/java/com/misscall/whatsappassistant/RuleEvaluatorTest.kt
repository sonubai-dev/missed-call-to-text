package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.domain.model.ActivityLog
import com.misscall.whatsappassistant.domain.model.ActivityStatus
import com.misscall.whatsappassistant.domain.model.CallerCondition
import com.misscall.whatsappassistant.domain.model.ChannelType
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.TimeWindow
import com.misscall.whatsappassistant.domain.repository.ActivityLogRepository
import com.misscall.whatsappassistant.domain.repository.RuleRepository
import com.misscall.whatsappassistant.domain.usecase.EvaluateRulesUseCase
import com.misscall.whatsappassistant.domain.usecase.RuleEvaluationResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class RuleEvaluatorTest {

    private lateinit var evaluateRulesUseCase: EvaluateRulesUseCase
    private val fakeRuleRepository = FakeRuleRepository()
    private val fakeActivityLogRepository = FakeActivityLogRepository()

    @Before
    fun setUp() {
        evaluateRulesUseCase = EvaluateRulesUseCase(
            ruleRepository = fakeRuleRepository,
            activityLogRepository = fakeActivityLogRepository
        )
    }

    @Test
    fun `evaluates highest priority rule first`() = runTest {
        val lowPriorityRule = DispatchRule(
            id = 1,
            name = "Low Priority All Callers",
            priority = 1,
            isActive = true,
            callerCondition = CallerCondition.ALL_CALLERS,
            channelType = ChannelType.SMS
        )
        val highPriorityRule = DispatchRule(
            id = 2,
            name = "High Priority WhatsApp",
            priority = 10,
            isActive = true,
            callerCondition = CallerCondition.ALL_CALLERS,
            channelType = ChannelType.WHATSAPP
        )

        fakeRuleRepository.rules = listOf(lowPriorityRule, highPriorityRule)

        val result = evaluateRulesUseCase(
            callerNumber = "+919876543210",
            customer = null
        )

        assertTrue(result is RuleEvaluationResult.Match)
        assertEquals(2L, (result as RuleEvaluationResult.Match).rule.id)
        assertEquals(ChannelType.WHATSAPP, result.rule.channelType)
    }

    @Test
    fun `matches unknown caller rule when customer is null`() = runTest {
        val unknownOnlyRule = DispatchRule(
            id = 1,
            name = "Unknown Caller SMS",
            priority = 5,
            isActive = true,
            callerCondition = CallerCondition.UNKNOWN_ONLY,
            channelType = ChannelType.SMS
        )

        fakeRuleRepository.rules = listOf(unknownOnlyRule)

        val result = evaluateRulesUseCase(
            callerNumber = "+919876543210",
            customer = null
        )

        assertTrue(result is RuleEvaluationResult.Match)
        assertEquals(ChannelType.SMS, (result as RuleEvaluationResult.Match).rule.channelType)
    }

    @Test
    fun `skips unknown caller rule when customer has a saved name`() = runTest {
        val unknownOnlyRule = DispatchRule(
            id = 1,
            name = "Unknown Caller SMS",
            priority = 5,
            isActive = true,
            callerCondition = CallerCondition.UNKNOWN_ONLY,
            channelType = ChannelType.SMS
        )

        fakeRuleRepository.rules = listOf(unknownOnlyRule)

        val savedCustomer = Customer(
            id = 1,
            phoneNumber = "+919876543210",
            name = "Dr. Alice",
            company = "Healthcare Corp"
        )

        val result = evaluateRulesUseCase(
            callerNumber = "+919876543210",
            customer = savedCustomer
        )

        assertTrue(result is RuleEvaluationResult.NoMatch)
    }

    @Test
    fun `skips rule when active cooldown is in effect`() = runTest {
        val rule = DispatchRule(
            id = 1,
            name = "WhatsApp Auto",
            priority = 5,
            isActive = true,
            callerCondition = CallerCondition.ALL_CALLERS,
            cooldownMinutes = 60
        )

        fakeRuleRepository.rules = listOf(rule)
        val now = System.currentTimeMillis()

        // Simulate sent log 10 minutes ago
        fakeActivityLogRepository.recentSentLog = ActivityLog(
            recipient = "+919876543210",
            messageContent = "Test",
            status = ActivityStatus.SENT,
            dispatchedAt = now - (10 * 60 * 1000L)
        )

        val result = evaluateRulesUseCase(
            callerNumber = "+919876543210",
            customer = null,
            currentTimestamp = now
        )

        assertTrue(result is RuleEvaluationResult.SkippedCooldown)
    }

    // Test Fakes
    private class FakeRuleRepository : RuleRepository {
        var rules = listOf<DispatchRule>()
        override fun getAllRulesFlow(): Flow<List<DispatchRule>> = flowOf(rules)
        override suspend fun getActiveRules(): List<DispatchRule> = rules.filter { it.isActive }
        override suspend fun getRuleById(id: Long): DispatchRule? = rules.find { it.id == id }
        override suspend fun insertRule(rule: DispatchRule): Long = 1L
        override suspend fun updateRule(rule: DispatchRule) {}
        override suspend fun updateRuleStatus(id: Long, isActive: Boolean) {}
        override suspend fun updateRulePriority(id: Long, priority: Int) {}
        override suspend fun deleteRule(id: Long) {}
        override suspend fun clearAllRules() {}
        override fun getTotalRuleCountFlow(): Flow<Int> = flowOf(rules.size)
    }

    private class FakeActivityLogRepository : ActivityLogRepository {
        var recentSentLog: ActivityLog? = null
        override fun getAllActivityLogsFlow(): Flow<List<ActivityLog>> = flowOf(emptyList())
        override fun getLogsByChannelFlow(channelType: ChannelType): Flow<List<ActivityLog>> = flowOf(emptyList())
        override suspend fun getLatestLogForRecipient(recipient: String): ActivityLog? = null
        override suspend fun findRecentSentLogForRecipient(recipient: String, sinceTimestamp: Long): ActivityLog? = recentSentLog
        override suspend fun insertActivityLog(log: ActivityLog): Long = 1L
        override suspend fun updateLogStatus(id: Long, status: ActivityStatus, errorReason: String?) {}
        override suspend fun deleteActivityLog(id: Long) {}
        override suspend fun clearAllActivityLogs() {}
        override fun getSuccessCountFlow(): Flow<Int> = flowOf(0)
        override fun getFailureCountFlow(): Flow<Int> = flowOf(0)
    }
}
