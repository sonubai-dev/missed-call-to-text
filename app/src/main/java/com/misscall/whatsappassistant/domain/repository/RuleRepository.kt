package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.DispatchRule
import kotlinx.coroutines.flow.Flow

interface RuleRepository {
    fun getAllRulesFlow(): Flow<List<DispatchRule>>
    suspend fun getActiveRules(): List<DispatchRule>
    suspend fun getRuleById(id: Long): DispatchRule?
    suspend fun insertRule(rule: DispatchRule): Long
    suspend fun updateRule(rule: DispatchRule)
    suspend fun updateRuleStatus(id: Long, isActive: Boolean)
    suspend fun updateRulePriority(id: Long, priority: Int)
    suspend fun deleteRule(id: Long)
    suspend fun clearAllRules()
    fun getTotalRuleCountFlow(): Flow<Int>
}
