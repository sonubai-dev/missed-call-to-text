package com.misscall.whatsappassistant.domain.usecase

import com.misscall.whatsappassistant.core.logging.AppLogger
import com.misscall.whatsappassistant.core.preferences.UserPreferencesRepository
import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.core.util.TemplateParser
import com.misscall.whatsappassistant.dispatcher.MultiChannelDispatcher
import com.misscall.whatsappassistant.domain.model.CallEvent
import com.misscall.whatsappassistant.domain.model.CallStatus
import com.misscall.whatsappassistant.domain.model.Customer
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestion
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestionStatus
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.CustomerRepository
import com.misscall.whatsappassistant.domain.repository.FollowUpSuggestionRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import kotlinx.coroutines.flow.first
import javax.inject.Inject

sealed interface ProcessResult {
    data class AutoDispatched(
        val callEvent: CallEvent,
        val customer: Customer,
        val rule: DispatchRule,
        val channel: com.misscall.whatsappassistant.domain.model.ChannelType
    ) : ProcessResult

    data class AutoScheduled(
        val callEvent: CallEvent,
        val customer: Customer,
        val suggestion: FollowUpSuggestion,
        val formattedMessage: String,
        val delayMinutes: Int
    ) : ProcessResult

    data class NotificationOnly(
        val callEvent: CallEvent,
        val customer: Customer,
        val suggestion: FollowUpSuggestion,
        val formattedMessage: String,
        val reason: String
    ) : ProcessResult

    data class Ignored(
        val callEvent: CallEvent,
        val customer: Customer,
        val reason: String
    ) : ProcessResult
}

class ProcessMissedCallUseCase @Inject constructor(
    private val customerRepository: CustomerRepository,
    private val callEventRepository: CallEventRepository,
    private val templateRepository: TemplateRepository,
    private val followUpSuggestionRepository: FollowUpSuggestionRepository,
    private val userPreferencesRepository: UserPreferencesRepository,
    private val evaluateRulesUseCase: EvaluateRulesUseCase,
    private val multiChannelDispatcher: MultiChannelDispatcher
) {
    companion object {
        private const val TAG = "ProcessMissedCall"
    }

    suspend operator fun invoke(
        callEventId: Long,
        phoneNumber: String,
        callerName: String?,
        timestamp: Long = System.currentTimeMillis()
    ): ProcessResult {
        val prefs = userPreferencesRepository.userPreferencesFlow.first()
        val normalized = NumberNormalizer.normalize(phoneNumber, prefs.defaultCountryCode)

        // Fetch the exact CallEvent record that the Pipeline created
        val savedEvent = callEventRepository.getCallEventById(callEventId)
            ?: throw IllegalStateException("CallEvent #$callEventId not found in database")

        // 1. Resolve or create customer record
        val customer = customerRepository.onMissedCallFrom(normalized, callerName, savedEvent.idempotencyKey)

        // 2. Check blacklist
        if (customer.isBlacklisted) {
            callEventRepository.updateWhatsAppStatus(callEventId, WhatsAppFollowUpStatus.IGNORED)
            callEventRepository.markProcessed(callEventId, true)
            return ProcessResult.Ignored(savedEvent, customer, "Caller is blacklisted")
        }

        // 3. Evaluate CallBridge Multi-Channel Rules
        val ruleResult = evaluateRulesUseCase(
            callerNumber = normalized,
            customer = customer,
            currentTimestamp = timestamp
        )

        when (ruleResult) {
            is RuleEvaluationResult.Match -> {
                val matchedRule = ruleResult.rule
                if (prefs.isAutoReplyEnabled && matchedRule.delaySeconds == 0) {
                    AppLogger.i(TAG, "Immediate auto-reply triggered by rule: ${matchedRule.name}")
                    multiChannelDispatcher.dispatch(
                        callEventId = callEventId,
                        phoneNumber = normalized,
                        callerName = customer.name ?: callerName,
                        rule = matchedRule
                    )
                    callEventRepository.updateWhatsAppStatus(callEventId, WhatsAppFollowUpStatus.SENT)
                    callEventRepository.markProcessed(callEventId, true)
                    return ProcessResult.AutoDispatched(savedEvent, customer, matchedRule, matchedRule.channelType)
                } else if (prefs.isAutoReplyEnabled && matchedRule.delaySeconds > 0) {
                    val delayMins = (matchedRule.delaySeconds / 60).coerceAtLeast(1)
                    val template = templateRepository.getTemplateById(matchedRule.templateId)
                        ?: templateRepository.getDefaultTemplate()
                        ?: MessageTemplate(name = "Default", content = "Hi, sorry we missed your call from {{business_name}}.")

                    val formatted = TemplateParser.parse(
                        template = template.content,
                        callerName = customer.name ?: callerName,
                        phoneNumber = normalized,
                        businessName = prefs.businessName
                    )

                    val suggestion = FollowUpSuggestion(
                        callEventId = callEventId,
                        phoneNumber = normalized,
                        suggestedMessage = formatted,
                        status = FollowUpSuggestionStatus.DRAFT,
                        createdAt = timestamp
                    )
                    val suggestionId = followUpSuggestionRepository.insertSuggestion(suggestion)

                    return ProcessResult.AutoScheduled(
                        callEvent = savedEvent,
                        customer = customer,
                        suggestion = suggestion.copy(id = suggestionId),
                        formattedMessage = formatted,
                        delayMinutes = delayMins
                    )
                }
            }
            is RuleEvaluationResult.SkippedCooldown -> {
                callEventRepository.updateWhatsAppStatus(callEventId, WhatsAppFollowUpStatus.SKIPPED)
                callEventRepository.markProcessed(callEventId, true)
                return ProcessResult.Ignored(savedEvent, customer, "Cooldown active for ${ruleResult.rule.name}")
            }
            is RuleEvaluationResult.NoMatch -> {
                AppLogger.d(TAG, "No specific custom rule matched. Using default suggestion.")
            }
        }

        // Default Fallback Template
        val template = templateRepository.getDefaultTemplate()
            ?: MessageTemplate(
                id = 0,
                name = "Template 1",
                content = "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?",
                language = "en",
                isDefault = true
            )

        val formattedMessage = TemplateParser.parse(
            template = template.content,
            callerName = customer.name ?: callerName,
            phoneNumber = normalized,
            businessName = prefs.businessName.ifBlank { "our team" },
            ownerName = prefs.ownerName,
            timestamp = timestamp
        )

        val suggestion = FollowUpSuggestion(
            callEventId = callEventId,
            phoneNumber = normalized,
            suggestedMessage = formattedMessage,
            status = FollowUpSuggestionStatus.PENDING,
            createdAt = timestamp
        )
        val suggestionId = followUpSuggestionRepository.insertSuggestion(suggestion)

        return ProcessResult.NotificationOnly(
            callEvent = savedEvent,
            customer = customer,
            suggestion = suggestion.copy(id = suggestionId),
            formattedMessage = formattedMessage,
            reason = if (!prefs.isAutoReplyEnabled) "Manual mode active" else "Default rule matched"
        )
    }
}
