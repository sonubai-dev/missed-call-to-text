package com.misscall.assistant.telephony;

import android.content.Context;
import android.os.Build;
import android.telephony.SmsManager;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.util.Log;

import com.misscall.assistant.security.AndroidSecurityManager;

import java.util.ArrayList;
import java.util.List;

public class SmsManagerHelper {
    private static final String TAG = "SmsManagerHelper";

    public static void sendSms(Context context, String destinationAddress, String message, int preferredSimSlot) {
        if (!com.misscall.assistant.data.SubscriptionClient.isEntitled(context)) {
            Log.w(TAG, "SMS dispatch blocked: Active subscription or 14-day trial is required.");
            return;
        }

        // Rule 7: Sanitize and validate recipient phone number
        final String cleanDestination = AndroidSecurityManager.sanitizeAndValidatePhoneNumber(destinationAddress);
        if (cleanDestination == null) {
            Log.e(TAG, "SEC-07: Aborted SMS send: Invalid or blocked destination address: " + destinationAddress);
            return;
        }

        // Rule 7B: Sanitize SMS content
        final String safeMessage = AndroidSecurityManager.sanitizeMessageContent(message);
        if (safeMessage.isEmpty()) {
            Log.w(TAG, "SEC-07: Aborted SMS send: Message content is empty after sanitization.");
            return;
        }

        try {
            SmsManager smsManager = null;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SubscriptionManager subManager = (SubscriptionManager) context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
                if (subManager != null) {
                    try {
                        List<SubscriptionInfo> subList = subManager.getActiveSubscriptionInfoList();
                        if (subList != null && !subList.isEmpty()) {
                            SubscriptionInfo targetSub = null;
                            for (SubscriptionInfo info : subList) {
                                if (info.getSimSlotIndex() == preferredSimSlot) {
                                    targetSub = info;
                                    break;
                                }
                            }
                            if (targetSub == null) {
                                targetSub = subList.get(0);
                            }
                            smsManager = SmsManager.getSmsManagerForSubscriptionId(targetSub.getSubscriptionId());
                        }
                    } catch (SecurityException e) {
                        Log.e(TAG, "No permission to access SubscriptionManager", e);
                    }
                }
            }

            if (smsManager == null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    smsManager = context.getSystemService(SmsManager.class);
                } else {
                    smsManager = SmsManager.getDefault();
                }
            }

            if (smsManager != null) {
                ArrayList<String> parts = smsManager.divideMessage(safeMessage);
                if (parts != null && parts.size() > 1) {
                    smsManager.sendMultipartTextMessage(cleanDestination, null, parts, null, null);
                    Log.i(TAG, "Multipart SMS (" + parts.size() + " parts) successfully dispatched to: " + cleanDestination);
                } else {
                    smsManager.sendTextMessage(cleanDestination, null, safeMessage, null, null);
                    Log.i(TAG, "Single SMS successfully dispatched to: " + cleanDestination);
                }
                // Record rate limit consumption
                AndroidSecurityManager.recordSmsDispatched(cleanDestination);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to send SMS to " + cleanDestination, e);
        }
    }
}
