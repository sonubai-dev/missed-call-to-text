package com.misscall.whatsappassistant.data.repository

import com.misscall.whatsappassistant.data.mapper.toDomain
import com.misscall.whatsappassistant.data.mapper.toEntity
import com.misscall.whatsappassistant.database.dao.FollowUpSuggestionDao
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestion
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestionStatus
import com.misscall.whatsappassistant.domain.repository.FollowUpSuggestionRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FollowUpSuggestionRepositoryImpl @Inject constructor(
    private val suggestionDao: FollowUpSuggestionDao
) : FollowUpSuggestionRepository {

    override fun getAllSuggestionsFlow(): Flow<List<FollowUpSuggestion>> {
        return suggestionDao.getAllSuggestionsFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getSuggestionsByStatusFlow(status: FollowUpSuggestionStatus): Flow<List<FollowUpSuggestion>> {
        return suggestionDao.getSuggestionsByStatusFlow(status.name).map { list -> list.map { it.toDomain() } }
    }

    override suspend fun getSuggestionForCallEvent(callEventId: Long): FollowUpSuggestion? {
        return suggestionDao.getSuggestionForCallEvent(callEventId)?.toDomain()
    }

    override suspend fun getSuggestionById(id: Long): FollowUpSuggestion? {
        return suggestionDao.getSuggestionById(id)?.toDomain()
    }

    override suspend fun insertSuggestion(suggestion: FollowUpSuggestion): Long {
        return suggestionDao.insertSuggestion(suggestion.toEntity())
    }

    override suspend fun updateSuggestion(suggestion: FollowUpSuggestion) {
        suggestionDao.updateSuggestion(suggestion.toEntity())
    }

    override suspend fun updateSuggestionStatus(id: Long, status: FollowUpSuggestionStatus) {
        suggestionDao.updateSuggestionStatus(id, status.name)
    }

    override suspend fun updateStatusByCallEventId(callEventId: Long, status: FollowUpSuggestionStatus) {
        suggestionDao.updateStatusByCallEventId(callEventId, status.name)
    }

    override suspend fun deleteSuggestion(id: Long) {
        suggestionDao.deleteSuggestion(id)
    }
}
