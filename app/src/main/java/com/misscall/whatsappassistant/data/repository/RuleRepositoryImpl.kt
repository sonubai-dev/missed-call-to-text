package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.database.dao.RuleDao
import com.misscall.whatsappassistant.database.entity.RuleEntity
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.repository.RuleRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RuleRepositoryImpl @Inject constructor(
    private val ruleDao: RuleDao
) : RuleRepository {

    override fun getAllRulesFlow(): Flow<List<DispatchRule>> {
        return ruleDao.getAllRulesFlow().map { list ->
            list.map { it.toDomainModel() }
        }
    }

    override suspend fun getActiveRules(): List<DispatchRule> {
        return ruleDao.getActiveRules().map { it.toDomainModel() }
    }

    override suspend fun getRuleById(id: Long): DispatchRule? {
        return ruleDao.getRuleById(id)?.toDomainModel()
    }

    override suspend fun insertRule(rule: DispatchRule): Long {
        return ruleDao.insertRule(RuleEntity.fromDomain(rule))
    }

    override suspend fun updateRule(rule: DispatchRule) {
        ruleDao.updateRule(RuleEntity.fromDomain(rule))
    }

    override suspend fun updateRuleStatus(id: Long, isActive: Boolean) {
        ruleDao.updateRuleStatus(id, isActive)
    }

    override suspend fun updateRulePriority(id: Long, priority: Int) {
        ruleDao.updateRulePriority(id, priority)
    }

    override suspend fun deleteRule(id: Long) {
        ruleDao.deleteRule(id)
    }

    override suspend fun clearAllRules() {
        ruleDao.clearAllRules()
    }

    override fun getTotalRuleCountFlow(): Flow<Int> {
        return ruleDao.getTotalRuleCountFlow()
    }
}
