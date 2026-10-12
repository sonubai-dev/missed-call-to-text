package com.misscall.whatsappassistant.telephony;

import android.os.Build;
import android.telecom.Call;
import android.content.Context;
import android.content.SharedPreferences;
import android.telephony.SmsManager;
import android.util.Log;

public class CallScreeningService extends android.telecom.CallScreeningService {
    private static final String TAG = "CallScreeningService";

    @Override
    public void onScreenCall(Call.Details callDetails) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            String phoneNumber = "";
            if (callDetails.getHandle() != null) {
                phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
            }

            Log.d(TAG, "Screening call from: " + phoneNumber);

            // Allow call to ring normally
            CallResponse.Builder responseBuilder = new CallResponse.Builder();
            responseBuilder.setDisallowCall(false);
            responseBuilder.setRejectCall(false);
            responseBuilder.setSilenceCall(false);
            responseBuilder.setSkipCallLog(false);
            responseBuilder.setSkipNotification(false);

            respondToCall(callDetails, responseBuilder.build());
        }
    }
}
