package com.misscall.whatsappassistant.presentation.templates

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.misscall.whatsappassistant.domain.model.MessageTemplate
import com.misscall.whatsappassistant.domain.usecase.GetTemplatesUseCase
import com.misscall.whatsappassistant.domain.usecase.ManageTemplatesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TemplatesViewModel @Inject constructor(
    getTemplatesUseCase: GetTemplatesUseCase,
    private val manageTemplatesUseCase: ManageTemplatesUseCase
) : ViewModel() {

    private val _userMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<TemplatesUiState> = combine(
        getTemplatesUseCase.getAll(),
        getTemplatesUseCase.getDefault(),
        _userMessage
    ) { templates, defaultTmpl, msg ->
        TemplatesUiState(
            templates = templates,
            defaultTemplate = defaultTmpl,
            userMessage = msg
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = TemplatesUiState(isLoading = true)
    )

    fun createTemplate(name: String, content: String, isDefault: Boolean) {
        viewModelScope.launch {
            manageTemplatesUseCase.createTemplate(name, content, isDefault)
            _userMessage.value = "Template \"$name\" created"
        }
    }

    fun updateTemplate(template: MessageTemplate) {
        viewModelScope.launch {
            manageTemplatesUseCase.updateTemplate(template)
            _userMessage.value = "Template \"${template.name}\" updated"
        }
    }

    fun setDefault(id: Long) {
        viewModelScope.launch {
            manageTemplatesUseCase.setDefault(id)
            _userMessage.value = "Default template updated"
        }
    }

    fun deleteTemplate(id: Long) {
        viewModelScope.launch {
            manageTemplatesUseCase.delete(id)
            _userMessage.value = "Template deleted"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }
}
