package com.misscall.whatsappassistant.telephony;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Robust in-memory scheduler for delayed MissCall SMS follow-ups.
 * Enforces delay (2s/5s/10s), subscription validity, deduplication,
 * and immediate cancellation if an outgoing call is detected.
 */
public class PendingSmsScheduler {
    private static final String TAG = "PendingSmsScheduler";
    private static final PendingSmsScheduler INSTANCE = new PendingSmsScheduler();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Map<String, Runnable> scheduledTasks = new ConcurrentHashMap<>();
    private final Map<String, Long> lastProcessedTimestamps = new ConcurrentHashMap<>();

    private PendingSmsScheduler() {}

    public static PendingSmsScheduler getInstance() {
        return INSTANCE;
    }

    /**
     * Schedule a delayed SMS follow-up for a genuine missed call.
     */
    public synchronized void schedule(final Context context, final String rawNumber) {
        if (rawNumber == null || rawNumber.trim().isEmpty()) {
            Log.w(TAG, "Cannot schedule SMS for empty phone number");
            return;
        }

        final String cleanNumber = rawNumber.trim();

        // 1. Deduplication: Prevent duplicate SMS within 30 seconds for the same caller
        Long lastTime = lastProcessedTimestamps.get(cleanNumber);
        long now = System.currentTimeMillis();
        if (lastTime != null && (now - lastTime) < 30000) {
            Log.i(TAG, "Duplicate missed call ignored within debounce window for: " + cleanNumber);
            return;
        }

        // Cancel any existing pending task for this number
        cancel(cleanNumber);

        final SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);

        // 2. Check Automation Switch
        boolean autoReplyEnabled = prefs.getBoolean("auto_reply_enabled", true);
        if (!autoReplyEnabled) {
            Log.i(TAG, "Auto-reply is toggled OFF. Skipping SMS scheduling.");
            return;
        }

        // 3. Check Subscription Status (Backend Authorized)
        boolean isSubscribed = prefs.getBoolean("is_subscription_active", false);
        long subExpiry = prefs.getLong("subscription_expiry_time", 0);
        if (!isSubscribed || (subExpiry > 0 && System.currentTimeMillis() > subExpiry)) {
            Log.w(TAG, "Active subscription required to send automated SMS. Task aborted.");
            return;
        }

        // 4. Retrieve Configured Delay (Default 5s)
        int delaySeconds = prefs.getInt("sms_delay_seconds", 5);
        if (delaySeconds != 2 && delaySeconds != 5 && delaySeconds != 10) {
            delaySeconds = 5;
        }

        Log.i(TAG, "Scheduling SMS to " + cleanNumber + " with delay: " + delaySeconds + "s");

        Runnable task = new Runnable() {
            @Override
            public void run() {
                scheduledTasks.remove(cleanNumber);

                // Re-verify automation & subscription immediately before dispatch
                boolean stillEnabled = prefs.getBoolean("auto_reply_enabled", true);
                boolean stillSubscribed = prefs.getBoolean("is_subscription_active", false);
                long currentExpiry = prefs.getLong("subscription_expiry_time", 0);

                if (!stillEnabled) {
                    Log.i(TAG, "Automation disabled during delay window. Cancelled send to " + cleanNumber);
                    return;
                }
                if (!stillSubscribed || (currentExpiry > 0 && System.currentTimeMillis() > currentExpiry)) {
                    Log.w(TAG, "Subscription became inactive during delay window. Cancelled send to " + cleanNumber);
                    return;
                }

                String businessName = prefs.getString("business_name", "My Store");
                String template = prefs.getString(
                    "sms_template",
                    "Hello! Sorry we missed your call from " + businessName + ". How can we help you today?"
                );

                // Replace dynamic token placeholders if present
                String finalMessage = template.replace("{{business_name}}", businessName);

                int simSlot = prefs.getInt("selected_sim_slot", 0);

                Log.i(TAG, "Executing native SMS dispatch to " + cleanNumber + " via SIM slot " + (simSlot + 1));
                SmsManagerHelper.sendSms(context, cleanNumber, finalMessage, simSlot);
                lastProcessedTimestamps.put(cleanNumber, System.currentTimeMillis());
            }
        };

        scheduledTasks.put(cleanNumber, task);
        handler.postDelayed(task, delaySeconds * 1000L);
    }

    /**
     * Cancel scheduled SMS if the user returns the call or texts manually.
     */
    public synchronized void cancel(String rawNumber) {
        if (rawNumber == null) return;
        String cleanNumber = rawNumber.trim();
        Runnable task = scheduledTasks.remove(cleanNumber);
        if (task != null) {
            handler.removeCallbacks(task);
            Log.i(TAG, "Cancelled pending SMS for: " + cleanNumber + " (user initiated callback or manual cancel)");
        }
    }

    /**
     * Cancel all pending SMS tasks (e.g. when automation is toggled off).
     */
    public synchronized void cancelAll() {
        for (Runnable r : scheduledTasks.values()) {
            handler.removeCallbacks(r);
        }
        scheduledTasks.clear();
        Log.i(TAG, "All pending SMS tasks cancelled.");
    }
}
