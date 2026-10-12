package com.misscall.whatsappassistant.telephony;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.telephony.TelephonyManager;
import android.util.Log;

public class PhoneCallReceiver extends BroadcastReceiver {
    private static final String TAG = "PhoneCallReceiver";
    private static int lastState = TelephonyManager.CALL_STATE_IDLE;
    private static boolean isIncoming = false;
    private static String savedNumber = "";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        if (intent.getAction().equals(TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {
            String stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
            String number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
            if (number != null && !number.isEmpty()) {
                savedNumber = number;
            }

            int state = TelephonyManager.CALL_STATE_IDLE;
            if (TelephonyManager.EXTRA_STATE_RINGING.equals(stateStr)) {
                state = TelephonyManager.CALL_STATE_RINGING;
            } else if (TelephonyManager.EXTRA_STATE_OFFHOOK.equals(stateStr)) {
                state = TelephonyManager.CALL_STATE_OFFHOOK;
            }

            onCallStateChanged(context, state, savedNumber);
        }
    }

    private void onCallStateChanged(Context context, int state, String number) {
        if (lastState == state) {
            return;
        }

        switch (state) {
            case TelephonyManager.CALL_STATE_RINGING:
                isIncoming = true;
                break;
            case TelephonyManager.CALL_STATE_OFFHOOK:
                // Call answered
                break;
            case TelephonyManager.CALL_STATE_IDLE:
                // Call ended or missed
                if (lastState == TelephonyManager.CALL_STATE_RINGING && isIncoming) {
                    // Missed call detected!
                    Log.i(TAG, "Missed call detected from: " + number);
                    handleMissedCall(context, number);
                }
                isIncoming = false;
                break;
        }
        lastState = state;
    }

    private void handleMissedCall(Context context, String number) {
        if (number == null || number.isEmpty()) return;

        SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
        boolean isAutoReplyEnabled = prefs.getBoolean("auto_reply_enabled", true);
        if (!isAutoReplyEnabled) return;

        String businessName = prefs.getString("business_name", "Our Business");
        String messageTemplate = prefs.getString(
            "sms_template",
            "Hello! Sorry we missed your call from " + businessName + ". How can we assist you today?"
        );

        int simSlot = prefs.getInt("selected_sim_slot", 0);
        SmsManagerHelper.sendSms(context, number, messageTemplate, simSlot);
    }
}
