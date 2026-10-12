package com.misscall.whatsappassistant.telephony;

import android.content.Context;
import android.os.Build;
import android.telephony.SmsManager;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.util.Log;

import java.util.List;

public class SmsManagerHelper {
    private static final String TAG = "SmsManagerHelper";

    public static void sendSms(Context context, String destinationAddress, String message, int preferredSimSlot) {
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
                smsManager.sendTextMessage(destinationAddress, null, message, null, null);
                Log.i(TAG, "SMS successfully dispatched to: " + destinationAddress);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to send SMS to " + destinationAddress, e);
        }
    }
}
