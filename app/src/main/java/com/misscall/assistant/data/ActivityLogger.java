package com.misscall.assistant.data;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Local FIFO Activity Logger for MissCall Assistant.
 * Stores up to 100 recent telephony and SMS events on-device with zero server transmission.
 */
public class ActivityLogger {
    private static final String PREF_NAME = "misscall_activity_logs";
    private static final String KEY_LOGS = "logs_json";
    private static final int MAX_ENTRIES = 100;

    public static class LogItem {
        public String id;
        public String type; // "MISSED_CALL", "SMS_SENT", "SMS_CANCELLED", "SIMULATED"
        public String number;
        public String details;
        public String formattedTime;
        public long timestamp;

        public LogItem(String type, String number, String details, long timestamp) {
            this.id = String.valueOf(timestamp);
            this.type = type;
            this.number = number;
            this.details = details;
            this.timestamp = timestamp;
            SimpleDateFormat sdf = new SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault());
            this.formattedTime = sdf.format(new Date(timestamp));
        }
    }

    public static synchronized void log(Context context, String type, String number, String details) {
        if (context == null) return;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String existingJson = prefs.getString(KEY_LOGS, "[]");
            JSONArray array = new JSONArray(existingJson);

            JSONObject newItem = new JSONObject();
            long now = System.currentTimeMillis();
            newItem.put("type", type);
            newItem.put("number", number != null ? number : "Unknown");
            newItem.put("details", details != null ? details : "");
            newItem.put("timestamp", now);

            // Prepend new item (newest first)
            JSONArray updatedArray = new JSONArray();
            updatedArray.put(newItem);

            int count = 1;
            for (int i = 0; i < array.length() && count < MAX_ENTRIES; i++) {
                updatedArray.put(array.getJSONObject(i));
                count++;
            }

            prefs.edit().putString(KEY_LOGS, updatedArray.toString()).apply();
        } catch (Exception ignored) {}
    }

    public static synchronized List<LogItem> getRecentLogs(Context context) {
        List<LogItem> list = new ArrayList<>();
        if (context == null) return list;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String existingJson = prefs.getString(KEY_LOGS, "[]");
            JSONArray array = new JSONArray(existingJson);
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                list.add(new LogItem(
                    obj.optString("type", "EVENT"),
                    obj.optString("number", ""),
                    obj.optString("details", ""),
                    obj.optLong("timestamp", System.currentTimeMillis())
                ));
            }
        } catch (Exception ignored) {}
        return list;
    }

    public static synchronized void clearLogs(Context context) {
        if (context == null) return;
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_LOGS)
            .apply();
    }
}
