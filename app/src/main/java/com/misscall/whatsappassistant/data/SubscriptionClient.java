package com.misscall.whatsappassistant.data;

import android.content.Context;
import android.content.SharedPreferences;
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
 * Authoritative client for device-linked Razorpay subscription verification.
 * Communicates with the backend REST API without trusting insecure local overrides.
 */
public class SubscriptionClient {
    private static final String TAG = "SubscriptionClient";

    // Configurable backend base URL (points to production or dev API proxy)
    public static final String DEFAULT_BASE_URL = "https://web-dashboard-eight-mu.vercel.app";

    public interface SubscriptionCallback {
        void onSuccess(SubscriptionState state);
        void onError(String message);
    }

    public static class SubscriptionState {
        public boolean isActive;
        public String status; // "ACTIVE", "PAYMENT_REQUIRED", "EXPIRED", "VERIFICATION_PENDING"
        public String subscriptionId;
        public String message;
        public long expiryTime;
        public String checkoutUrl;
        public String keyId;

        public SubscriptionState(boolean isActive, String status, String message) {
            this.isActive = isActive;
            this.status = status;
            this.message = message;
        }
    }

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    public static String getOrCreateDeviceId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
        String deviceId = prefs.getString("device_install_id", null);
        if (deviceId == null || deviceId.isEmpty()) {
            deviceId = "mc_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            prefs.edit().putString("device_install_id", deviceId).apply();
        }
        return deviceId;
    }

    public static String getBaseUrl(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
        return prefs.getString("backend_url", DEFAULT_BASE_URL);
    }

    /**
     * Check subscription status against backend with offline grace period check.
     */
    public static void checkStatus(final Context context, final SubscriptionCallback callback) {
        executor.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
                String token = prefs.getString("auth_token", null);
                String deviceId = getOrCreateDeviceId(context);
                String baseUrl = getBaseUrl(context);

                // If no token exists, perform device authentication first
                if (token == null) {
                    token = performDeviceAuth(context, baseUrl, deviceId);
                }

                if (token == null) {
                    // Check local cache with reasonable offline grace
                    boolean isSub = prefs.getBoolean("is_subscription_active", false);
                    long expiry = prefs.getLong("subscription_expiry_time", 0);
                    if (isSub && (expiry == 0 || System.currentTimeMillis() < expiry)) {
                        postSuccess(callback, new SubscriptionState(true, "ACTIVE", "Subscription active (Offline cache)"));
                        return;
                    }
                    postSuccess(callback, new SubscriptionState(false, "PAYMENT_REQUIRED", "Subscription required for automation"));
                    return;
                }

                // Call GET /api/v1/subscription/status
                URL url = new URL(baseUrl + "/api/v1/subscription/status");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                int code = conn.getResponseCode();
                if (code == 200) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) sb.append(line);
                    br.close();

                    JSONObject json = new JSONObject(sb.toString());
                    boolean active = json.optBoolean("active", false);
                    String status = json.optString("status", active ? "ACTIVE" : "PAYMENT_REQUIRED").toUpperCase();
                    String msg = json.optString("message", active ? "Subscription active" : "Payment required");
                    String subId = json.optString("subscription_id", "");
                    long currentEnd = json.optLong("current_end", 0);

                    long expiryMs = currentEnd > 0 ? (currentEnd * 1000L) : (System.currentTimeMillis() + (30L * 86400000L));

                    // Save authoritative state locally
                    prefs.edit()
                        .putBoolean("is_subscription_active", active)
                        .putString("subscription_status", status)
                        .putString("subscription_id", subId)
                        .putLong("subscription_expiry_time", expiryMs)
                        .apply();

                    SubscriptionState state = new SubscriptionState(active, status, msg);
                    state.subscriptionId = subId;
                    state.expiryTime = expiryMs;
                    postSuccess(callback, state);
                } else {
                    // Temporary network or server error: check grace period
                    boolean wasSub = prefs.getBoolean("is_subscription_active", false);
                    long expiry = prefs.getLong("subscription_expiry_time", 0);
                    if (wasSub && (expiry == 0 || System.currentTimeMillis() < expiry)) {
                        postSuccess(callback, new SubscriptionState(true, "ACTIVE", "Active (Offline grace period)"));
                    } else {
                        postSuccess(callback, new SubscriptionState(false, "PAYMENT_REQUIRED", "Subscription renewal required"));
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Subscription check failed", e);
                SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
                boolean wasSub = prefs.getBoolean("is_subscription_active", false);
                long expiry = prefs.getLong("subscription_expiry_time", 0);
                if (wasSub && (expiry == 0 || System.currentTimeMillis() < expiry)) {
                    postSuccess(callback, new SubscriptionState(true, "ACTIVE", "Active (Offline grace period)"));
                } else {
                    postSuccess(callback, new SubscriptionState(false, "PAYMENT_REQUIRED", "Offline. Subscription verification pending"));
                }
            }
        });
    }

    /**
     * Create a Razorpay ₹100/mo subscription on the backend.
     */
    public static void createSubscription(final Context context, final SubscriptionCallback callback) {
        executor.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
                String baseUrl = getBaseUrl(context);
                String deviceId = getOrCreateDeviceId(context);
                String token = prefs.getString("auth_token", null);

                if (token == null) {
                    token = performDeviceAuth(context, baseUrl, deviceId);
                }

                if (token == null) {
                    postError(callback, "Device authentication failed");
                    return;
                }

                URL url = new URL(baseUrl + "/api/v1/subscription/create");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                JSONObject payload = new JSONObject();
                payload.put("plan", "monthly_100");
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                BufferedReader br = new BufferedReader(new InputStreamReader(
                    code < 400 ? conn.getInputStream() : conn.getErrorStream(), StandardCharsets.UTF_8
                ));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);
                br.close();

                if (code == 201 || code == 200) {
                    JSONObject json = new JSONObject(sb.toString());
                    String subId = json.optString("subscriptionId", "");
                    String shortUrl = json.optString("shortUrl", "");
                    String keyId = json.optString("keyId", "");

                    SubscriptionState state = new SubscriptionState(false, "PAYMENT_REQUIRED", "Subscription created. Payment pending.");
                    state.subscriptionId = subId;
                    state.checkoutUrl = shortUrl;
                    state.keyId = keyId;

                    prefs.edit().putString("pending_subscription_id", subId).apply();
                    postSuccess(callback, state);
                } else {
                    postError(callback, "Subscription creation failed (" + code + "): " + sb.toString());
                }
            } catch (Exception e) {
                Log.e(TAG, "Create subscription error", e);
                postError(callback, "Network error: " + e.getMessage());
            }
        });
    }

    /**
     * Verify payment on server immediately following checkout completion.
     */
    public static void verifyPayment(final Context context, final String subscriptionId, final SubscriptionCallback callback) {
        executor.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
                String baseUrl = getBaseUrl(context);
                String token = prefs.getString("auth_token", null);

                URL url = new URL(baseUrl + "/api/v1/subscription/verify");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                JSONObject payload = new JSONObject();
                payload.put("subscriptionId", subscriptionId);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                BufferedReader br = new BufferedReader(new InputStreamReader(
                    code < 400 ? conn.getInputStream() : conn.getErrorStream(), StandardCharsets.UTF_8
                ));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);
                br.close();

                if (code == 200) {
                    JSONObject json = new JSONObject(sb.toString());
                    boolean active = json.optBoolean("active", false);
                    String status = json.optString("status", active ? "ACTIVE" : "INACTIVE").toUpperCase();

                    prefs.edit()
                        .putBoolean("is_subscription_active", active)
                        .putString("subscription_status", status)
                        .putString("subscription_id", subscriptionId)
                        .putLong("subscription_expiry_time", System.currentTimeMillis() + (30L * 86400000L))
                        .apply();

                    postSuccess(callback, new SubscriptionState(active, status, "Payment verified successfully!"));
                } else {
                    postError(callback, "Payment verification pending with payment gateway.");
                }
            } catch (Exception e) {
                Log.e(TAG, "Verify payment error", e);
                postError(callback, "Verification network error: " + e.getMessage());
            }
        });
    }

    private static String performDeviceAuth(Context context, String baseUrl, String deviceId) {
        try {
            SharedPreferences prefs = context.getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
            String businessName = prefs.getString("business_name", "My Store");

            URL url = new URL(baseUrl + "/api/v1/auth/device-auth");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setDoOutput(true);

            JSONObject payload = new JSONObject();
            payload.put("deviceId", deviceId);
            payload.put("businessName", businessName);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
            }

            if (conn.getResponseCode() == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);
                br.close();

                JSONObject res = new JSONObject(sb.toString());
                String token = res.optString("token", null);
                if (token != null) {
                    prefs.edit().putString("auth_token", token).apply();
                }
                return token;
            }
        } catch (Exception e) {
            Log.e(TAG, "Device auth failed", e);
        }
        return null;
    }

    private static void postSuccess(SubscriptionCallback callback, SubscriptionState state) {
        if (callback != null) {
            mainHandler.post(() -> callback.onSuccess(state));
        }
    }

    private static void postError(SubscriptionCallback callback, String message) {
        if (callback != null) {
            mainHandler.post(() -> callback.onError(message));
        }
    }
}
