package com.misscall.whatsappassistant.notifications.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.misscall.whatsappassistant.core.util.Constants
import com.misscall.whatsappassistant.domain.model.FollowUpSuggestionStatus
import com.misscall.whatsappassistant.domain.model.WhatsAppFollowUpStatus
import com.misscall.whatsappassistant.domain.repository.CallEventRepository
import com.misscall.whatsappassistant.domain.repository.FollowUpSuggestionRepository
import com.misscall.whatsappassistant.domain.usecase.SendWhatsAppMessageUseCase
import com.misscall.whatsappassistant.notifications.NotificationHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class NotificationActionReceiver : BroadcastReceiver() {

    @Inject
    lateinit var sendWhatsAppMessageUseCase: SendWhatsAppMessageUseCase

    @Inject
    lateinit var callEventRepository: CallEventRepository

    @Inject
    lateinit var followUpSuggestionRepository: FollowUpSuggestionRepository

    @Inject
    lateinit var notificationHelper: NotificationHelper

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val callEventId = intent.getLongExtra(Constants.EXTRA_CALL_EVENT_ID, -1L).takeIf { it != -1L }
        val phoneNumber = intent.getStringExtra(Constants.EXTRA_PHONE_NUMBER) ?: ""
        val messageText = intent.getStringExtra(Constants.EXTRA_MESSAGE_TEXT) ?: ""
        val notificationId = intent.getIntExtra(Constants.EXTRA_NOTIFICATION_ID, 0)

        // Dismiss notification
        if (notificationId != 0) {
            notificationHelper.cancelNotification(notificationId)
        }

        when (action) {
            Constants.ACTION_SEND_NOW -> {
                if (phoneNumber.isNotEmpty() && messageText.isNotEmpty()) {
                    val pendingResult = goAsync()
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            sendWhatsAppMessageUseCase(
                                callEventId = callEventId,
                                phoneNumber = phoneNumber,
                                messageContent = messageText
                            )
                        } finally {
                            pendingResult.finish()
                        }
                    }
                }
            }
            Constants.ACTION_IGNORE -> {
                if (callEventId != null) {
                    val pendingResult = goAsync()
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            callEventRepository.updateWhatsAppStatus(callEventId, WhatsAppFollowUpStatus.IGNORED)
                            callEventRepository.markProcessed(callEventId, true)
                            followUpSuggestionRepository.updateStatusByCallEventId(callEventId, FollowUpSuggestionStatus.IGNORED)
                        } finally {
                            pendingResult.finish()
                        }
                    }
                }
            }
        }
    }
}
