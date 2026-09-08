package com.misscall.whatsappassistant.domain.repository

import com.misscall.whatsappassistant.domain.model.FollowUpSuggestion
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestionStatus
import kotlinx.coroutines.flow.Flow

interface FollowUpSuggestionRepository {
    fun getAllSuggestionsFlow(): Flow<List<FollowUpSuggestion>>
    fun getSuggestionsByStatusFlow(status: FollowUpSuggestionStatus): Flow<List<FollowUpSuggestion>>
    suspend fun getSuggestionForCallEvent(callEventId: Long): FollowUpSuggestion?
    suspend fun getSuggestionById(id: Long): FollowUpSuggestion?
    suspend fun insertSuggestion(suggestion: FollowUpSuggestion): Long
    suspend fun updateSuggestion(suggestion: FollowUpSuggestion)
    suspend fun updateSuggestionStatus(id: Long, status: FollowUpSuggestionStatus)
    suspend fun updateStatusByCallEventId(callEventId: Long, status: FollowUpSuggestionStatus)
    suspend fun deleteSuggestion(id: Long)
}
