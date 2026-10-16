package com.misscall.whatsappassistant.data;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * WorkManager worker that periodically refreshes the device subscription
 * status from the server every 6 hours when connected to network.
 */
public class SubscriptionSyncWorker extends Worker {
    private static final String TAG = "SubscriptionSyncWorker";
    public static final String WORK_NAME = "periodic_subscription_sync";

    public SubscriptionSyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Executing periodic subscription status synchronization");
        final CountDownLatch latch = new CountDownLatch(1);
        final boolean[] success = new boolean[]{false};

        SubscriptionClient.checkStatus(getApplicationContext(), new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                Log.i(TAG, "Subscription sync successful: " + state.status);
                success[0] = true;
                latch.countDown();
            }

            @Override
            public void onError(String msg, String code) {
                Log.w(TAG, "Subscription sync error: " + code + " - " + msg);
                success[0] = false;
                latch.countDown();
            }
        });

        try {
            latch.await(15, TimeUnit.SECONDS);
        } catch (InterruptedException ignored) {}

        return success[0] ? Result.success() : Result.retry();
    }

    public static void schedulePeriodicSync(Context context) {
        try {
            Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

            PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
                SubscriptionSyncWorker.class,
                6, TimeUnit.HOURS
            )
            .setConstraints(constraints)
            .build();

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            );
            Log.i(TAG, "Scheduled periodic subscription sync every 6 hours");
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule WorkManager periodic sync", e);
        }
    }
}
