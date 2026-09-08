package com.misscall.whatsappassistant.data.mapper

import com.misscall.whatsappassistant.database.entity.CallEventEntity
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.database.entity.FollowUpSuggestionEntity
import com.misscall.whatsappassistant.database.entity.MessageLogEntity
import com.misscall.whatsappassistant.database.entity.MessageTemplateEntity
import com.misscall.whatsappassistant.domain.model.CallDetectionSource
import com.misscall.whatsappassistant.domain.model.CallDirection
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.DeliveryMethod
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestion
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestionStatus
import com.misscall.whatsappassistant.domain.model.MessageDeliveryStatus
import com.misscall.whatsappassistant.domain.model.MessageLog
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus

fun CallEventEntity.toDomain(): CallEvent {
    return CallEvent(
        id = this.id,
        idempotencyKey = this.idempotencyKey,
        phoneNumber = this.phoneNumber,
        normalizedPhoneNumber = this.normalizedPhoneNumber,
        callerName = this.callerName,
        timestamp = this.timestamp,
        direction = try { CallDirection.valueOf(this.direction) } catch (e: Exception) { CallDirection.UNKNOWN },
        status = try { CallStatus.valueOf(this.status) } catch (e: Exception) { CallStatus.UNKNOWN },
        source = try { CallDetectionSource.valueOf(this.source) } catch (e: Exception) { CallDetectionSource.CALL_SCREENING },
        processed = this.processed,
        whatsappStatus = try { WhatsAppFollowUpStatus.valueOf(this.whatsappStatus) } catch (e: Exception) { WhatsAppFollowUpStatus.PENDING },
        templateId = this.templateId,
        notes = this.notes,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

fun CallEvent.toEntity(): CallEventEntity {
    return CallEventEntity(
        id = this.id,
        idempotencyKey = this.idempotencyKey,
        phoneNumber = this.phoneNumber,
        normalizedPhoneNumber = this.normalizedPhoneNumber,
        callerName = this.callerName,
        timestamp = this.timestamp,
        direction = this.direction.name,
        status = this.status.name,
        source = this.source.name,
        processed = this.processed,
        whatsappStatus = this.whatsappStatus.name,
        templateId = this.templateId,
        notes = this.notes,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

fun CustomerEntity.toDomain(): Customer = Customer(
    id = id,
    phoneNumber = phoneNumber,
    name = name,
    company = company,
    notes = notes,
    isVip = isVip,
    isBlacklisted = isBlacklisted,
    isWhitelisted = isWhitelisted,
    totalMissedCalls = totalMissedCalls,
    lastCallTimestamp = lastCallTimestamp,
    businessStatus = try { com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus.valueOf(businessStatus) } catch (e: Exception) { com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus.NEW },
    source = source,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun Customer.toEntity(): CustomerEntity = CustomerEntity(
    id = id,
    phoneNumber = phoneNumber,
    name = name,
    company = company,
    notes = notes,
    isVip = isVip,
    isBlacklisted = isBlacklisted,
    isWhitelisted = isWhitelisted,
    totalMissedCalls = totalMissedCalls,
    lastCallTimestamp = lastCallTimestamp,
    businessStatus = businessStatus.name,
    source = source,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun MessageTemplateEntity.toDomain(): MessageTemplate = MessageTemplate(
    id = id,
    name = name,
    content = content,
    language = language,
    isDefault = isDefault,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun MessageTemplate.toEntity(): MessageTemplateEntity = MessageTemplateEntity(
    id = id,
    name = name,
    content = content,
    language = language,
    isDefault = isDefault,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun FollowUpSuggestionEntity.toDomain(): FollowUpSuggestion = FollowUpSuggestion(
    id = id,
    callEventId = callEventId,
    phoneNumber = phoneNumber,
    suggestedMessage = suggestedMessage,
    status = try { FollowUpSuggestionStatus.valueOf(status) } catch (e: Exception) { FollowUpSuggestionStatus.PENDING },
    createdAt = createdAt
)

fun FollowUpSuggestion.toEntity(): FollowUpSuggestionEntity = FollowUpSuggestionEntity(
    id = id,
    callEventId = callEventId,
    phoneNumber = phoneNumber,
    suggestedMessage = suggestedMessage,
    status = status.name,
    createdAt = createdAt
)

fun MessageLogEntity.toDomain(): MessageLog = MessageLog(
    id = id,
    callEventId = callEventId,
    customerId = customerId,
    phoneNumber = phoneNumber,
    messageContent = messageContent,
    timestamp = timestamp,
    status = try { MessageDeliveryStatus.valueOf(status) } catch (e: Exception) { MessageDeliveryStatus.SUCCESS },
    deliveryMethod = try { DeliveryMethod.valueOf(deliveryMethod) } catch (e: Exception) { DeliveryMethod.INTENT },
    errorMessage = errorMessage
)

fun MessageLog.toEntity(): MessageLogEntity = MessageLogEntity(
    id = id,
    callEventId = callEventId,
    customerId = customerId,
    phoneNumber = phoneNumber,
    messageContent = messageContent,
    timestamp = timestamp,
    status = status.name,
    deliveryMethod = deliveryMethod.name,
    errorMessage = errorMessage
)
