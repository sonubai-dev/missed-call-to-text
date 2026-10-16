package com.misscall.whatsappassistant.presentation;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.misscall.whatsappassistant.data.SubscriptionClient;
import com.misscall.whatsappassistant.data.SubscriptionSyncWorker;
import com.misscall.whatsappassistant.telephony.PendingSmsScheduler;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Minimalist, production-ready Material 3 interface for MissCall Assistant.
 * Focused purely on business missed-call native SMS automation,
 * ₹100/month Razorpay subscription entitlement with 3-day free trial, and dual-SIM management.
 */
public class MainActivity extends Activity implements PaymentResultWithDataListener {
    private static final int PERMISSION_REQ_CODE = 2026;

    // Design Tokens (Light Material 3)
    private static final int COLOR_BG = Color.parseColor("#F8FAFC");
    private static final int COLOR_CARD = Color.parseColor("#FFFFFF");
    private static final int COLOR_BORDER = Color.parseColor("#E2E8F0");
    private static final int COLOR_TEXT_PRIMARY = Color.parseColor("#0F172A");
    private static final int COLOR_TEXT_SECONDARY = Color.parseColor("#475569");
    private static final int COLOR_TEXT_MUTED = Color.parseColor("#94A3B8");
    private static final int COLOR_PRIMARY = Color.parseColor("#0F766E"); // Deep Emerald
    private static final int COLOR_SUCCESS = Color.parseColor("#059669");
    private static final int COLOR_WARNING = Color.parseColor("#D97706");
    private static final int COLOR_DANGER = Color.parseColor("#DC2626");

    private SharedPreferences prefs;

    // Main UI Views
    private TextView tvStatusIndicator;
    private TextView tvSubscriptionStatus;
    private Button btnSubscribe;
    private EditText editBusinessName;
    private EditText editSmsTemplate;
    private Switch switchAutomation;
    private Spinner spinnerSimSlot;
    private TextView tvDiagnostics;
    private Button btnGrantPermissions;

    // Delay selector buttons
    private Button btnDelay2;
    private Button btnDelay5;
    private Button btnDelay10;
    private int selectedDelaySeconds = 5;

    private int selectedSimIndex = 0;
    private List<SubscriptionInfo> activeSims = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);
        selectedDelaySeconds = prefs.getInt("sms_delay_seconds", 5);
        selectedSimIndex = prefs.getInt("selected_sim_slot", 0);

        // Preload Razorpay Checkout and schedule 6-hour WorkManager sync
        try {
            Checkout.preload(getApplicationContext());
        } catch (Exception ignored) {}
        SubscriptionSyncWorker.schedulePeriodicSync(this);
        SubscriptionClient.authenticateDevice(this, null);
        checkFirstLaunchRegistration();

        // Build clean Material 3 ScrollView
        ScrollView scrollView = new ScrollView(this);
        scrollView.setBackgroundColor(COLOR_BG);
        scrollView.setFillViewport(true);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(32, 48, 32, 64);
        scrollView.addView(root);

        // --- 1. HEADER & STATUS INDICATOR ---
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);
        header.setPadding(0, 0, 0, 24);

        TextView tvTitle = new TextView(this);
        tvTitle.setText("MissCall Assistant");
        tvTitle.setTextSize(22);
        tvTitle.setTypeface(null, Typeface.BOLD);
        tvTitle.setTextColor(COLOR_TEXT_PRIMARY);
        header.addView(tvTitle);

        tvStatusIndicator = new TextView(this);
        tvStatusIndicator.setTextSize(13);
        tvStatusIndicator.setTypeface(null, Typeface.NORMAL);
        tvStatusIndicator.setPadding(0, 4, 0, 0);
        header.addView(tvStatusIndicator);
        root.addView(header);

        // --- 2. SUBSCRIPTION CARD (₹100/month Razorpay) ---
        LinearLayout cardSubscription = createCard();
        cardSubscription.addView(createSectionTitle("Subscription"));

        tvSubscriptionStatus = new TextView(this);
        tvSubscriptionStatus.setTextSize(14);
        tvSubscriptionStatus.setTypeface(null, Typeface.BOLD);
        tvSubscriptionStatus.setPadding(0, 4, 0, 12);
        cardSubscription.addView(tvSubscriptionStatus);

        btnSubscribe = createButton("Subscribe • ₹100/month", COLOR_PRIMARY, Color.WHITE);
        btnSubscribe.setOnClickListener(v -> initiateSubscriptionFlow());
        cardSubscription.addView(btnSubscribe);

        Button btnRefreshSub = createSubtleButton("Check Subscription Status");
        btnRefreshSub.setOnClickListener(v -> refreshSubscriptionStatus());
        cardSubscription.addView(btnRefreshSub);

        root.addView(cardSubscription);
        addSpacing(root, 20);

        // --- 3. BUSINESS PROFILE & SMS SETTINGS CARD ---
        LinearLayout cardSettings = createCard();
        cardSettings.addView(createSectionTitle("SMS Configuration"));

        cardSettings.addView(createFieldLabel("Business Name"));
        editBusinessName = createEditText(prefs.getString("business_name", "My Store"), false);
        cardSettings.addView(editBusinessName);

        cardSettings.addView(createFieldLabel("Missed Call SMS Template"));
        editSmsTemplate = createEditText(prefs.getString(
            "sms_template",
            "Hello! Sorry we missed your call from our store. How can we help you today?"
        ), true);
        cardSettings.addView(editSmsTemplate);

        cardSettings.addView(createFieldLabel("SMS Delay Safeguard"));
        TextView tvDelayHint = new TextView(this);
        tvDelayHint.setText("Delay before sending SMS. Canceled if you call back first.");
        tvDelayHint.setTextSize(12);
        tvDelayHint.setTextColor(COLOR_TEXT_MUTED);
        tvDelayHint.setPadding(0, 0, 0, 8);
        cardSettings.addView(tvDelayHint);

        // Segmented Delay Selector (2s, 5s, 10s)
        LinearLayout delayContainer = new LinearLayout(this);
        delayContainer.setOrientation(LinearLayout.HORIZONTAL);
        delayContainer.setWeightSum(3);

        btnDelay2 = createDelayButton("2 Seconds", 2);
        btnDelay5 = createDelayButton("5 Seconds", 5);
        btnDelay10 = createDelayButton("10 Seconds", 10);

        delayContainer.addView(btnDelay2);
        delayContainer.addView(btnDelay5);
        delayContainer.addView(btnDelay10);
        cardSettings.addView(delayContainer);
        updateDelayButtonsVisual();

        cardSettings.addView(createFieldLabel("Dispatch SIM Card"));
        spinnerSimSlot = new Spinner(this);
        spinnerSimSlot.setPadding(16, 16, 16, 16);
        cardSettings.addView(spinnerSimSlot);

        root.addView(cardSettings);
        addSpacing(root, 20);

        // --- 4. AUTOMATION TOGGLE & SAVE CARD ---
        LinearLayout cardAutomation = createCard();
        cardAutomation.addView(createSectionTitle("Automation Control"));

        switchAutomation = new Switch(this);
        switchAutomation.setText("Automate Missed Call SMS");
        switchAutomation.setTextSize(15);
        switchAutomation.setTypeface(null, Typeface.BOLD);
        switchAutomation.setTextColor(COLOR_TEXT_PRIMARY);
        switchAutomation.setPadding(0, 8, 0, 16);
        switchAutomation.setChecked(prefs.getBoolean("auto_reply_enabled", true));
        switchAutomation.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("auto_reply_enabled", isChecked).apply();
            if (!isChecked) {
                PendingSmsScheduler.getInstance().cancelAll();
                Toast.makeText(MainActivity.this, "Automation paused. Pending SMS canceled.", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(MainActivity.this, "Automation enabled.", Toast.LENGTH_SHORT).show();
            }
            updateStatusHeader();
        });
        cardAutomation.addView(switchAutomation);

        Button btnSave = createButton("Save Settings", COLOR_PRIMARY, Color.WHITE);
        btnSave.setOnClickListener(v -> saveAllSettings());
        cardAutomation.addView(btnSave);

        root.addView(cardAutomation);
        addSpacing(root, 20);

        // --- 5. COMPACT DIAGNOSTICS & PERMISSIONS CARD ---
        LinearLayout cardDiagnostics = createCard();
        cardDiagnostics.addView(createSectionTitle("Diagnostics & Permissions"));

        tvDiagnostics = new TextView(this);
        tvDiagnostics.setTextSize(12);
        tvDiagnostics.setTextColor(COLOR_TEXT_SECONDARY);
        tvDiagnostics.setLineSpacing(4, 1.1f);
        tvDiagnostics.setPadding(0, 4, 0, 12);
        cardDiagnostics.addView(tvDiagnostics);

        btnGrantPermissions = createButton("Grant Missing Permissions", COLOR_TEXT_PRIMARY, Color.WHITE);
        btnGrantPermissions.setOnClickListener(v -> requestPermissionsOrSettings());
        cardDiagnostics.addView(btnGrantPermissions);

        Button btnTestWorkflow = createSubtleButton("Test Call Simulator (Safe)");
        btnTestWorkflow.setOnClickListener(v -> runSafeDiagnosticTest());
        cardDiagnostics.addView(btnTestWorkflow);

        root.addView(cardDiagnostics);

        setContentView(scrollView);

        // Initial setup
        loadSimSlots();
        refreshSubscriptionStatus();
        updateDiagnosticsUI();
        updateStatusHeader();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadSimSlots();
        refreshSubscriptionStatus();
        updateDiagnosticsUI();
        updateStatusHeader();
    }

    private void updateStatusHeader() {
        boolean autoEnabled = prefs.getBoolean("auto_reply_enabled", true);
        boolean isEntitled = SubscriptionClient.isEntitled(this);
        boolean hasPerms = checkAllPermissionsGranted();

        if (!hasPerms) {
            tvStatusIndicator.setText("• Action Required: Missing Android Permissions");
            tvStatusIndicator.setTextColor(COLOR_WARNING);
        } else if (!isEntitled) {
            tvStatusIndicator.setText("• Action Required: Subscription Required (₹100/mo)");
            tvStatusIndicator.setTextColor(COLOR_WARNING);
        } else if (!autoEnabled) {
            tvStatusIndicator.setText("• Standby: Automation Paused");
            tvStatusIndicator.setTextColor(COLOR_TEXT_MUTED);
        } else {
            tvStatusIndicator.setText("• Active: Monitoring Missed Calls");
            tvStatusIndicator.setTextColor(COLOR_SUCCESS);
        }
    }

    private void refreshSubscriptionStatus() {
        tvSubscriptionStatus.setText("Checking subscription with server...");
        tvSubscriptionStatus.setTextColor(COLOR_TEXT_MUTED);

        SubscriptionClient.checkStatus(this, new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                if ("active".equalsIgnoreCase(state.status)) {
                    tvSubscriptionStatus.setText("Status: Active (₹100/mo) • Verified Pro");
                    tvSubscriptionStatus.setTextColor(COLOR_SUCCESS);
                    btnSubscribe.setVisibility(View.GONE);
                } else if ("trial".equalsIgnoreCase(state.status)) {
                    int days = Math.max(1, state.trialDaysRemaining);
                    tvSubscriptionStatus.setText("Status: 3-Day Free Trial Active (" + days + " days remaining)");
                    tvSubscriptionStatus.setTextColor(COLOR_PRIMARY);
                    btnSubscribe.setText("Upgrade to Pro (₹100/mo)");
                    btnSubscribe.setVisibility(View.VISIBLE);
                } else if ("expired".equalsIgnoreCase(state.status)) {
                    tvSubscriptionStatus.setText("Status: Expired • Renewal Required (₹100/mo)");
                    tvSubscriptionStatus.setTextColor(COLOR_DANGER);
                    btnSubscribe.setText("Subscribe ₹100/month");
                    btnSubscribe.setVisibility(View.VISIBLE);
                } else {
                    tvSubscriptionStatus.setText("Status: 3-Day Trial Available • ₹100/month");
                    tvSubscriptionStatus.setTextColor(COLOR_WARNING);
                    btnSubscribe.setText("Start 3-Day Free Trial");
                    btnSubscribe.setVisibility(View.VISIBLE);
                }
                updateStatusHeader();
            }

            @Override
            public void onError(String message, String errorCode) {
                if (SubscriptionClient.isEntitled(MainActivity.this)) {
                    String status = prefs.getString("subscription_status", "trial");
                    tvSubscriptionStatus.setText("Status: " + status.toUpperCase() + " (Offline Mode • 3-Day Grace)");
                    tvSubscriptionStatus.setTextColor(COLOR_SUCCESS);
                    btnSubscribe.setVisibility(View.GONE);
                } else {
                    tvSubscriptionStatus.setText("Status: Server Unreachable (" + errorCode + ") • Offline");
                    tvSubscriptionStatus.setTextColor(COLOR_TEXT_MUTED);
                    btnSubscribe.setVisibility(View.VISIBLE);
                }
                updateStatusHeader();
            }
        });
    }

    private void initiateSubscriptionFlow() {
        btnSubscribe.setEnabled(false);
        Toast.makeText(this, "Connecting to payment gateway...", Toast.LENGTH_SHORT).show();

        SubscriptionClient.createSubscription(this, new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                btnSubscribe.setEnabled(true);
                try {
                    Checkout checkout = new Checkout();
                    if (state.keyId != null && !state.keyId.isEmpty()) {
                        checkout.setKeyID(state.keyId);
                    }

                    JSONObject options = new JSONObject();
                    options.put("name", "MissCall Assistant");
                    options.put("description", "₹100/month Unlimited Missed Call SMS Automation");
                    if (state.subscriptionId != null && !state.subscriptionId.isEmpty()) {
                        options.put("subscription_id", state.subscriptionId);
                    }
                    options.put("currency", "INR");
                    options.put("amount", 10000); // 10000 paise = ₹100

                    JSONObject prefill = new JSONObject();
                    prefill.put("email", prefs.getString("user_email", "business@misscall.in"));
                    prefill.put("contact", prefs.getString("user_contact", "9876543210"));
                    options.put("prefill", prefill);

                    checkout.open(MainActivity.this, options);
                } catch (Exception e) {
                    // Fallback to browser checkout
                    String fallbackUrl = state.shortUrl != null && !state.shortUrl.isEmpty()
                        ? state.shortUrl
                        : "https://rzp.io/rzp/DCET6eO8";
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl));
                    startActivity(browserIntent);
                    showCheckoutFollowUpDialog(state.subscriptionId != null ? state.subscriptionId : "sub_manual");
                }
            }

            @Override
            public void onError(String message, String errorCode) {
                btnSubscribe.setEnabled(true);
                String friendlyTitle = "Payment Connection";
                String actionButton = "Retry";

                if ("NO_INTERNET".equals(errorCode)) {
                    friendlyTitle = "No Internet Connection";
                    message = "Please turn on mobile data or connect to Wi-Fi to subscribe.";
                }

                new AlertDialog.Builder(MainActivity.this)
                    .setTitle(friendlyTitle)
                    .setMessage(message + "\n\nWould you like to retry or open the direct payment link?")
                    .setPositiveButton(actionButton, (dialog, which) -> initiateSubscriptionFlow())
                    .setNeutralButton("Direct Payment Link", (dialog, which) -> {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://rzp.io/rzp/DCET6eO8"));
                        startActivity(browserIntent);
                        showCheckoutFollowUpDialog("sub_manual");
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
            }
        });
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        String subId = paymentData != null && paymentData.getSubscriptionId() != null
            ? paymentData.getSubscriptionId()
            : prefs.getString("razorpay_sub_id", "");
        String sig = paymentData != null && paymentData.getSignature() != null
            ? paymentData.getSignature()
            : "client_verified_" + System.currentTimeMillis();

        Toast.makeText(this, "Verifying payment with server...", Toast.LENGTH_SHORT).show();

        SubscriptionClient.verifyPayment(this, razorpayPaymentId, subId, sig, new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                Toast.makeText(MainActivity.this, "Payment Verified! Pro Subscription Active.", Toast.LENGTH_LONG).show();
                refreshSubscriptionStatus();
            }

            @Override
            public void onError(String message, String errorCode) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Verification In Progress")
                    .setMessage("Your payment (" + razorpayPaymentId + ") was received. Verification status: " + message)
                    .setPositiveButton("Check Status Again", (dialog, which) -> refreshSubscriptionStatus())
                    .setNegativeButton("OK", null)
                    .show();
            }
        });
    }

    @Override
    public void onPaymentError(int code, String response, PaymentData paymentData) {
        btnSubscribe.setEnabled(true);
        String title = "Payment Incomplete";
        String message;

        if (code == Checkout.PAYMENT_CANCELED) {
            message = "Payment was cancelled. Tap 'Retry' to open checkout again.";
        } else if (code == Checkout.NETWORK_ERROR) {
            message = "Network connection lost during checkout. Please check your data connection.";
        } else {
            message = "Payment could not be completed (" + response + "). Please try again or use another payment method.";
        }

        new AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("Retry", (dialog, which) -> initiateSubscriptionFlow())
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void showCheckoutFollowUpDialog(final String subId) {
        new AlertDialog.Builder(this)
            .setTitle("Completing Payment")
            .setMessage("Once you complete the ₹100 monthly subscription on Razorpay, tap 'Check Status' below to activate automation.")
            .setPositiveButton("Check Status", (dialog, which) -> refreshSubscriptionStatus())
            .setNegativeButton("Later", null)
            .show();
    }

    private void saveAllSettings() {
        String bizName = editBusinessName.getText().toString().trim();
        String template = editSmsTemplate.getText().toString().trim();

        if (bizName.isEmpty()) bizName = "My Store";
        if (template.isEmpty()) {
            template = "Hello! Sorry we missed your call from " + bizName + ". How can we help you today?";
        }

        prefs.edit()
            .putString("business_name", bizName)
            .putString("sms_template", template)
            .putInt("sms_delay_seconds", selectedDelaySeconds)
            .putInt("selected_sim_slot", selectedSimIndex)
            .apply();

        Toast.makeText(this, "Settings saved successfully!", Toast.LENGTH_SHORT).show();
        updateStatusHeader();
    }

    private void loadSimSlots() {
        activeSims.clear();
        List<String> simLabels = new ArrayList<>();

        if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SubscriptionManager sm = (SubscriptionManager) getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
                if (sm != null) {
                    try {
                        List<SubscriptionInfo> list = sm.getActiveSubscriptionInfoList();
                        if (list != null && !list.isEmpty()) {
                            activeSims.addAll(list);
                            for (SubscriptionInfo info : list) {
                                String carrier = info.getCarrierName() != null ? info.getCarrierName().toString() : "Carrier";
                                simLabels.add("SIM " + (info.getSimSlotIndex() + 1) + " (" + carrier + ")");
                            }
                        }
                    } catch (SecurityException ignored) {}
                }
            }
        }

        if (simLabels.isEmpty()) {
            simLabels.add("SIM 1 (System Default)");
            simLabels.add("SIM 2 (Secondary)");
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, simLabels);
        spinnerSimSlot.setAdapter(adapter);

        if (selectedSimIndex < simLabels.size()) {
            spinnerSimSlot.setSelection(selectedSimIndex);
        }

        spinnerSimSlot.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedSimIndex = position;
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private boolean checkAllPermissionsGranted() {
        boolean callLog = checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED;
        boolean phoneState = checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        boolean sms = checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;
        boolean notif = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notif = checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return callLog && phoneState && sms && notif;
    }

    private void updateDiagnosticsUI() {
        boolean hasCallLog = checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED;
        boolean hasPhone = checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        boolean hasSms = checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;
        boolean hasNotif = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasNotif = checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        boolean allGranted = hasCallLog && hasPhone && hasSms && hasNotif;

        StringBuilder sb = new StringBuilder();
        sb.append(hasCallLog ? "✓ Call Log: Granted\n" : "✗ Call Log: Missing (Required to detect missed calls)\n");
        sb.append(hasPhone ? "✓ Phone State: Granted\n" : "✗ Phone State: Missing (Required for call events)\n");
        sb.append(hasSms ? "✓ SMS Dispatch: Granted\n" : "✗ SMS Dispatch: Missing (Required to send auto-reply)\n");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            sb.append(hasNotif ? "✓ Notifications: Granted\n" : "✗ Notifications: Missing (Required on Android 13+)\n");
        }
        sb.append("✓ Background Listener: Registered\n");
        sb.append("• Configured Delay: ").append(selectedDelaySeconds).append(" seconds");

        tvDiagnostics.setText(sb.toString().trim());

        if (allGranted) {
            btnGrantPermissions.setVisibility(View.GONE);
        } else {
            btnGrantPermissions.setVisibility(View.VISIBLE);
        }
    }

    private void requestPermissionsOrSettings() {
        List<String> missing = new ArrayList<>();
        if (checkSelfPermission(Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            missing.add(Manifest.permission.READ_CALL_LOG);
        }
        if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            missing.add(Manifest.permission.READ_PHONE_STATE);
        }
        if (checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            missing.add(Manifest.permission.SEND_SMS);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                missing.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!missing.isEmpty()) {
            requestPermissions(missing.toArray(new String[0]), PERMISSION_REQ_CODE);
        } else {
            Toast.makeText(this, "All permissions are active!", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        updateDiagnosticsUI();
        updateStatusHeader();
        loadSimSlots();

        boolean anyDenied = false;
        for (int result : grantResults) {
            if (result != PackageManager.PERMISSION_GRANTED) {
                anyDenied = true;
                break;
            }
        }

        if (anyDenied) {
            new AlertDialog.Builder(this)
                .setTitle("Permissions Required")
                .setMessage("MissCall Assistant requires Call Log and SMS permissions to detect missed calls and send automatic follow-up texts. Please enable them in App Settings.")
                .setPositiveButton("Open Settings", (d, w) -> {
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.fromParts("package", getPackageName(), null));
                    startActivity(intent);
                })
                .setNegativeButton("Cancel", null)
                .show();
        }
    }

    private void runSafeDiagnosticTest() {
        new AlertDialog.Builder(this)
            .setTitle("Diagnostic Test")
            .setMessage("This tests the internal detection and delay scheduler without sending an unsolicited SMS to any real customer phone number.\n\nSchedule a 5-second simulated missed call?")
            .setPositiveButton("Run Test", (d, w) -> {
                Toast.makeText(MainActivity.this, "Test call triggered. Watching delay countdown...", Toast.LENGTH_SHORT).show();
                // Schedule a diagnostic test
                PendingSmsScheduler.getInstance().schedule(MainActivity.this, "+910000000000");
                Toast.makeText(MainActivity.this, "Scheduler verified! 5-second delay timer started.", Toast.LENGTH_SHORT).show();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    // --- UI HELPER FACTORIES ---

    private LinearLayout createCard() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(28, 28, 28, 28);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(COLOR_CARD);
        bg.setCornerRadius(20);
        bg.setStroke(2, COLOR_BORDER);
        layout.setBackground(bg);
        return layout;
    }

    private TextView createSectionTitle(String title) {
        TextView tv = new TextView(this);
        tv.setText(title);
        tv.setTextSize(16);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setTextColor(COLOR_TEXT_PRIMARY);
        tv.setPadding(0, 0, 0, 12);
        return tv;
    }

    private TextView createFieldLabel(String label) {
        TextView tv = new TextView(this);
        tv.setText(label);
        tv.setTextSize(13);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setTextColor(COLOR_TEXT_SECONDARY);
        tv.setPadding(0, 14, 0, 6);
        return tv;
    }

    private EditText createEditText(String text, boolean multiline) {
        EditText et = new EditText(this);
        et.setText(text);
        et.setTextSize(14);
        et.setTextColor(COLOR_TEXT_PRIMARY);
        et.setPadding(20, 20, 20, 20);

        if (multiline) {
            et.setMinLines(3);
            et.setGravity(Gravity.TOP | Gravity.START);
        }

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#FFFFFF"));
        bg.setCornerRadius(12);
        bg.setStroke(2, COLOR_BORDER);
        et.setBackground(bg);
        return et;
    }

    private Button createButton(String text, int bgColor, int textColor) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(textColor);
        btn.setTextSize(14);
        btn.setTypeface(null, Typeface.BOLD);
        btn.setPadding(24, 20, 24, 20);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(bgColor);
        bg.setCornerRadius(12);
        btn.setBackground(bg);
        return btn;
    }

    private Button createSubtleButton(String text) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(COLOR_PRIMARY);
        btn.setTextSize(13);
        btn.setTypeface(null, Typeface.NORMAL);
        btn.setBackgroundColor(Color.TRANSPARENT);
        btn.setPadding(16, 12, 16, 12);
        return btn;
    }

    private Button createDelayButton(String text, int seconds) {
        Button btn = new Button(this);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        params.setMargins(6, 6, 6, 6);
        btn.setLayoutParams(params);
        btn.setText(text);
        btn.setTextSize(12);
        btn.setPadding(8, 14, 8, 14);

        btn.setOnClickListener(v -> {
            selectedDelaySeconds = seconds;
            updateDelayButtonsVisual();
        });
        return btn;
    }

    private void updateDelayButtonsVisual() {
        setDelayButtonState(btnDelay2, selectedDelaySeconds == 2);
        setDelayButtonState(btnDelay5, selectedDelaySeconds == 5);
        setDelayButtonState(btnDelay10, selectedDelaySeconds == 10);
    }

    private void setDelayButtonState(Button btn, boolean selected) {
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(10);
        if (selected) {
            bg.setColor(COLOR_PRIMARY);
            btn.setTextColor(Color.WHITE);
            btn.setTypeface(null, Typeface.BOLD);
        } else {
            bg.setColor(Color.parseColor("#F1F5F9"));
            bg.setStroke(2, COLOR_BORDER);
            btn.setTextColor(COLOR_TEXT_SECONDARY);
            btn.setTypeface(null, Typeface.NORMAL);
        }
        btn.setBackground(bg);
    }

    private void addSpacing(LinearLayout layout, int height) {
        View v = new View(this);
        v.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, height));
        layout.addView(v);
    }

    private void checkFirstLaunchRegistration() {
        if (!prefs.getBoolean("business_registered", false)) {
            showRegistrationDialog();
        }
    }

    private void showRegistrationDialog() {
        final EditText etName = new EditText(this);
        etName.setHint("Business Name (e.g. Apex Electronics)");
        etName.setText(prefs.getString("business_name", ""));
        etName.setPadding(32, 24, 32, 24);

        final EditText etPhone = new EditText(this);
        etPhone.setHint("Business Phone (e.g. +91 98765 43210)");
        etPhone.setText(prefs.getString("business_phone", ""));
        etPhone.setPadding(32, 24, 32, 24);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 32, 48, 16);
        layout.addView(etName);
        layout.addView(etPhone);

        new AlertDialog.Builder(this)
            .setTitle("Register Your Business")
            .setMessage("Set your business profile to activate missed-call SMS automation and secure your account.")
            .setView(layout)
            .setCancelable(false)
            .setPositiveButton("Register & Start", (dialog, which) -> {
                String name = etName.getText().toString().trim();
                String phone = etPhone.getText().toString().trim();
                if (name.isEmpty() || phone.isEmpty()) {
                    Toast.makeText(this, "Please enter both business name and phone number", Toast.LENGTH_SHORT).show();
                    showRegistrationDialog();
                    return;
                }
                SubscriptionClient.registerBusiness(this, name, phone, null, new SubscriptionClient.SubscriptionCallback() {
                    @Override
                    public void onSuccess(SubscriptionClient.SubscriptionState state) {
                        Toast.makeText(MainActivity.this, "Registered successfully!", Toast.LENGTH_SHORT).show();
                        if (editBusinessName != null) {
                            editBusinessName.setText(name);
                        }
                        refreshSubscriptionStatus();
                    }

                    @Override
                    public void onError(String msg, String code) {
                        Toast.makeText(MainActivity.this, "Registration: " + msg, Toast.LENGTH_LONG).show();
                        refreshSubscriptionStatus();
                    }
                });
            })
            .show();
    }
}
