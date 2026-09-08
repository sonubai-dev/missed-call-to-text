package com.misscall.whatsappassistant.presentation.rules

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.domain.model.DispatchRule
import com.misscall.whatsappassistant.domain.repository.RuleRepository
import com.misscall.whatsappassistant.domain.repository.TemplateRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RulesViewModel @Inject constructor(
    private val ruleRepository: RuleRepository,
    private val templateRepository: TemplateRepository
) : ViewModel() {

    private val _userMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<RulesUiState> = combine(
        ruleRepository.getAllRulesFlow(),
        templateRepository.getAllTemplatesFlow(),
        _userMessage
    ) { rules, templates, msg ->
        RulesUiState(
            rules = rules,
            templates = templates,
            isLoading = false,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = RulesUiState(isLoading = true)
    )

    fun toggleRuleActive(rule: DispatchRule) {
        viewModelScope.launch {
            ruleRepository.updateRuleStatus(rule.id, !rule.isActive)
            _userMessage.value = "Rule '${rule.name}' ${if (!rule.isActive) "enabled" else "disabled"}"
        }
    }

    fun saveRule(rule: DispatchRule) {
        viewModelScope.launch {
            if (rule.id == 0L) {
                ruleRepository.insertRule(rule)
                _userMessage.value = "Rule '${rule.name}' created"
            } else {
                ruleRepository.updateRule(rule)
                _userMessage.value = "Rule '${rule.name}' updated"
            }
        }
    }

    fun deleteRule(rule: DispatchRule) {
        viewModelScope.launch {
            ruleRepository.deleteRule(rule.id)
            _userMessage.value = "Rule '${rule.name}' deleted"
        }
    }

    fun reorderPriority(rule: DispatchRule, newPriority: Int) {
        viewModelScope.launch {
            ruleRepository.updateRulePriority(rule.id, newPriority)
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
