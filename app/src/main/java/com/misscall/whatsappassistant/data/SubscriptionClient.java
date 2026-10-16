package com.misscall.whatsappassistant.data;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Robust Client for Anonymous Device Subscription & Entitlement.
 * Features:
 * - 3-day server-tracked free trial on first launch
 * - Razorpay ₹100/mo subscription creation and HMAC verification
 * - 3-day local cache fallback for offline missed-call SMS execution
 * - Specific user-facing error reporting with retry handling
 */
public class SubscriptionClient {
    private static final String TAG = "SubscriptionClient";
    private static final String PREFS_NAME = "misscall_prefs";
    private static final String KEY_DEVICE_ID = "anonymous_device_id";
    private static final String KEY_AUTH_TOKEN = "device_auth_token";
    private static final String KEY_SUBSCRIPTION_STATUS = "subscription_status";
    private static final String KEY_VALID_UNTIL = "subscription_valid_until";
    private static final String KEY_TRIAL_DAYS = "trial_days_remaining";
    private static final String KEY_LAST_VERIFIED = "last_verified_timestamp";
    private static final String KEY_SUB_ID = "razorpay_sub_id";

    // Primary Vercel production server URL with local fallback
    private static final String DEFAULT_BASE_URL = "https://web-dashboard-eight-mu.vercel.app";

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    public static class SubscriptionState {
        public boolean isEntitled; // True if active or within trial
        public String status;      // "trial", "active", "expired", "none"
        public long validUntil;
        public int trialDaysRemaining;
        public String subscriptionId;
        public String keyId;
        public String shortUrl;
        public String message;
        public String errorCode;

        public SubscriptionState(boolean isEntitled, String status, String message) {
            this.isEntitled = isEntitled;
            this.status = status;
            this.message = message;
        }
    }

    public interface SubscriptionCallback {
        void onSuccess(SubscriptionState state);
        void onError(String userFriendlyMessage, String errorCode);
    }

    public static String getOrCreateDeviceId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String deviceId = prefs.getString(KEY_DEVICE_ID, null);
        if (deviceId == null || deviceId.isEmpty()) {
            deviceId = "dev_" + UUID.randomUUID().toString();
            prefs.edit().putString(KEY_DEVICE_ID, deviceId).apply();
        }
        return deviceId;
    }

    public static String getBaseUrl(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString("custom_backend_url", DEFAULT_BASE_URL).replaceAll("/+$", "");
    }

    public static boolean isNetworkAvailable(Context context) {
        try {
            ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            NetworkInfo active = cm.getActiveNetworkInfo();
            return active != null && active.isConnected();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Checks if device is entitled to run missed-call SMS automation.
     * Evaluates live status or falls back to 3-day offline cache.
     */
    public static boolean isEntitled(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String status = prefs.getString(KEY_SUBSCRIPTION_STATUS, "none");
        long validUntil = prefs.getLong(KEY_VALID_UNTIL, 0);
        long lastVerified = prefs.getLong(KEY_LAST_VERIFIED, 0);
        long now = System.currentTimeMillis();

        if ("active".equalsIgnoreCase(status) && validUntil > now) {
            return true;
        }
        if ("trial".equalsIgnoreCase(status) && validUntil > now) {
            return true;
        }

        // 3-day offline grace period cache
        if (("active".equalsIgnoreCase(status) || "trial".equalsIgnoreCase(status)) && (now - lastVerified < 3 * 24 * 60 * 60 * 1000L)) {
            return true;
        }

        return false;
    }

    /**
     * Authenticates anonymous device and initializes 3-day trial on first launch.
     */
    public static void authenticateDevice(final Context context, final SubscriptionCallback callback) {
        final String deviceId = getOrCreateDeviceId(context);

        if (!isNetworkAvailable(context)) {
            // Read from local cache
            boolean entitled = isEntitled(context);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SubscriptionState cached = new SubscriptionState(
                entitled,
                prefs.getString(KEY_SUBSCRIPTION_STATUS, "none"),
                "Offline Mode: using cached subscription status"
            );
            cached.validUntil = prefs.getLong(KEY_VALID_UNTIL, 0);
            cached.trialDaysRemaining = prefs.getInt(KEY_TRIAL_DAYS, 0);
            if (callback != null) callback.onSuccess(cached);
            return;
        }

        executor.execute(() -> {
            try {
                String baseUrl = getBaseUrl(context);
                URL url = new URL(baseUrl + "/api/auth/device");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);
                conn.setDoOutput(true);

                JSONObject req = new JSONObject();
                req.put("deviceId", deviceId);
                req.put("appSignature", "misscall_assistant_v1");

                byte[] out = req.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(out);
                }

                int code = conn.getResponseCode();
                String responseBody = readStream(conn, code);

                if (code == 200) {
                    JSONObject res = new JSONObject(responseBody);
                    String token = res.optString("token", "");
                    String status = res.optString("status", "trial");
                    long validUntil = res.optLong("validUntil", System.currentTimeMillis() + 3 * 86400000L);
                    int trialDays = res.optInt("trialDaysRemaining", 3);

                    SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                    editor.putString(KEY_AUTH_TOKEN, token);
                    editor.putString(KEY_SUBSCRIPTION_STATUS, status);
                    editor.putLong(KEY_VALID_UNTIL, validUntil);
                    editor.putInt(KEY_TRIAL_DAYS, trialDays);
                    editor.putLong(KEY_LAST_VERIFIED, System.currentTimeMillis());
                    editor.apply();

                    boolean entitled = "active".equalsIgnoreCase(status) || "trial".equalsIgnoreCase(status);
                    SubscriptionState state = new SubscriptionState(entitled, status, res.optString("message", ""));
                    state.validUntil = validUntil;
                    state.trialDaysRemaining = trialDays;

                    postSuccess(callback, state);
                } else {
                    postError(callback, "Server responded with status " + code + ". Please retry.", "SERVER_ERROR_" + code);
                }
            } catch (Exception e) {
                Log.e(TAG, "Device authentication error", e);
                postError(callback, "Cannot connect to server. Check your internet connection.", "NO_INTERNET");
            }
        });
    }

    /**
     * Registers business on first launch via POST /api/register
     * Stores JWT token and initial status (registered_unpaid).
     */
    public static void registerBusiness(
        final Context context,
        final String businessName,
        final String phone,
        final String fcmToken,
        final SubscriptionCallback callback
    ) {
        final String deviceId = getOrCreateDeviceId(context);

        if (!isNetworkAvailable(context)) {
            postError(callback, "No internet connection: Please turn on mobile data or Wi-Fi to register.", "NO_INTERNET");
            return;
        }

        executor.execute(() -> {
            try {
                String baseUrl = getBaseUrl(context);
                URL url = new URL(baseUrl + "/api/register");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);
                conn.setDoOutput(true);

                JSONObject req = new JSONObject();
                req.put("deviceId", deviceId);
                req.put("businessName", businessName);
                req.put("phone", phone);
                if (fcmToken != null && !fcmToken.isEmpty()) {
                    req.put("fcmToken", fcmToken);
                }

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(req.toString().getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                String responseBody = readStream(conn, code);

                if (code == 200) {
                    JSONObject res = new JSONObject(responseBody);
                    String token = res.optString("token", "");
                    String status = res.optString("status", "registered_unpaid");

                    SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                    editor.putString(KEY_AUTH_TOKEN, token);
                    editor.putString(KEY_SUBSCRIPTION_STATUS, status);
                    editor.putString("business_name", businessName);
                    editor.putString("business_phone", phone);
                    editor.putBoolean("business_registered", true);
                    editor.putLong(KEY_LAST_VERIFIED, System.currentTimeMillis());
                    editor.apply();

                    boolean entitled = "active".equalsIgnoreCase(status) || "trial".equalsIgnoreCase(status);
                    SubscriptionState state = new SubscriptionState(entitled, status, "Business registered successfully");
                    postSuccess(callback, state);
                } else {
                    postError(callback, "Registration failed (" + code + "). Please retry.", "REGISTER_ERROR_" + code);
                }
            } catch (Exception e) {
                Log.e(TAG, "Business registration error", e);
                postError(callback, "Could not reach registration server. Check network connection.", "NETWORK_ERROR");
            }
        });
    }

    /**
     * Checks subscription status via GET /api/status (or /api/subscription/status)
     */
    public static void checkStatus(final Context context, final SubscriptionCallback callback) {
        final String deviceId = getOrCreateDeviceId(context);

        if (!isNetworkAvailable(context)) {
            boolean entitled = isEntitled(context);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SubscriptionState cached = new SubscriptionState(
                entitled,
                prefs.getString(KEY_SUBSCRIPTION_STATUS, "none"),
                "Offline Mode: using cached subscription status"
            );
            cached.validUntil = prefs.getLong(KEY_VALID_UNTIL, 0);
            cached.trialDaysRemaining = prefs.getInt(KEY_TRIAL_DAYS, 0);
            if (callback != null) callback.onSuccess(cached);
            return;
        }

        executor.execute(() -> {
            try {
                String baseUrl = getBaseUrl(context);
                URL url = new URL(baseUrl + "/api/subscription/status?deviceId=" + deviceId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                int code = conn.getResponseCode();
                String responseBody = readStream(conn, code);

                if (code == 200) {
                    JSONObject res = new JSONObject(responseBody);
                    String status = res.optString("status", "none");
                    long validUntil = res.optLong("validUntil", 0);
                    int trialDays = res.optInt("trialDaysRemaining", 0);
                    String subId = res.optString("subscriptionId", "");

                    SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();
                    editor.putString(KEY_SUBSCRIPTION_STATUS, status);
                    editor.putLong(KEY_VALID_UNTIL, validUntil);
                    editor.putInt(KEY_TRIAL_DAYS, trialDays);
                    if (!subId.isEmpty()) editor.putString(KEY_SUB_ID, subId);
                    editor.putLong(KEY_LAST_VERIFIED, System.currentTimeMillis());
                    editor.apply();

                    boolean entitled = "active".equalsIgnoreCase(status) || "trial".equalsIgnoreCase(status);
                    SubscriptionState state = new SubscriptionState(entitled, status, res.optString("message", ""));
                    state.validUntil = validUntil;
                    state.trialDaysRemaining = trialDays;
                    state.subscriptionId = subId;

                    postSuccess(callback, state);
                } else {
                    postError(callback, "Subscription status check returned code " + code, "STATUS_CHECK_FAILED");
                }
            } catch (Exception e) {
                Log.e(TAG, "Subscription status check error", e);
                postError(callback, "Could not check subscription status. Check network connection.", "NETWORK_UNAVAILABLE");
            }
        });
    }

    /**
     * Prepares subscription and returns subscription_id + key_id for Razorpay Checkout.
     */
    public static void createSubscription(final Context context, final SubscriptionCallback callback) {
        if (!isNetworkAvailable(context)) {
            postError(callback, "No internet connection: Please connect to Wi-Fi or mobile data to subscribe.", "NO_INTERNET");
            return;
        }

        executor.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String token = prefs.getString(KEY_AUTH_TOKEN, null);

                // If token missing, register device first
                if (token == null || token.isEmpty()) {
                    String deviceId = getOrCreateDeviceId(context);
                    String baseUrl = getBaseUrl(context);
                    URL authUrl = new URL(baseUrl + "/api/auth/device");
                    HttpURLConnection authConn = (HttpURLConnection) authUrl.openConnection();
                    authConn.setRequestMethod("POST");
                    authConn.setRequestProperty("Content-Type", "application/json");
                    authConn.setDoOutput(true);
                    JSONObject req = new JSONObject();
                    req.put("deviceId", deviceId);
                    try (OutputStream os = authConn.getOutputStream()) {
                        os.write(req.toString().getBytes(StandardCharsets.UTF_8));
                    }
                    if (authConn.getResponseCode() == 200) {
                        JSONObject authRes = new JSONObject(readStream(authConn, 200));
                        token = authRes.optString("token", "");
                        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply();
                    }
                }

                String baseUrl = getBaseUrl(context);
                URL url = new URL(baseUrl + "/api/subscription/create");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                if (token != null && !token.isEmpty()) {
                    conn.setRequestProperty("Authorization", "Bearer " + token);
                }
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write("{}".getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                String responseBody = readStream(conn, code);

                if (code == 200) {
                    JSONObject res = new JSONObject(responseBody);
                    String subId = res.optString("subscription_id", "");
                    String keyId = res.optString("key_id", "");
                    String shortUrl = res.optString("short_url", "https://rzp.io/rzp/DCET6eO8");

                    SubscriptionState state = new SubscriptionState(false, "PAYMENT_PENDING", "Checkout initiated");
                    state.subscriptionId = subId;
                    state.keyId = keyId;
                    state.shortUrl = shortUrl;

                    prefs.edit().putString(KEY_SUB_ID, subId).apply();
                    postSuccess(callback, state);
                } else {
                    postError(callback, "Subscription creation failed (" + code + "). Server is busy, please retry.", "CREATE_FAILED_" + code);
                }
            } catch (Exception e) {
                Log.e(TAG, "Create subscription error", e);
                postError(callback, "Could not reach payment gateway: " + e.getMessage(), "GATEWAY_TIMEOUT");
            }
        });
    }

    /**
     * Verifies payment completion using HMAC-SHA256 signature on backend.
     */
    public static void verifyPayment(
        final Context context,
        final String paymentId,
        final String subscriptionId,
        final String signature,
        final SubscriptionCallback callback
    ) {
        if (!isNetworkAvailable(context)) {
            postError(callback, "No internet connection: Please connect to verify your payment.", "NO_INTERNET");
            return;
        }

        executor.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String token = prefs.getString(KEY_AUTH_TOKEN, "");
                String deviceId = getOrCreateDeviceId(context);

                String baseUrl = getBaseUrl(context);
                URL url = new URL(baseUrl + "/api/subscription/verify");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                if (!token.isEmpty()) {
                    conn.setRequestProperty("Authorization", "Bearer " + token);
                }
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                JSONObject req = new JSONObject();
                req.put("deviceId", deviceId);
                req.put("razorpay_payment_id", paymentId);
                req.put("razorpay_subscription_id", subscriptionId);
                req.put("razorpay_signature", signature);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(req.toString().getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                String responseBody = readStream(conn, code);

                if (code == 200) {
                    JSONObject res = new JSONObject(responseBody);
                    long validUntil = res.optLong("validUntil", System.currentTimeMillis() + 30 * 86400000L);

                    SharedPreferences.Editor editor = prefs.edit();
                    editor.putString(KEY_SUBSCRIPTION_STATUS, "active");
                    editor.putLong(KEY_VALID_UNTIL, validUntil);
                    editor.putLong(KEY_LAST_VERIFIED, System.currentTimeMillis());
                    editor.putString(KEY_SUB_ID, subscriptionId);
                    editor.apply();

                    SubscriptionState state = new SubscriptionState(true, "active", "Pro Subscription active for ₹100/mo");
                    state.validUntil = validUntil;
                    state.subscriptionId = subscriptionId;
                    postSuccess(callback, state);
                } else {
                    postError(callback, "Verification failed (" + code + "): Payment recorded, tap Check Status to update.", "VERIFICATION_REJECTED");
                }
            } catch (Exception e) {
                Log.e(TAG, "Verify payment error", e);
                postError(callback, "Verification request failed: " + e.getMessage(), "NETWORK_ERROR");
            }
        });
    }

    private static String readStream(HttpURLConnection conn, int code) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(
            code < 400 ? conn.getInputStream() : conn.getErrorStream(),
            StandardCharsets.UTF_8
        ));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }

    private static void postSuccess(final SubscriptionCallback callback, final SubscriptionState state) {
        if (callback != null) {
            mainHandler.post(() -> callback.onSuccess(state));
        }
    }

    private static void postError(final SubscriptionCallback callback, final String msg, final String code) {
        if (callback != null) {
            mainHandler.post(() -> callback.onError(msg, code));
        }
    }
}
