package com.misscall.whatsappassistant.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.misscall.whatsappassistant.database.entity.MessageTemplateEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageTemplateDao {

    @Query("SELECT * FROM message_templates ORDER BY is_default DESC, id ASC")
    fun getAllTemplatesFlow(): Flow<List<MessageTemplateEntity>>

    @Query("SELECT * FROM message_templates WHERE is_default = 1 LIMIT 1")
    suspend fun getDefaultTemplate(): MessageTemplateEntity?

    @Query("SELECT * FROM message_templates WHERE is_default = 1 LIMIT 1")
    fun getDefaultTemplateFlow(): Flow<MessageTemplateEntity?>

    @Query("SELECT * FROM message_templates WHERE id = :id")
    suspend fun getTemplateById(id: Long): MessageTemplateEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplate(template: MessageTemplateEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplates(templates: List<MessageTemplateEntity>)

    @Update
    suspend fun updateTemplate(template: MessageTemplateEntity)

    @Query("UPDATE message_templates SET is_default = 0")
    suspend fun clearDefaultFlags()

    @Transaction
    suspend fun setDefaultTemplate(id: Long) {
        clearDefaultFlags()
        setSingleDefault(id)
    }

    @Query("UPDATE message_templates SET is_default = 1 WHERE id = :id")
    suspend fun setSingleDefault(id: Long)

    @Query("DELETE FROM message_templates WHERE id = :id")
    suspend fun deleteTemplate(id: Long)

    @Query("SELECT COUNT(*) FROM message_templates")
    suspend fun getTemplateCount(): Int
}
