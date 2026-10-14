package com.misscall.whatsappassistant.telephony;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.TelephonyManager;
import android.util.Log;

/**
 * Reliable BroadcastReceiver for phone state transitions.
 * Accurately distinguishes between answered calls and genuine missed calls,
 * drops unknown/private callers, and cancels scheduled follow-ups if the user
 * immediately calls back.
 */
public class PhoneCallReceiver extends BroadcastReceiver {
    private static final String TAG = "PhoneCallReceiver";

    private static int lastState = TelephonyManager.CALL_STATE_IDLE;
    private static boolean isIncoming = false;
    private static boolean isAnswered = false;
    private static String incomingNumber = "";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        if (TelephonyManager.ACTION_PHONE_STATE_CHANGED.equals(intent.getAction())) {
            String stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
            String number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);

            if (number != null && !number.trim().isEmpty()) {
                incomingNumber = number.trim();
            }

            int state = TelephonyManager.CALL_STATE_IDLE;
            if (TelephonyManager.EXTRA_STATE_RINGING.equals(stateStr)) {
                state = TelephonyManager.CALL_STATE_RINGING;
            } else if (TelephonyManager.EXTRA_STATE_OFFHOOK.equals(stateStr)) {
                state = TelephonyManager.CALL_STATE_OFFHOOK;
            }

            onCallStateChanged(context, state, incomingNumber);
        }
    }

    private void onCallStateChanged(Context context, int state, String number) {
        if (lastState == state) {
            return;
        }

        switch (state) {
            case TelephonyManager.CALL_STATE_RINGING:
                isIncoming = true;
                isAnswered = false;
                if (number != null && !number.isEmpty()) {
                    incomingNumber = number;
                }
                Log.d(TAG, "Incoming call ringing from: " + incomingNumber);
                break;

            case TelephonyManager.CALL_STATE_OFFHOOK:
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    // Call was answered by user
                    isAnswered = true;
                    Log.d(TAG, "Incoming call was answered. No missed call follow-up required.");
                } else if (lastState == TelephonyManager.CALL_STATE_IDLE) {
                    // Outgoing call started! If user is calling back, cancel any scheduled SMS
                    if (number != null && !number.isEmpty()) {
                        PendingSmsScheduler.getInstance().cancel(number);
                    }
                }
                break;

            case TelephonyManager.CALL_STATE_IDLE:
                // Call ended or finished ringing
                if (lastState == TelephonyManager.CALL_STATE_RINGING && isIncoming && !isAnswered) {
                    // Genuine missed call detected!
                    handleGenuineMissedCall(context, incomingNumber);
                }
                isIncoming = false;
                isAnswered = false;
                incomingNumber = "";
                break;
        }

        lastState = state;
    }

    private void handleGenuineMissedCall(Context context, String number) {
        if (number == null || number.trim().isEmpty()) {
            Log.i(TAG, "Missed call with unknown or empty number. Ignored.");
            return;
        }

        String clean = number.trim();
        // Ignore private/hidden callers
        if (clean.equalsIgnoreCase("Private") || clean.equalsIgnoreCase("Unknown") ||
            clean.equals("-1") || clean.equals("-2") || clean.length() < 5) {
            Log.i(TAG, "Private or restricted caller number: " + clean + ". Skipped.");
            return;
        }

        Log.i(TAG, "Genuine missed call identified from: " + clean + ". Submitting to scheduler.");
        PendingSmsScheduler.getInstance().schedule(context, clean);
    }
}
