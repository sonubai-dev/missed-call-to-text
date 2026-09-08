package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.FollowUpSuggestionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FollowUpSuggestionDao {

    @Query("SELECT * FROM follow_up_suggestions ORDER BY created_at DESC")
    fun getAllSuggestionsFlow(): Flow<List<FollowUpSuggestionEntity>>

    @Query("SELECT * FROM follow_up_suggestions WHERE status = :status ORDER BY created_at DESC")
    fun getSuggestionsByStatusFlow(status: String): Flow<List<FollowUpSuggestionEntity>>

    @Query("SELECT * FROM follow_up_suggestions WHERE call_event_id = :callEventId LIMIT 1")
    suspend fun getSuggestionForCallEvent(callEventId: Long): FollowUpSuggestionEntity?

    @Query("SELECT * FROM follow_up_suggestions WHERE id = :id")
    suspend fun getSuggestionById(id: Long): FollowUpSuggestionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSuggestion(suggestion: FollowUpSuggestionEntity): Long

    @Update
    suspend fun updateSuggestion(suggestion: FollowUpSuggestionEntity)

    @Query("UPDATE follow_up_suggestions SET status = :status WHERE id = :id")
    suspend fun updateSuggestionStatus(id: Long, status: String)

    @Query("UPDATE follow_up_suggestions SET status = :status WHERE call_event_id = :callEventId")
    suspend fun updateStatusByCallEventId(callEventId: Long, status: String)

    @Query("DELETE FROM follow_up_suggestions WHERE id = :id")
    suspend fun deleteSuggestion(id: Long)

    @Query("DELETE FROM follow_up_suggestions")
    suspend fun clearAllSuggestions()
}
