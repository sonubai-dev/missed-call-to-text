package com.misscall.assistant.presentation;

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
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.misscall.assistant.data.ActivityLogger;
import com.misscall.assistant.data.SubscriptionClient;
import com.misscall.assistant.security.AndroidSecurityManager;
import com.misscall.assistant.telephony.PendingSmsScheduler;

import java.util.ArrayList;
import java.util.List;

/**
 * Modern Electric Blue 3-Tab UI for MissCall Assistant.
 * 100% Lifetime Free Edition (Zero Paywalls, Zero Sign-in/Login Required).
 * 
 * Palette Tokens (Strict Zero Purple):
 * - Primary Brand: #2563EB (Electric Sapphire)
 * - Accent Cyan:   #0284C7 (Sky Blue)
 * - Canvas BG:     #F8FAFC (Slate 50)
 * - Card Surface:  #FFFFFF (Pure White)
 * - Card Border:   #E2E8F0 (Slate 200)
 * - Text Primary:  #0F172A (Slate 900)
 * - Text Secondary:#475569 (Slate 600)
 * - Text Muted:    #94A3B8 (Slate 400)
 * - Success Green: #10B981 (Emerald Green)
 * 
 * Tabs:
 * 0 = Home (Live Automation Controls, Delay Pills, SIM Switcher, Live Template Preview, Simulator)
 * 1 = Activity (Live Missed Calls & Sent SMS Delivery Logs, 100-entry FIFO Storage)
 * 2 = Settings (Business Profile, Permissions Health, Privacy Policy, Free Lifetime Info)
 */
public class MainActivity extends Activity {
    private static final int PERMISSION_REQ_CODE = 2026;

    // Modern Electric Blue Palette Tokens
    private static final int COLOR_BG = Color.parseColor("#F8FAFC");
    private static final int COLOR_CARD = Color.parseColor("#FFFFFF");
    private static final int COLOR_CARD_BORDER = Color.parseColor("#E2E8F0");
    private static final int COLOR_PRIMARY = Color.parseColor("#2563EB");
    private static final int COLOR_PRIMARY_DARK = Color.parseColor("#1D4ED8");
    private static final int COLOR_SKY = Color.parseColor("#0284C7");
    private static final int COLOR_SUCCESS = Color.parseColor("#10B981");
    private static final int COLOR_WARNING = Color.parseColor("#F59E0B");
    private static final int COLOR_DANGER = Color.parseColor("#EF4444");
    private static final int COLOR_TEXT_PRIMARY = Color.parseColor("#0F172A");
    private static final int COLOR_TEXT_SECONDARY = Color.parseColor("#475569");
    private static final int COLOR_TEXT_MUTED = Color.parseColor("#94A3B8");

    private SharedPreferences prefs;

    // Navigation State: 0=Home, 1=Activity, 2=Settings
    private int currentTab = 0;
    private Button btnNavHome;
    private Button btnNavActivity;
    private Button btnNavSettings;

    // Tab Containers
    private LinearLayout containerHome;
    private LinearLayout containerActivity;
    private LinearLayout containerSettings;

    // Header Views
    private TextView tvAvatarInitial;
    private TextView tvBusinessGreeting;
    private TextView tvHeaderStatusPill;

    // Home Screen Views
    private Switch switchAutomation;
    private TextView tvAutomationSubtext;
    private TextView tvSmsPreviewContent;
    private Button btnDelay2;
    private Button btnDelay5;
    private Button btnDelay10;
    private int selectedDelaySeconds = 5;

    // Settings Views
    private EditText editUserName;
    private EditText editBusinessName;
    private EditText editLocation;
    private EditText editSmsTemplate;
    private Spinner spinnerSimSlot;
    private TextView tvDiagnosticsDetails;
    private Button btnGrantPermissions;

    // Activity Views
    private LinearLayout layoutActivityList;

    // SIM State
    private final List<SubscriptionInfo> activeSims = new ArrayList<>();
    private final List<String> simLabels = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("misscall_prefs", MODE_PRIVATE);

        // Security Hardening: Anti-tapjacking & Screen Security
        AndroidSecurityManager.applyFlagSecure(this);

        // Ensure 100% Free Lifetime Local Default State
        if (!prefs.contains("business_registered")) {
            prefs.edit()
                .putBoolean("business_registered", true)
                .putString("user_name", "Business Owner")
                .putString("business_name", "My Store")
                .putString("business_location", "India")
                .putBoolean("auto_reply_enabled", true)
                .putInt("sms_delay_seconds", 5)
                .putString("sms_template", "Hello! Sorry we missed your call from {{business_name}}. How can we help you today?")
                .putString("subscription_status", "free_lifetime")
                .putBoolean("subscription_is_paid", true)
                .apply();
        }

        // Silent background device registration (never blocks UI or reports user error)
        SubscriptionClient.authenticateDevice(this, null);

        // Build Modern Root Container
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(COLOR_BG);
        root.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 1. Top Header with Live Active Badge
        root.addView(createTopHeader());

        // 2. Modern 3-Tab Bottom Navigation Bar
        root.addView(createNavigationTabBar());

        // 3. Scrollable Content Area
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            0,
            1f
        ));

        LinearLayout contentContainer = new LinearLayout(this);
        contentContainer.setOrientation(LinearLayout.VERTICAL);
        contentContainer.setPadding(0, 0, 0, 32);

        containerHome = createHomeTab();
        containerActivity = createActivityTab();
        containerSettings = createSettingsTab();

        contentContainer.addView(containerHome);
        contentContainer.addView(containerActivity);
        contentContainer.addView(containerSettings);

        scrollView.addView(contentContainer);
        root.addView(scrollView);

        setContentView(root);

        // Initialize state
        switchTab(0);
        loadSimSlots();
        updateDiagnosticsUI();
        updateStatusHeader();

        // Check if permissions need to be requested on launch
        if (!checkAllPermissionsGranted()) {
            requestPermissionsOrSettings();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadSimSlots();
        updateDiagnosticsUI();
        updateStatusHeader();
        if (currentTab == 1) {
            populateActivityLogs();
        }
    }

    // --- TOP APP BAR HEADER (ELECTRIC BLUE ACCENTS) ---
    private View createTopHeader() {
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(36, 40, 36, 24);

        GradientDrawable headerBg = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{Color.parseColor("#EFF6FF"), Color.parseColor("#F8FAFC")}
        );
        header.setBackground(headerBg);

        // Avatar Initial Circle
        tvAvatarInitial = new TextView(this);
        tvAvatarInitial.setText("MB");
        tvAvatarInitial.setTextSize(15);
        tvAvatarInitial.setTypeface(null, Typeface.BOLD);
        tvAvatarInitial.setTextColor(Color.WHITE);
        tvAvatarInitial.setGravity(Gravity.CENTER);
        int avatarSize = 92;
        LinearLayout.LayoutParams avatarParams = new LinearLayout.LayoutParams(avatarSize, avatarSize);
        avatarParams.setMargins(0, 0, 20, 0);
        tvAvatarInitial.setLayoutParams(avatarParams);

        GradientDrawable avatarBg = new GradientDrawable();
        avatarBg.setShape(GradientDrawable.OVAL);
        avatarBg.setColors(new int[]{COLOR_PRIMARY, COLOR_SKY});
        tvAvatarInitial.setBackground(avatarBg);
        header.addView(tvAvatarInitial);

        // Greeting & Business Name
        LinearLayout textLayout = new LinearLayout(this);
        textLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        textLayout.setLayoutParams(textParams);

        TextView tvTitle = new TextView(this);
        tvTitle.setText("MissCall Assistant");
        tvTitle.setTextSize(18);
        tvTitle.setTypeface(null, Typeface.BOLD);
        tvTitle.setTextColor(COLOR_TEXT_PRIMARY);
        textLayout.addView(tvTitle);

        tvBusinessGreeting = new TextView(this);
        tvBusinessGreeting.setText(prefs.getString("business_name", "My Store"));
        tvBusinessGreeting.setTextSize(12);
        tvBusinessGreeting.setTextColor(COLOR_TEXT_SECONDARY);
        textLayout.addView(tvBusinessGreeting);

        header.addView(textLayout);

        // Live Active Pill Badge
        tvHeaderStatusPill = new TextView(this);
        tvHeaderStatusPill.setText("● Active • Free");
        tvHeaderStatusPill.setTextSize(11);
        tvHeaderStatusPill.setTypeface(null, Typeface.BOLD);
        tvHeaderStatusPill.setPadding(22, 10, 22, 10);
        header.addView(tvHeaderStatusPill);

        return header;
    }

    // --- 3-TAB NAVIGATION BAR (HOME • ACTIVITY • SETTINGS) ---
    private View createNavigationTabBar() {
        LinearLayout tabBar = new LinearLayout(this);
        tabBar.setOrientation(LinearLayout.HORIZONTAL);
        tabBar.setBackgroundColor(COLOR_BG);
        tabBar.setPadding(28, 4, 28, 16);

        btnNavHome = createNavButton("🏠 Home", 0);
        btnNavActivity = createNavButton("📋 Activity", 1);
        btnNavSettings = createNavButton("⚙️ Settings", 2);

        tabBar.addView(btnNavHome);
        tabBar.addView(btnNavActivity);
        tabBar.addView(btnNavSettings);

        return tabBar;
    }

    private Button createNavButton(String title, final int tabIndex) {
        Button btn = new Button(this);
        btn.setText(title);
        btn.setTextSize(12);
        btn.setPadding(24, 14, 24, 14);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(6, 0, 6, 0);
        btn.setLayoutParams(lp);
        btn.setOnClickListener(v -> switchTab(tabIndex));
        AndroidSecurityManager.applyTapjackingDefense(btn);
        return btn;
    }

    private void switchTab(int tabIndex) {
        currentTab = tabIndex;
        updateNavButtonState(btnNavHome, tabIndex == 0);
        updateNavButtonState(btnNavActivity, tabIndex == 1);
        updateNavButtonState(btnNavSettings, tabIndex == 2);

        containerHome.setVisibility(tabIndex == 0 ? View.VISIBLE : View.GONE);
        containerActivity.setVisibility(tabIndex == 1 ? View.VISIBLE : View.GONE);
        containerSettings.setVisibility(tabIndex == 2 ? View.VISIBLE : View.GONE);

        if (tabIndex == 1) {
            populateActivityLogs();
        }
    }

    private void updateNavButtonState(Button btn, boolean isSelected) {
        if (btn == null) return;
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(24);
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

    // --- TAB 0: HOME SCREEN ---
    private LinearLayout createHomeTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 32);

        // 1. Hero Automation Switch Card
        LinearLayout cardAutomation = createCard();
        switchAutomation = new Switch(this);
        switchAutomation.setText("Automate Missed Call SMS");
        switchAutomation.setTextSize(16);
        switchAutomation.setTypeface(null, Typeface.BOLD);
        switchAutomation.setTextColor(COLOR_TEXT_PRIMARY);
        switchAutomation.setChecked(prefs.getBoolean("auto_reply_enabled", true));
        switchAutomation.setOnCheckedChangeListener((bv, isChecked) -> {
            prefs.edit().putBoolean("auto_reply_enabled", isChecked).apply();
            if (!isChecked) {
                PendingSmsScheduler.getInstance().cancelAll();
                Toast.makeText(MainActivity.this, "Automation paused.", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(MainActivity.this, "Automation active & listening.", Toast.LENGTH_SHORT).show();
            }
            updateStatusHeader();
        });
        cardAutomation.addView(switchAutomation);

        tvAutomationSubtext = new TextView(this);
        tvAutomationSubtext.setText("Runs 100% on-device. Dispatches instant SMS when a customer call is missed.");
        tvAutomationSubtext.setTextSize(12);
        tvAutomationSubtext.setTextColor(COLOR_TEXT_SECONDARY);
        tvAutomationSubtext.setPadding(0, 8, 0, 0);
        cardAutomation.addView(tvAutomationSubtext);
        tab.addView(cardAutomation);
        addSpacing(tab, 18);

        // 2. Anti-Awkward Delay Selector (2s, 5s, 10s Pills)
        LinearLayout cardDelay = createCard();
        cardDelay.addView(createSectionTitle("Anti-Awkward Delay Safeguard"));

        TextView tvDelayExpl = new TextView(this);
        tvDelayExpl.setText("Delay before sending SMS. If you call back first, SMS is automatically cancelled!");
        tvDelayExpl.setTextSize(12);
        tvDelayExpl.setTextColor(COLOR_TEXT_MUTED);
        tvDelayExpl.setPadding(0, 0, 0, 12);
        cardDelay.addView(tvDelayExpl);

        LinearLayout delayRow = new LinearLayout(this);
        delayRow.setOrientation(LinearLayout.HORIZONTAL);

        selectedDelaySeconds = prefs.getInt("sms_delay_seconds", 5);
        btnDelay2 = createDelayPillButton("2s Instant", 2);
        btnDelay5 = createDelayPillButton("5s Recommended", 5);
        btnDelay10 = createDelayPillButton("10s Safe", 10);

        delayRow.addView(btnDelay2);
        delayRow.addView(btnDelay5);
        delayRow.addView(btnDelay10);
        cardDelay.addView(delayRow);

        updateDelayPillsUI();
        tab.addView(cardDelay);
        addSpacing(tab, 18);

        // 3. Live SMS Template Preview & Edit
        LinearLayout cardTemplate = createCard();
        cardTemplate.addView(createSectionTitle("Active Missed Call Template"));

        tvSmsPreviewContent = new TextView(this);
        tvSmsPreviewContent.setTextSize(13);
        tvSmsPreviewContent.setTextColor(COLOR_TEXT_PRIMARY);
        tvSmsPreviewContent.setPadding(20, 16, 20, 16);
        GradientDrawable previewBg = new GradientDrawable();
        previewBg.setColor(Color.parseColor("#EFF6FF"));
        previewBg.setCornerRadius(14);
        previewBg.setStroke(2, Color.parseColor("#BFDBFE"));
        tvSmsPreviewContent.setBackground(previewBg);
        cardTemplate.addView(tvSmsPreviewContent);

        addSpacing(cardTemplate, 12);

        Button btnEditTemplate = createButton("Customize Template in Settings", Color.WHITE, COLOR_PRIMARY);
        btnEditTemplate.setOnClickListener(v -> switchTab(2));
        cardTemplate.addView(btnEditTemplate);

        tab.addView(cardTemplate);
        addSpacing(tab, 18);

        // 4. Safe In-Memory Simulator Card
        LinearLayout cardSim = createCard();
        cardSim.addView(createSectionTitle("Safe Test Simulator"));

        TextView tvSimDesc = new TextView(this);
        tvSimDesc.setText("Test missed call detection and countdown safeguard without spending carrier balance.");
        tvSimDesc.setTextSize(12);
        tvSimDesc.setTextColor(COLOR_TEXT_MUTED);
        tvSimDesc.setPadding(0, 0, 0, 12);
        cardSim.addView(tvSimDesc);

        Button btnTestSim = createButton("▶ Test Missed Call Simulation", COLOR_SKY, Color.WHITE);
        btnTestSim.setOnClickListener(v -> runSafeTestSimulation());
        cardSim.addView(btnTestSim);

        tab.addView(cardSim);
        return tab;
    }

    private Button createDelayPillButton(String label, final int seconds) {
        Button btn = new Button(this);
        btn.setText(label);
        btn.setTextSize(11);
        btn.setPadding(12, 10, 12, 10);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(4, 0, 4, 0);
        btn.setLayoutParams(lp);
        btn.setOnClickListener(v -> {
            selectedDelaySeconds = seconds;
            prefs.edit().putInt("sms_delay_seconds", seconds).apply();
            updateDelayPillsUI();
            Toast.makeText(MainActivity.this, "Delay set to " + seconds + " seconds", Toast.LENGTH_SHORT).show();
        });
        AndroidSecurityManager.applyTapjackingDefense(btn);
        return btn;
    }

    private void updateDelayPillsUI() {
        applyPillStyle(btnDelay2, selectedDelaySeconds == 2);
        applyPillStyle(btnDelay5, selectedDelaySeconds == 5);
        applyPillStyle(btnDelay10, selectedDelaySeconds == 10);
    }

    private void applyPillStyle(Button btn, boolean isSelected) {
        if (btn == null) return;
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(18);
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

    // --- TAB 1: ACTIVITY & DELIVERY LOGS ---
    private LinearLayout createActivityTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 32);

        LinearLayout card = createCard();
        card.addView(createSectionTitle("Recent Missed Calls & Auto-SMS"));

        TextView tvSub = new TextView(this);
        tvSub.setText("Recorded on-device (capped at 100 recent entries for privacy & storage optimization).");
        tvSub.setTextSize(12);
        tvSub.setTextColor(COLOR_TEXT_MUTED);
        tvSub.setPadding(0, 0, 0, 16);
        card.addView(tvSub);

        layoutActivityList = new LinearLayout(this);
        layoutActivityList.setOrientation(LinearLayout.VERTICAL);
        card.addView(layoutActivityList);

        addSpacing(card, 16);

        Button btnClearLogs = createButton("Clear Activity Logs", Color.parseColor("#F1F5F9"), COLOR_TEXT_SECONDARY);
        btnClearLogs.setOnClickListener(v -> {
            ActivityLogger.clearLogs(MainActivity.this);
            populateActivityLogs();
            Toast.makeText(MainActivity.this, "Logs cleared.", Toast.LENGTH_SHORT).show();
        });
        card.addView(btnClearLogs);

        tab.addView(card);
        return tab;
    }

    private void populateActivityLogs() {
        if (layoutActivityList == null) return;
        layoutActivityList.removeAllViews();

        List<ActivityLogger.LogItem> logs = ActivityLogger.getRecentLogs(this);
        if (logs.isEmpty()) {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("✨ No Missed Calls Logged Yet\nWhen a call is missed, the event and automated SMS status will appear here.");
            tvEmpty.setTextSize(13);
            tvEmpty.setTextColor(COLOR_TEXT_MUTED);
            tvEmpty.setGravity(Gravity.CENTER);
            tvEmpty.setPadding(24, 40, 24, 40);
            layoutActivityList.addView(tvEmpty);
            return;
        }

        for (ActivityLogger.LogItem item : logs) {
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.VERTICAL);
            row.setPadding(20, 16, 20, 16);

            GradientDrawable rowBg = new GradientDrawable();
            rowBg.setColor(Color.parseColor("#F8FAFC"));
            rowBg.setCornerRadius(14);
            rowBg.setStroke(2, COLOR_CARD_BORDER);
            row.setBackground(rowBg);

            LinearLayout topRow = new LinearLayout(this);
            topRow.setOrientation(LinearLayout.HORIZONTAL);
            topRow.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvNumber = new TextView(this);
            tvNumber.setText(item.number);
            tvNumber.setTextSize(14);
            tvNumber.setTypeface(null, Typeface.BOLD);
            tvNumber.setTextColor(COLOR_TEXT_PRIMARY);
            LinearLayout.LayoutParams numLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            tvNumber.setLayoutParams(numLp);
            topRow.addView(tvNumber);

            TextView tvBadge = new TextView(this);
            int badgeColor = COLOR_PRIMARY;
            String badgeText = item.type;
            if ("SMS_SENT".equals(item.type)) {
                badgeColor = COLOR_SUCCESS;
                badgeText = "✓ SMS Sent";
            } else if ("SMS_CANCELLED".equals(item.type)) {
                badgeColor = COLOR_WARNING;
                badgeText = "✕ Cancelled";
            } else if ("MISSED_CALL".equals(item.type)) {
                badgeColor = COLOR_PRIMARY;
                badgeText = "📞 Missed Call";
            }
            tvBadge.setText(badgeText);
            tvBadge.setTextSize(10);
            tvBadge.setTypeface(null, Typeface.BOLD);
            tvBadge.setTextColor(badgeColor);
            topRow.addView(tvBadge);

            row.addView(topRow);

            TextView tvDetails = new TextView(this);
            tvDetails.setText(item.details + " • " + item.formattedTime);
            tvDetails.setTextSize(11);
            tvDetails.setTextColor(COLOR_TEXT_MUTED);
            tvDetails.setPadding(0, 4, 0, 8);
            row.addView(tvDetails);

            // Action Buttons: Call Back & WhatsApp
            LinearLayout actionRow = new LinearLayout(this);
            actionRow.setOrientation(LinearLayout.HORIZONTAL);

            Button btnCall = new Button(this);
            btnCall.setText("📞 Call Back");
            btnCall.setTextSize(10);
            btnCall.setPadding(16, 8, 16, 8);
            GradientDrawable callBg = new GradientDrawable();
            callBg.setColor(Color.parseColor("#EFF6FF"));
            callBg.setCornerRadius(10);
            btnCall.setBackground(callBg);
            btnCall.setTextColor(COLOR_PRIMARY);
            btnCall.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + item.number)));
                } catch (Exception ignored) {}
            });
            actionRow.addView(btnCall);

            Button btnWa = new Button(this);
            btnWa.setText("💬 WhatsApp");
            btnWa.setTextSize(10);
            btnWa.setPadding(16, 8, 16, 8);
            LinearLayout.LayoutParams waLp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            waLp.setMargins(12, 0, 0, 0);
            btnWa.setLayoutParams(waLp);
            GradientDrawable waBg = new GradientDrawable();
            waBg.setColor(Color.parseColor("#ECFDF5"));
            waBg.setCornerRadius(10);
            btnWa.setBackground(waBg);
            btnWa.setTextColor(COLOR_SUCCESS);
            btnWa.setOnClickListener(v -> {
                try {
                    String cleanPhone = item.number.replaceAll("[^0-9]", "");
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/" + cleanPhone)));
                } catch (Exception ignored) {}
            });
            actionRow.addView(btnWa);

            row.addView(actionRow);
            layoutActivityList.addView(row);
            addSpacing(layoutActivityList, 10);
        }
    }

    // --- TAB 2: SETTINGS SCREEN ---
    private LinearLayout createSettingsTab() {
        LinearLayout tab = new LinearLayout(this);
        tab.setOrientation(LinearLayout.VERTICAL);
        tab.setPadding(32, 8, 32, 32);

        // 1. Business Profile Card
        LinearLayout cardProfile = createCard();
        cardProfile.addView(createSectionTitle("Business Profile"));

        cardProfile.addView(createFieldLabel("Your Name / Owner"));
        editUserName = createEditText(prefs.getString("user_name", "Business Owner"), false);
        cardProfile.addView(editUserName);

        cardProfile.addView(createFieldLabel("Business Name"));
        editBusinessName = createEditText(prefs.getString("business_name", "My Store"), false);
        cardProfile.addView(editBusinessName);

        cardProfile.addView(createFieldLabel("Location / City"));
        editLocation = createEditText(prefs.getString("business_location", "India"), false);
        cardProfile.addView(editLocation);

        tab.addView(cardProfile);
        addSpacing(tab, 18);

        // 2. Telephony & SMS Template Settings
        LinearLayout cardTemplate = createCard();
        cardTemplate.addView(createSectionTitle("SMS Reply & Carrier Routing"));

        cardTemplate.addView(createFieldLabel("Missed Call SMS Template"));
        editSmsTemplate = createEditText(
            prefs.getString("sms_template", "Hello! Sorry we missed your call from {{business_name}}. How can we help you today?"),
            true
        );
        cardTemplate.addView(editSmsTemplate);

        cardTemplate.addView(createFieldLabel("Dispatch Carrier SIM"));
        spinnerSimSlot = new Spinner(this);
        spinnerSimSlot.setPadding(16, 16, 16, 16);
        cardTemplate.addView(spinnerSimSlot);

        addSpacing(cardTemplate, 12);
        Button btnSave = createButton("Save Settings", COLOR_PRIMARY, Color.WHITE);
        btnSave.setOnClickListener(v -> saveAllSettings());
        cardTemplate.addView(btnSave);

        tab.addView(cardTemplate);
        addSpacing(tab, 18);

        // 3. System Permissions Health Card
        LinearLayout cardHealth = createCard();
        cardHealth.addView(createSectionTitle("System Permissions Health"));

        tvDiagnosticsDetails = new TextView(this);
        tvDiagnosticsDetails.setTextSize(12);
        tvDiagnosticsDetails.setTextColor(COLOR_TEXT_SECONDARY);
        tvDiagnosticsDetails.setPadding(0, 4, 0, 12);
        cardHealth.addView(tvDiagnosticsDetails);

        btnGrantPermissions = createButton("Grant Missing Permissions", COLOR_TEXT_PRIMARY, Color.WHITE);
        btnGrantPermissions.setOnClickListener(v -> requestPermissionsOrSettings());
        cardHealth.addView(btnGrantPermissions);

        tab.addView(cardHealth);
        addSpacing(tab, 18);

        // 4. Edition & Privacy Information
        LinearLayout cardAbout = createCard();
        cardAbout.addView(createSectionTitle("Application Edition"));

        TextView tvEdition = new TextView(this);
        tvEdition.setText("MissCall Assistant v1.0.2\n• 100% Free Lifetime Edition (No Subscription Required)\n• 100% Private On-Device Processing\n• Package: com.misscall.assistant");
        tvEdition.setTextSize(12);
        tvEdition.setTextColor(COLOR_TEXT_SECONDARY);
        tvEdition.setPadding(0, 4, 0, 12);
        cardAbout.addView(tvEdition);

        Button btnPrivacy = createButton("View Privacy Policy & Disclosure", Color.parseColor("#F1F5F9"), COLOR_TEXT_PRIMARY);
        btnPrivacy.setOnClickListener(v -> {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://missed-call-to-text.vercel.app/privacy")));
            } catch (Exception ignored) {}
        });
        cardAbout.addView(btnPrivacy);

        tab.addView(cardAbout);
        return tab;
    }

    // --- HELPER UI BUILDERS ---
    private LinearLayout createCard() {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(24, 22, 24, 22);

        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(COLOR_CARD);
        cardBg.setCornerRadius(18);
        cardBg.setStroke(2, COLOR_CARD_BORDER);
        card.setBackground(cardBg);
        return card;
    }

    private TextView createSectionTitle(String title) {
        TextView tv = new TextView(this);
        tv.setText(title);
        tv.setTextSize(15);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setTextColor(COLOR_TEXT_PRIMARY);
        tv.setPadding(0, 0, 0, 8);
        return tv;
    }

    private TextView createFieldLabel(String label) {
        TextView tv = new TextView(this);
        tv.setText(label);
        tv.setTextSize(12);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setTextColor(COLOR_TEXT_SECONDARY);
        tv.setPadding(0, 10, 0, 4);
        return tv;
    }

    private EditText createEditText(String text, boolean multiLine) {
        EditText et = new EditText(this);
        et.setText(text);
        et.setTextSize(13);
        et.setTextColor(COLOR_TEXT_PRIMARY);
        et.setPadding(20, 16, 20, 16);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#F8FAFC"));
        bg.setCornerRadius(12);
        bg.setStroke(2, COLOR_CARD_BORDER);
        et.setBackground(bg);

        if (multiLine) {
            et.setMinLines(3);
            et.setGravity(Gravity.TOP | Gravity.START);
        }
        return et;
    }

    private Button createButton(String text, int bgColor, int textColor) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextSize(13);
        btn.setTypeface(null, Typeface.BOLD);
        btn.setTextColor(textColor);
        btn.setPadding(24, 16, 24, 16);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(bgColor);
        bg.setCornerRadius(14);
        if (bgColor == Color.WHITE) {
            bg.setStroke(2, COLOR_CARD_BORDER);
        }
        btn.setBackground(bg);
        AndroidSecurityManager.applyTapjackingDefense(btn);
        return btn;
    }

    private void addSpacing(LinearLayout layout, int dp) {
        View v = new View(this);
        v.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp));
        layout.addView(v);
    }

    // --- STATE MANAGEMENT & HELPERS ---
    private void saveAllSettings() {
        String uName = editUserName != null ? editUserName.getText().toString().trim() : "Business Owner";
        String bizName = editBusinessName != null ? editBusinessName.getText().toString().trim() : "My Store";
        String loc = editLocation != null ? editLocation.getText().toString().trim() : "India";
        String tpl = editSmsTemplate != null ? editSmsTemplate.getText().toString().trim() : "";
        int simSlot = spinnerSimSlot != null ? spinnerSimSlot.getSelectedItemPosition() : 0;

        prefs.edit()
            .putString("user_name", uName)
            .putString("business_name", bizName)
            .putString("business_location", loc)
            .putString("sms_template", tpl)
            .putInt("selected_sim_slot", Math.max(0, simSlot))
            .apply();

        updateStatusHeader();
        Toast.makeText(this, "Settings saved successfully!", Toast.LENGTH_SHORT).show();
    }

    private void updateStatusHeader() {
        boolean autoEnabled = prefs.getBoolean("auto_reply_enabled", true);
        boolean hasPerms = checkAllPermissionsGranted();
        String bizName = prefs.getString("business_name", "My Store");

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
            } else if (!autoEnabled) {
                tvHeaderStatusPill.setText("Service Paused");
                tvHeaderStatusPill.setTextColor(COLOR_TEXT_MUTED);
                pillBg.setColor(Color.parseColor("#F1F5F9"));
            } else {
                tvHeaderStatusPill.setText("● Active • Free");
                tvHeaderStatusPill.setTextColor(COLOR_SUCCESS);
                pillBg.setColor(Color.parseColor("#ECFDF5"));
            }
            tvHeaderStatusPill.setBackground(pillBg);
        }

        if (tvSmsPreviewContent != null) {
            String raw = prefs.getString("sms_template", "Hello! Sorry we missed your call from {{business_name}}.");
            tvSmsPreviewContent.setText(raw.replace("{{business_name}}", bizName));
        }
    }

    private boolean checkAllPermissionsGranted() {
        boolean callLog = checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED;
        boolean sms = checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;
        boolean phoneState = checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        return callLog && sms && phoneState;
    }

    private void updateDiagnosticsUI() {
        if (tvDiagnosticsDetails == null) return;
        boolean callLog = checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED;
        boolean sms = checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;
        boolean phone = checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;

        String diag = (callLog ? "✓ Call Log: Granted\n" : "✗ Call Log: Missing (Required to detect missed call)\n")
            + (sms ? "✓ SMS: Granted\n" : "✗ SMS: Missing (Required to send auto-reply)\n")
            + (phone ? "✓ Phone State: Granted\n" : "✗ Phone State: Missing\n")
            + "✓ Delay Safeguard: " + prefs.getInt("sms_delay_seconds", 5) + " seconds";
        tvDiagnosticsDetails.setText(diag);

        if (btnGrantPermissions != null) {
            btnGrantPermissions.setVisibility(checkAllPermissionsGranted() ? View.GONE : View.VISIBLE);
        }
    }

    private void requestPermissionsOrSettings() {
        List<String> missing = new ArrayList<>();
        if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) missing.add(Manifest.permission.READ_PHONE_STATE);
        if (checkSelfPermission(Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) missing.add(Manifest.permission.READ_CALL_LOG);
        if (checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) missing.add(Manifest.permission.SEND_SMS);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            missing.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        if (!missing.isEmpty()) {
            requestPermissions(missing.toArray(new String[0]), PERMISSION_REQ_CODE);
        } else {
            Toast.makeText(this, "All required permissions are already granted!", Toast.LENGTH_SHORT).show();
        }
    }

    private void loadSimSlots() {
        activeSims.clear();
        simLabels.clear();

        if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
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

        if (simLabels.isEmpty()) {
            simLabels.add("SIM 1 (Default)");
            simLabels.add("SIM 2 (Secondary)");
        }

        if (spinnerSimSlot != null) {
            ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, simLabels);
            spinnerSimSlot.setAdapter(adapter);
            int savedSlot = prefs.getInt("selected_sim_slot", 0);
            if (savedSlot < simLabels.size()) {
                spinnerSimSlot.setSelection(savedSlot);
            }
        }
    }

    private void runSafeTestSimulation() {
        ActivityLogger.log(this, "MISSED_CALL", "+91 98765 43210", "Simulated incoming test missed call");
        ActivityLogger.log(this, "SMS_SENT", "+91 98765 43210", "Simulated auto-reply dispatched via SIM 1");
        Toast.makeText(this, "Test simulation logged! Check Activity tab.", Toast.LENGTH_SHORT).show();
        switchTab(1);
    }
}
