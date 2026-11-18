package com.misscall.whatsappassistant.telephony;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import com.misscall.whatsappassistant.data.SubscriptionClient;
import com.misscall.whatsappassistant.security.AndroidSecurityManager;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Robust in-memory scheduler for delayed MissCall SMS follow-ups.
 * Enforces delay (2s/5s/10s), subscription entitlement, deduplication,
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
        // Rule 7 (SEC-07-E164-SANITIZER): Strict E.164 phone sanitization & toll-fraud prevention
        final String cleanNumber = AndroidSecurityManager.sanitizeAndValidatePhoneNumber(rawNumber);
        if (cleanNumber == null) {
            Log.w(TAG, "SEC-07: Rejected invalid or dangerous phone number: " + rawNumber);
            return;
        }

        // Rule 6 (SEC-06-SMS-RATE-LIMIT): Anti-toll-fraud circuit breaker & rate-limiting
        if (!AndroidSecurityManager.isSmsRateLimitAllowed(context, cleanNumber)) {
            Log.w(TAG, "SEC-06: Rate limit circuit breaker active. Suppressed auto-SMS for: " + cleanNumber);
            return;
        }

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

        // 3. Check Subscription Status (Entitled via Active Plan or 14-Day Free Trial / Offline Grace)
        if (!SubscriptionClient.isEntitled(context)) {
            Log.w(TAG, "Active subscription or 14-day trial required to send automated SMS. Task aborted.");
            return;
        }

        // 4. Retrieve Configured Delay (2s, 5s, or 10s; default 5s)
        int delaySeconds = prefs.getInt("sms_delay_seconds", 5);
        if (delaySeconds != 2 && delaySeconds != 5 && delaySeconds != 10) {
            delaySeconds = 5;
        }

        Log.i(TAG, "Scheduling SMS to " + cleanNumber + " with delay: " + delaySeconds + "s");

        // Keep CPU active during delay countdown if screen is turned off
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            try {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "misscall:sms_delay_lock");
                wakeLock.acquire((delaySeconds + 8) * 1000L);
            } catch (Exception ignored) {}
        }
        final PowerManager.WakeLock activeLock = wakeLock;

        Runnable task = new Runnable() {
            @Override
            public void run() {
                try {
                    scheduledTasks.remove(cleanNumber);

                    // Re-verify automation & subscription immediately before dispatch
                    boolean stillEnabled = prefs.getBoolean("auto_reply_enabled", true);
                    if (!stillEnabled) {
                        Log.i(TAG, "Automation disabled during delay window. Cancelled send to " + cleanNumber);
                        return;
                    }
                    if (!SubscriptionClient.isEntitled(context)) {
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
                } finally {
                    if (activeLock != null && activeLock.isHeld()) {
                        try {
                            activeLock.release();
                        } catch (Exception ignored) {}
                    }
                }
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
