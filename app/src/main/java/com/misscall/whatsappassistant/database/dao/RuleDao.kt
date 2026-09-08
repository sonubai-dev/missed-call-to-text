package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.RuleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RuleDao {

    @Query("SELECT * FROM rules ORDER BY priority DESC, id ASC")
    fun getAllRulesFlow(): Flow<List<RuleEntity>>

    @Query("SELECT * FROM rules WHERE is_active = 1 ORDER BY priority DESC, id ASC")
    suspend fun getActiveRules(): List<RuleEntity>

    @Query("SELECT * FROM rules WHERE id = :id LIMIT 1")
    suspend fun getRuleById(id: Long): RuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRule(rule: RuleEntity): Long

    @Update
    suspend fun updateRule(rule: RuleEntity)

    @Query("UPDATE rules SET is_active = :isActive, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateRuleStatus(id: Long, isActive: Boolean, updatedAt: Long = System.currentTimeMillis())

    @Query("UPDATE rules SET priority = :priority, updated_at = :updatedAt WHERE id = :id")
    suspend fun updateRulePriority(id: Long, priority: Int, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM rules WHERE id = :id")
    suspend fun deleteRule(id: Long)

    @Query("DELETE FROM rules")
    suspend fun clearAllRules()

    @Query("SELECT COUNT(*) FROM rules")
    fun getTotalRuleCountFlow(): Flow<Int>
}
