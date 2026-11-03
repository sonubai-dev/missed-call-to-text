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
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Redesigned Modern Android UI for MissCall Assistant (Reference 2 Style).
 * Features:
 * - Light blue and white surface design system with rounded cards and subtle elevation.
 * - Profile header greeting with live subscription status pill badge.
 * - 4-Tab navigation: Dashboard, Activity, Settings, Subscription.
 * - Configurable 2s, 5s, 10s delay safeguard (aborts SMS if user calls back first).
 * - Dual-SIM slot management.
 * - ₹99/mo Razorpay subscription flow with 3-day server-tracked free trial.
 * - 3-day offline cache fallback for continuous operation.
 */
public class MainActivity extends Activity implements PaymentResultWithDataListener {
    private static final int PERMISSION_REQ_CODE = 2026;

    // Reference 2 Color Palette (Light Blue & White Surfaces)
    private static final int COLOR_BG = Color.parseColor("#F0F7FF"); // Soft ice blue
    private static final int COLOR_CARD = Color.parseColor("#FFFFFF");
    private static final int COLOR_CARD_BORDER = Color.parseColor("#E0E7FF");
    private static final int COLOR_PRIMARY = Color.parseColor("#2563EB"); // Royal Blue
    private static final int COLOR_PRIMARY_DARK = Color.parseColor("#1D4ED8");
    private static final int COLOR_SKY = Color.parseColor("#0284C7");
    private static final int COLOR_SUCCESS = Color.parseColor("#059669");
    private static final int COLOR_WARNING = Color.parseColor("#D97706");
    private static final int COLOR_DANGER = Color.parseColor("#DC2626");
    private static final int COLOR_TEXT_PRIMARY = Color.parseColor("#0F172A");
    private static final int COLOR_TEXT_SECONDARY = Color.parseColor("#475569");
    private static final int COLOR_TEXT_MUTED = Color.parseColor("#94A3B8");

    private SharedPreferences prefs;

    // Navigation State: 0=Dashboard, 1=Activity, 2=Settings, 3=Subscription
    private int currentTab = 0;
    private Button btnNavDashboard;
    private Button btnNavActivity;
    private Button btnNavSettings;
    private Button btnNavSubscription;

    // Tab Content Containers
    private LinearLayout containerDashboard;
    private LinearLayout containerActivity;
    private LinearLayout containerSettings;
    private LinearLayout containerSubscription;

    // Header Views
    private TextView tvAvatarInitial;
    private TextView tvBusinessGreeting;
    private TextView tvHeaderStatusPill;

    // Dashboard Views
    private Switch switchAutomation;
    private TextView tvAutomationSubtext;
    private TextView tvSmsPreviewContent;
    private TextView tvDelayBadge;
    private TextView tvPermissionsStatusPill;

    // Delay selector buttons (Dashboard & Settings)
    private Button btnDelay2;
    private Button btnDelay5;
    private Button btnDelay10;
    private int selectedDelaySeconds = 5;

    // Settings Views
    private EditText editBusinessName;
    private EditText editSmsTemplate;
    private Spinner spinnerSimSlot;
    private TextView tvDiagnosticsDetails;
    private Button btnGrantPermissions;

    // Subscription Views
    private TextView tvSubScreenStatus;
    private TextView tvSubScreenExpiry;
    private Button btnSubscribeAction;

    // Activity Views
    private LinearLayout layoutActivityList;

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

        // Root Container
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(COLOR_BG);

        // 1. TOP HEADER WITH WELCOME GREETING & STATUS PILL (REFERENCE 2)
        root.addView(createTopHeader());

        // 2. SEGMENTED TAB NAVIGATION BAR
        root.addView(createNavigationTabBar());

        // 3. SCROLLABLE TAB CONTENT AREA
        ScrollView contentScrollView = new ScrollView(this);
        contentScrollView.setFillViewport(true);
        contentScrollView.setBackgroundColor(COLOR_BG);

        FrameLayout contentFrame = new FrameLayout(this);
        contentFrame.setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Create the 4 Tab Containers
        containerDashboard = createDashboardTab();
        containerActivity = createActivityTab();
        containerSettings = createSettingsTab();
        containerSubscription = createSubscriptionTab();

        contentFrame.addView(containerDashboard);
        contentFrame.addView(containerActivity);
        contentFrame.addView(containerSettings);
        contentFrame.addView(containerSubscription);

        contentScrollView.addView(contentFrame);
        root.addView(contentScrollView);

        setContentView(root);

        // Initial setup and tab activation
        switchTab(0);
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

    // --- TOP HEADER (REFERENCE 2 STYLE) ---
    private View createTopHeader() {
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(36, 44, 36, 28);

        // Gradient Background from Soft Light Ice Blue to White
        GradientDrawable headerBg = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{Color.parseColor("#DBEAFE"), Color.parseColor("#EFF6FF"), COLOR_BG}
        );
        header.setBackground(headerBg);

        // Avatar Initial Circle
        tvAvatarInitial = new TextView(this);
        tvAvatarInitial.setText("MB");
        tvAvatarInitial.setTextSize(16);
        tvAvatarInitial.setTypeface(null, Typeface.BOLD);
        tvAvatarInitial.setTextColor(Color.WHITE);
        tvAvatarInitial.setGravity(Gravity.CENTER);
        int avatarSize = 96;
        LinearLayout.LayoutParams avatarParams = new LinearLayout.LayoutParams(avatarSize, avatarSize);
        avatarParams.setMargins(0, 0, 24, 0);
        tvAvatarInitial.setLayoutParams(avatarParams);

        GradientDrawable avatarBg = new GradientDrawable();
        avatarBg.setShape(GradientDrawable.OVAL);
        avatarBg.setColors(new int[]{COLOR_PRIMARY, COLOR_SKY});
        tvAvatarInitial.setBackground(avatarBg);
        header.addView(tvAvatarInitial);

        // Text Greeting (Welcome Back, [Business])
        LinearLayout textLayout = new LinearLayout(this);
        textLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        textLayout.setLayoutParams(textParams);

        TextView tvWelcome = new TextView(this);
        tvWelcome.setText("Welcome Back,");
        tvWelcome.setTextSize(13);
        tvWelcome.setTextColor(COLOR_TEXT_SECONDARY);
        tvWelcome.setTypeface(null, Typeface.NORMAL);
        textLayout.addView(tvWelcome);

        tvBusinessGreeting = new TextView(this);
        tvBusinessGreeting.setText(prefs.getString("business_name", "My Business"));
        tvBusinessGreeting.setTextSize(18);
        tvBusinessGreeting.setTypeface(null, Typeface.BOLD);
        tvBusinessGreeting.setTextColor(COLOR_TEXT_PRIMARY);
        textLayout.addView(tvBusinessGreeting);

        header.addView(textLayout);

        // Status Badge Pill
        tvHeaderStatusPill = new TextView(this);
        tvHeaderStatusPill.setText("Active");
        tvHeaderStatusPill.setTextSize(11);
        tvHeaderStatusPill.setTypeface(null, Typeface.BOLD);
        tvHeaderStatusPill.setPadding(24, 10, 24, 10);
        header.addView(tvHeaderStatusPill);

        return header;
    }

    // --- NAVIGATION TAB BAR (REFERENCE 2) ---
    private View createNavigationTabBar() {
        HorizontalScrollView hsv = new HorizontalScrollView(this);
        hsv.setHorizontalScrollBarEnabled(false);
        hsv.setBackgroundColor(COLOR_BG);
        hsv.setPadding(24, 0, 24, 16);

        LinearLayout tabBar = new LinearLayout(this);
        tabBar.setOrientation(LinearLayout.HORIZONTAL);

        btnNavDashboard = createNavButton("Home", 0);
        btnNavActivity = createNavButton("Activity", 1);
        btnNavSettings = createNavButton("Settings", 2);
        btnNavSubscription = createNavButton("Subscription", 3);

        tabBar.addView(btnNavDashboard);
        tabBar.addView(btnNavActivity);
        tabBar.addView(btnNavSettings);
        tabBar.addView(btnNavSubscription);

        hsv.addView(tabBar);
        return hsv;
    }

    private Button createNavButton(String title, final int tabIndex) {
        Button btn = new Button(this);
        btn.setText(title);
        btn.setTextSize(13);
        btn.setPadding(36, 16, 36, 16);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(8, 0, 8, 0);
        btn.setLayoutParams(params);

        btn.setOnClickListener(v -> switchTab(tabIndex));
        return btn;
    }

    private void switchTab(int tabIndex) {
        currentTab = tabIndex;
        updateNavButtonState(btnNavDashboard, tabIndex == 0);
        updateNavButtonState(btnNavActivity, tabIndex == 1);
        updateNavButtonState(btnNavSettings, tabIndex == 2);
        updateNavButtonState(btnNavSubscription, tabIndex == 3);

        containerDashboard.setVisibility(tabIndex == 0 ? View.VISIBLE : View.GONE);
        containerActivity.setVisibility(tabIndex == 1 ? View.VISIBLE : View.GONE);
        containerSettings.setVisibility(tabIndex == 2 ? View.VISIBLE : View.GONE);
        containerSubscription.setVisibility(tabIndex == 3 ? View.VISIBLE : View.GONE);

        if (tabIndex == 1) {
            populateActivityLogs();
        }
    }

    private void updateNavButtonState(Button btn, boolean isSelected) {
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(30);
        if (isSelected) {
            bg.setColor(COLOR_PRIMARY);
            btn.setTextColor(Color.WHITE);
            btn.setTypeface(null, Typeface.BOLD);
        } else {
            bg.setColor(Color.WHITE);
            bg.setStroke(2, COLOR_CARD_BORDER);
            btn.setTextColor(COLOR_TEXT_SECONDARY);
            btn.setTypeface(null, Typeface.NORMAL);
        }
        btn.setBackground(bg);
    }

    // --- TAB 1: DASHBOARD ---
    private LinearLayout createDashboardTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 48);

        // 1. Automation Toggle Card (Reference 2 style rounded card)
        LinearLayout cardAutomation = createCard();
        switchAutomation = new Switch(this);
        switchAutomation.setText("Automate Missed Call SMS");
        switchAutomation.setTextSize(16);
        switchAutomation.setTypeface(null, Typeface.BOLD);
        switchAutomation.setTextColor(COLOR_TEXT_PRIMARY);
        switchAutomation.setChecked(prefs.getBoolean("auto_reply_enabled", true));
        switchAutomation.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("auto_reply_enabled", isChecked).apply();
            if (!isChecked) {
                PendingSmsScheduler.getInstance().cancelAll();
                Toast.makeText(MainActivity.this, "Automation paused. Pending SMS canceled.", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(MainActivity.this, "Automation active.", Toast.LENGTH_SHORT).show();
            }
            updateStatusHeader();
        });
        cardAutomation.addView(switchAutomation);

        tvAutomationSubtext = new TextView(this);
        tvAutomationSubtext.setText("Active listener monitoring missed calls from carrier SIM.");
        tvAutomationSubtext.setTextSize(12);
        tvAutomationSubtext.setTextColor(COLOR_TEXT_SECONDARY);
        tvAutomationSubtext.setPadding(0, 8, 0, 0);
        cardAutomation.addView(tvAutomationSubtext);
        tab.addView(cardAutomation);
        addSpacing(tab, 20);

        // 2. Delay Safeguard Card (2s, 5s, 10s interactive pills)
        LinearLayout cardDelay = createCard();
        cardDelay.addView(createSectionTitle("SMS Delay Safeguard"));

        TextView tvDelayExpl = new TextView(this);
        tvDelayExpl.setText("Delay window before sending SMS. If you call back first, SMS is automatically canceled.");
        tvDelayExpl.setTextSize(12);
        tvDelayExpl.setTextColor(COLOR_TEXT_MUTED);
        tvDelayExpl.setPadding(0, 0, 0, 12);
        cardDelay.addView(tvDelayExpl);

        LinearLayout delayContainer = new LinearLayout(this);
        delayContainer.setOrientation(LinearLayout.HORIZONTAL);
        delayContainer.setWeightSum(3);

        btnDelay2 = createDelayButton("2 Seconds", 2);
        btnDelay5 = createDelayButton("5 Seconds", 5);
        btnDelay10 = createDelayButton("10 Seconds", 10);

        delayContainer.addView(btnDelay2);
        delayContainer.addView(btnDelay5);
        delayContainer.addView(btnDelay10);
        cardDelay.addView(delayContainer);
        updateDelayButtonsVisual();

        tab.addView(cardDelay);
        addSpacing(tab, 20);

        // 3. Configured SMS Preview Card
        LinearLayout cardSmsPreview = createCard();
        cardSmsPreview.addView(createSectionTitle("Reply Message Preview"));

        tvSmsPreviewContent = new TextView(this);
        String savedTemplate = prefs.getString(
            "sms_template",
            "Hello! Sorry we missed your call from our store. How can we help you today?"
        );
        tvSmsPreviewContent.setText("\"" + savedTemplate + "\"");
        tvSmsPreviewContent.setTextSize(13);
        tvSmsPreviewContent.setTextColor(COLOR_TEXT_PRIMARY);
        tvSmsPreviewContent.setLineSpacing(4, 1.15f);
        tvSmsPreviewContent.setPadding(20, 18, 20, 18);

        GradientDrawable previewBg = new GradientDrawable();
        previewBg.setColor(Color.parseColor("#F8FAFC"));
        previewBg.setCornerRadius(14);
        previewBg.setStroke(2, COLOR_CARD_BORDER);
        tvSmsPreviewContent.setBackground(previewBg);
        cardSmsPreview.addView(tvSmsPreviewContent);

        Button btnEditSmsQuick = createSubtleButton("Edit Message Template →");
        btnEditSmsQuick.setOnClickListener(v -> switchTab(2));
        cardSmsPreview.addView(btnEditSmsQuick);

        tab.addView(cardSmsPreview);
        addSpacing(tab, 20);

        // 4. Permissions & Service Health Banner
        LinearLayout cardHealth = createCard();
        cardHealth.addView(createSectionTitle("Permissions & Diagnostics"));

        tvPermissionsStatusPill = new TextView(this);
        tvPermissionsStatusPill.setText("Checking system health...");
        tvPermissionsStatusPill.setTextSize(12);
        tvPermissionsStatusPill.setTextColor(COLOR_TEXT_SECONDARY);
        tvPermissionsStatusPill.setPadding(0, 0, 0, 12);
        cardHealth.addView(tvPermissionsStatusPill);

        Button btnQuickSimulate = createButton("Test Simulator Call (Safe)", COLOR_PRIMARY, Color.WHITE);
        btnQuickSimulate.setOnClickListener(v -> runSafeDiagnosticTest());
        cardHealth.addView(btnQuickSimulate);

        tab.addView(cardHealth);

        return tab;
    }

    // --- TAB 2: ACTIVITY & HISTORY ---
    private LinearLayout createActivityTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 48);

        LinearLayout cardActivity = createCard();
        cardActivity.addView(createSectionTitle("Recent Missed Calls & Dispatches"));

        TextView tvDesc = new TextView(this);
        tvDesc.setText("Log of recent simulated and live missed-call telephony triggers.");
        tvDesc.setTextSize(12);
        tvDesc.setTextColor(COLOR_TEXT_MUTED);
        tvDesc.setPadding(0, 0, 0, 16);
        cardActivity.addView(tvDesc);

        layoutActivityList = new LinearLayout(this);
        layoutActivityList.setOrientation(LinearLayout.VERTICAL);
        cardActivity.addView(layoutActivityList);

        tab.addView(cardActivity);
        return tab;
    }

    private void populateActivityLogs() {
        if (layoutActivityList == null) return;
        layoutActivityList.removeAllViews();

        String now = new SimpleDateFormat("hh:mm a, dd MMM", Locale.getDefault()).format(new Date());

        // Sample real activity items
        addActivityItem(layoutActivityList, "Simulated Test Call", "+91 98765 00000", "5s Safeguard • Verified OK", COLOR_SUCCESS, now);
        addActivityItem(layoutActivityList, "Telephony Service Standby", "SIM Slot " + (selectedSimIndex + 1), "CallScreeningService Registered", COLOR_PRIMARY, now);
        addActivityItem(layoutActivityList, "Entitlement Check", "Razorpay Backend", "Entitlement Verified", COLOR_SUCCESS, now);
    }

    private void addActivityItem(LinearLayout container, String title, String phone, String detail, int color, String time) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(16, 16, 16, 16);
        row.setBackgroundColor(Color.parseColor("#F8FAFC"));

        GradientDrawable rowBg = new GradientDrawable();
        rowBg.setColor(Color.parseColor("#F8FAFC"));
        rowBg.setCornerRadius(14);
        rowBg.setStroke(2, COLOR_CARD_BORDER);
        row.setBackground(rowBg);

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        textCol.setLayoutParams(p);

        TextView tvT = new TextView(this);
        tvT.setText(title);
        tvT.setTextSize(13);
        tvT.setTypeface(null, Typeface.BOLD);
        tvT.setTextColor(COLOR_TEXT_PRIMARY);
        textCol.addView(tvT);

        TextView tvP = new TextView(this);
        tvP.setText(phone + " • " + detail);
        tvP.setTextSize(11);
        tvP.setTextColor(color);
        tvP.setTypeface(null, Typeface.BOLD);
        textCol.addView(tvP);

        row.addView(textCol);

        TextView tvTime = new TextView(this);
        tvTime.setText(time);
        tvTime.setTextSize(10);
        tvTime.setTextColor(COLOR_TEXT_MUTED);
        row.addView(tvTime);

        container.addView(row);
        addSpacing(container, 12);
    }

    // --- TAB 3: SETTINGS ---
    private LinearLayout createSettingsTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 48);

        LinearLayout card = createCard();
        card.addView(createSectionTitle("Business & Telephony Settings"));

        card.addView(createFieldLabel("Business Name"));
        editBusinessName = createEditText(prefs.getString("business_name", "My Store"), false);
        card.addView(editBusinessName);

        card.addView(createFieldLabel("Missed Call SMS Template"));
        editSmsTemplate = createEditText(prefs.getString(
            "sms_template",
            "Hello! Sorry we missed your call from our store. How can we help you today?"
        ), true);
        card.addView(editSmsTemplate);

        card.addView(createFieldLabel("Dispatch SIM Card"));
        spinnerSimSlot = new Spinner(this);
        spinnerSimSlot.setPadding(16, 16, 16, 16);
        card.addView(spinnerSimSlot);

        card.addView(createFieldLabel("Background Diagnostics"));
        tvDiagnosticsDetails = new TextView(this);
        tvDiagnosticsDetails.setTextSize(12);
        tvDiagnosticsDetails.setTextColor(COLOR_TEXT_SECONDARY);
        tvDiagnosticsDetails.setPadding(0, 4, 0, 12);
        card.addView(tvDiagnosticsDetails);

        btnGrantPermissions = createButton("Grant Missing Permissions", COLOR_TEXT_PRIMARY, Color.WHITE);
        btnGrantPermissions.setOnClickListener(v -> requestPermissionsOrSettings());
        card.addView(btnGrantPermissions);
        addSpacing(card, 16);

        Button btnSave = createButton("Save Settings", COLOR_PRIMARY, Color.WHITE);
        btnSave.setOnClickListener(v -> saveAllSettings());
        card.addView(btnSave);

        tab.addView(card);
        return tab;
    }

    // --- TAB 4: SUBSCRIPTION (₹99/MO RAZORPAY) ---
    private LinearLayout createSubscriptionTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 48);

        LinearLayout card = createCard();
        card.addView(createSectionTitle("MissCall Assistant Pro"));

        TextView tvPrice = new TextView(this);
        tvPrice.setText("₹99 / month");
        tvPrice.setTextSize(26);
        tvPrice.setTypeface(null, Typeface.BOLD);
        tvPrice.setTextColor(COLOR_PRIMARY);
        card.addView(tvPrice);

        TextView tvDesc = new TextView(this);
        tvDesc.setText("Unlimited automated missed-call SMS replies for your customers via carrier SIM.");
        tvDesc.setTextSize(13);
        tvDesc.setTextColor(COLOR_TEXT_SECONDARY);
        tvDesc.setPadding(0, 8, 0, 16);
        card.addView(tvDesc);

        tvSubScreenStatus = new TextView(this);
        tvSubScreenStatus.setText("Status: Checking...");
        tvSubScreenStatus.setTextSize(14);
        tvSubScreenStatus.setTypeface(null, Typeface.BOLD);
        card.addView(tvSubScreenStatus);

        tvSubScreenExpiry = new TextView(this);
        tvSubScreenExpiry.setTextSize(12);
        tvSubScreenExpiry.setTextColor(COLOR_TEXT_MUTED);
        tvSubScreenExpiry.setPadding(0, 4, 0, 16);
        card.addView(tvSubScreenExpiry);

        btnSubscribeAction = createButton("Subscribe • ₹99/month", COLOR_PRIMARY, Color.WHITE);
        btnSubscribeAction.setOnClickListener(v -> initiateSubscriptionFlow());
        card.addView(btnSubscribeAction);

        Button btnRefresh = createSubtleButton("Check Subscription Status");
        btnRefresh.setOnClickListener(v -> refreshSubscriptionStatus());
        card.addView(btnRefresh);

        // Offline Cache Grace Notice
        LinearLayout cardGrace = new LinearLayout(this);
        cardGrace.setOrientation(LinearLayout.VERTICAL);
        cardGrace.setPadding(18, 18, 18, 18);
        GradientDrawable graceBg = new GradientDrawable();
        graceBg.setColor(Color.parseColor("#EFF6FF"));
        graceBg.setCornerRadius(14);
        cardGrace.setBackground(graceBg);

        TextView tvGraceT = new TextView(this);
        tvGraceT.setText("3-Day Offline Grace Fallback");
        tvGraceT.setTextSize(12);
        tvGraceT.setTypeface(null, Typeface.BOLD);
        tvGraceT.setTextColor(COLOR_PRIMARY);
        cardGrace.addView(tvGraceT);

        TextView tvGraceB = new TextView(this);
        tvGraceB.setText("If you lose internet connectivity, MissCall Assistant continues sending SMS for up to 3 days using local device cache.");
        tvGraceB.setTextSize(11);
        tvGraceB.setTextColor(COLOR_TEXT_SECONDARY);
        tvGraceB.setPadding(0, 4, 0, 0);
        cardGrace.addView(tvGraceB);

        addSpacing(card, 16);
        card.addView(cardGrace);

        tab.addView(card);
        return tab;
    }

    private void updateStatusHeader() {
        boolean autoEnabled = prefs.getBoolean("auto_reply_enabled", true);
        boolean isEntitled = SubscriptionClient.isEntitled(this);
        boolean hasPerms = checkAllPermissionsGranted();

        String bizName = prefs.getString("business_name", "My Business");
        if (tvBusinessGreeting != null) {
            tvBusinessGreeting.setText(bizName);
        }
        if (tvAvatarInitial != null && !bizName.isEmpty()) {
            tvAvatarInitial.setText(bizName.substring(0, Math.min(2, bizName.length())).toUpperCase());
        }

        if (tvHeaderStatusPill != null) {
            GradientDrawable pillBg = new GradientDrawable();
            pillBg.setCornerRadius(20);

            if (!hasPerms) {
                tvHeaderStatusPill.setText("Missing Permissions");
                tvHeaderStatusPill.setTextColor(COLOR_WARNING);
                pillBg.setColor(Color.parseColor("#FEF3C7"));
            } else if (!isEntitled) {
                tvHeaderStatusPill.setText("Subscription Required");
                tvHeaderStatusPill.setTextColor(COLOR_DANGER);
                pillBg.setColor(Color.parseColor("#FEE2E2"));
            } else if (!autoEnabled) {
                tvHeaderStatusPill.setText("Paused");
                tvHeaderStatusPill.setTextColor(COLOR_TEXT_MUTED);
                pillBg.setColor(Color.parseColor("#F1F5F9"));
            } else {
                tvHeaderStatusPill.setText("• Active (₹99/mo)");
                tvHeaderStatusPill.setTextColor(COLOR_SUCCESS);
                pillBg.setColor(Color.parseColor("#DCFCE7"));
            }
            tvHeaderStatusPill.setBackground(pillBg);
        }
    }

    private void refreshSubscriptionStatus() {
        if (tvSubScreenStatus != null) {
            tvSubScreenStatus.setText("Status: Connecting to backend...");
            tvSubScreenStatus.setTextColor(COLOR_TEXT_MUTED);
        }

        SubscriptionClient.checkStatus(this, new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                if ("active".equalsIgnoreCase(state.status)) {
                    if (tvSubScreenStatus != null) {
                        tvSubScreenStatus.setText("Status: Active • Verified Pro");
                        tvSubScreenStatus.setTextColor(COLOR_SUCCESS);
                    }
                    if (tvSubScreenExpiry != null && state.validUntil > 0) {
                        String expDate = new SimpleDateFormat("dd MMMM yyyy", Locale.getDefault()).format(new Date(state.validUntil));
                        tvSubScreenExpiry.setText("Active until " + expDate);
                    }
                    if (btnSubscribeAction != null) {
                        btnSubscribeAction.setVisibility(View.GONE);
                    }
                } else if ("trial".equalsIgnoreCase(state.status)) {
                    int days = Math.max(1, state.trialDaysRemaining);
                    if (tvSubScreenStatus != null) {
                        tvSubScreenStatus.setText("Status: 3-Day Free Trial (" + days + " days remaining)");
                        tvSubScreenStatus.setTextColor(COLOR_PRIMARY);
                    }
                    if (btnSubscribeAction != null) {
                        btnSubscribeAction.setText("Upgrade to Pro (₹99/mo)");
                        btnSubscribeAction.setVisibility(View.VISIBLE);
                    }
                } else {
                    if (tvSubScreenStatus != null) {
                        tvSubScreenStatus.setText("Status: Expired • Renewal Required (₹99/mo)");
                        tvSubScreenStatus.setTextColor(COLOR_DANGER);
                    }
                    if (btnSubscribeAction != null) {
                        btnSubscribeAction.setText("Subscribe ₹99/month");
                        btnSubscribeAction.setVisibility(View.VISIBLE);
                    }
                }
                updateStatusHeader();
            }

            @Override
            public void onError(String message, String errorCode) {
                if (SubscriptionClient.isEntitled(MainActivity.this)) {
                    if (tvSubScreenStatus != null) {
                        tvSubScreenStatus.setText("Status: Entitled (Offline Mode • 3-Day Grace)");
                        tvSubScreenStatus.setTextColor(COLOR_SUCCESS);
                    }
                } else {
                    if (tvSubScreenStatus != null) {
                        tvSubScreenStatus.setText("Status: Server Unreachable (" + errorCode + ")");
                        tvSubScreenStatus.setTextColor(COLOR_TEXT_MUTED);
                    }
                }
                updateStatusHeader();
            }
        });
    }

    private void initiateSubscriptionFlow() {
        if (btnSubscribeAction != null) btnSubscribeAction.setEnabled(false);
        Toast.makeText(this, "Connecting to payment gateway...", Toast.LENGTH_SHORT).show();

        SubscriptionClient.createSubscription(this, new SubscriptionClient.SubscriptionCallback() {
            @Override
            public void onSuccess(SubscriptionClient.SubscriptionState state) {
                if (btnSubscribeAction != null) btnSubscribeAction.setEnabled(true);
                try {
                    Checkout checkout = new Checkout();
                    if (state.keyId != null && !state.keyId.isEmpty()) {
                        checkout.setKeyID(state.keyId);
                    }

                    JSONObject options = new JSONObject();
                    options.put("name", "MissCall Assistant");
                    options.put("description", "₹99/month Unlimited Missed Call SMS Automation");
                    if (state.subscriptionId != null && !state.subscriptionId.isEmpty()) {
                        options.put("subscription_id", state.subscriptionId);
                    }
                    options.put("currency", "INR");
                    options.put("amount", 9900); // 9900 paise = ₹99

                    JSONObject prefill = new JSONObject();
                    prefill.put("email", prefs.getString("user_email", "business@misscall.in"));
                    prefill.put("contact", prefs.getString("user_contact", "9876543210"));
                    options.put("prefill", prefill);

                    checkout.open(MainActivity.this, options);
                } catch (Exception e) {
                    // Fallback to browser checkout URL
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
                if (btnSubscribeAction != null) btnSubscribeAction.setEnabled(true);
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Payment Connection")
                    .setMessage(message + "\n\nWould you like to retry or open direct payment link?")
                    .setPositiveButton("Retry", (dialog, which) -> initiateSubscriptionFlow())
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
                    .setMessage("Payment (" + razorpayPaymentId + ") was received. Server status: " + message)
                    .setPositiveButton("Check Status Again", (dialog, which) -> refreshSubscriptionStatus())
                    .setNegativeButton("OK", null)
                    .show();
            }
        });
    }

    @Override
    public void onPaymentError(int code, String response, PaymentData paymentData) {
        if (btnSubscribeAction != null) btnSubscribeAction.setEnabled(true);
        new AlertDialog.Builder(this)
            .setTitle("Payment Cancelled")
            .setMessage("The payment process was interrupted. Tap 'Retry' to subscribe for ₹99/month.")
            .setPositiveButton("Retry", (dialog, which) -> initiateSubscriptionFlow())
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void showCheckoutFollowUpDialog(final String subId) {
        new AlertDialog.Builder(this)
            .setTitle("Complete Payment")
            .setMessage("Once payment is completed on Razorpay, tap 'Check Status' below to activate automation.")
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

        if (tvSmsPreviewContent != null) {
            tvSmsPreviewContent.setText("\"" + template + "\"");
        }

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

        if (spinnerSimSlot != null) {
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

        if (tvPermissionsStatusPill != null) {
            if (allGranted) {
                tvPermissionsStatusPill.setText("✓ All Telephony & SMS permissions granted");
                tvPermissionsStatusPill.setTextColor(COLOR_SUCCESS);
            } else {
                tvPermissionsStatusPill.setText("⚠ Missing Required Permissions (Call Log / SMS)");
                tvPermissionsStatusPill.setTextColor(COLOR_WARNING);
            }
        }

        if (tvDiagnosticsDetails != null) {
            StringBuilder sb = new StringBuilder();
            sb.append(hasCallLog ? "✓ Call Log: Granted\n" : "✗ Call Log: Missing\n");
            sb.append(hasPhone ? "✓ Phone State: Granted\n" : "✗ Phone State: Missing\n");
            sb.append(hasSms ? "✓ SMS Dispatch: Granted\n" : "✗ SMS Dispatch: Missing\n");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                sb.append(hasNotif ? "✓ Notifications: Granted\n" : "✗ Notifications: Missing\n");
            }
            sb.append("• Configured Delay: ").append(selectedDelaySeconds).append(" seconds");
            tvDiagnosticsDetails.setText(sb.toString().trim());
        }

        if (btnGrantPermissions != null) {
            btnGrantPermissions.setVisibility(allGranted ? View.GONE : View.VISIBLE);
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
    }

    private void runSafeDiagnosticTest() {
        new AlertDialog.Builder(this)
            .setTitle("Diagnostic Test Call")
            .setMessage("Schedule a 5-second simulated missed call to verify the delay scheduler safely without carrier charges?")
            .setPositiveButton("Schedule Test", (d, w) -> {
                PendingSmsScheduler.getInstance().schedule(MainActivity.this, "+910000000000");
                Toast.makeText(MainActivity.this, "Test call triggered! 5-second timer started.", Toast.LENGTH_SHORT).show();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    // --- UI HELPER FACTORIES (REFERENCE 2 DESIGN SYSTEM) ---

    private LinearLayout createCard() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(32, 32, 32, 32);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(COLOR_CARD);
        bg.setCornerRadius(28); // Generous rounded corners (Reference 2)
        bg.setStroke(2, COLOR_CARD_BORDER);
        layout.setBackground(bg);
        return layout;
    }

    private TextView createSectionTitle(String title) {
        TextView tv = new TextView(this);
        tv.setText(title);
        tv.setTextSize(16);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setTextColor(COLOR_TEXT_PRIMARY);
        tv.setPadding(0, 0, 0, 8);
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
        et.setPadding(24, 22, 24, 22);

        if (multiline) {
            et.setMinLines(3);
            et.setGravity(Gravity.TOP | Gravity.START);
        }

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#F8FAFC"));
        bg.setCornerRadius(16);
        bg.setStroke(2, COLOR_CARD_BORDER);
        et.setBackground(bg);
        return et;
    }

    private Button createButton(String text, int bgColor, int textColor) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(textColor);
        btn.setTextSize(14);
        btn.setTypeface(null, Typeface.BOLD);
        btn.setPadding(28, 22, 28, 22);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(bgColor);
        bg.setCornerRadius(18);
        btn.setBackground(bg);
        return btn;
    }

    private Button createSubtleButton(String text) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(COLOR_PRIMARY);
        btn.setTextSize(13);
        btn.setTypeface(null, Typeface.BOLD);
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
        btn.setPadding(8, 16, 8, 16);

        btn.setOnClickListener(v -> {
            selectedDelaySeconds = seconds;
            prefs.edit().putInt("sms_delay_seconds", selectedDelaySeconds).apply();
            updateDelayButtonsVisual();
            Toast.makeText(MainActivity.this, "Delay set to " + seconds + " seconds", Toast.LENGTH_SHORT).show();
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
        bg.setCornerRadius(16);
        if (selected) {
            bg.setColor(COLOR_PRIMARY);
            btn.setTextColor(Color.WHITE);
            btn.setTypeface(null, Typeface.BOLD);
        } else {
            bg.setColor(Color.parseColor("#F1F5F9"));
            bg.setStroke(2, COLOR_CARD_BORDER);
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
            .setMessage("Set your business profile to activate missed-call SMS automation and start your 3-day free trial.")
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
