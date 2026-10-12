package com.misscall.whatsappassistant;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class MissCallApplication extends Application {
    public static final String CHANNEL_ID = "misscall_assistant_channel";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "MissCall Assistant Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alerts for incoming missed calls and follow-up dispatches");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
