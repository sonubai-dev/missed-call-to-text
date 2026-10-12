package com.misscall.whatsappassistant.presentation;

import android.Manifest;
import android.app.Activity;
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
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.misscall.whatsappassistant.telephony.SmsManagerHelper;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final int PERMISSION_REQ_CODE = 2001;

    private SharedPreferences prefs;
    private EditText editBusinessName;
    private EditText editSmsTemplate;
    private Switch switchAutoReply;
    private TextView tvSimStatus;
    private TextView tvPermissionStatus;
    private TextView tvSubStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences("misscall_prefs", Context.MODE_PRIVATE);

        // Build native dynamic UI
        ScrollView scrollView = new ScrollView(this);
        scrollView.setBackgroundColor(Color.parseColor("#0C1317"));
        scrollView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        LinearLayout rootLayout = new LinearLayout(this);
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setPadding(40, 60, 40, 80);
        scrollView.addView(rootLayout);

        // Header Section
        TextView tvTitle = new TextView(this);
        tvTitle.setText("MissCall Assistant");
        tvTitle.setTextColor(Color.parseColor("#25D366"));
        tvTitle.setTextSize(26);
        tvTitle.setTypeface(null, Typeface.BOLD);
        rootLayout.addView(tvTitle);

        TextView tvSubtitle = new TextView(this);
        tvSubtitle.setText("Automated Call Detection & Instant WhatsApp/SMS Follow-up");
        tvSubtitle.setTextColor(Color.parseColor("#8696A0"));
        tvSubtitle.setTextSize(13);
        tvSubtitle.setPadding(0, 8, 0, 40);
        rootLayout.addView(tvSubtitle);

        // Card 1: Status & Permissions Banner
        LinearLayout cardStatus = createCard(Color.parseColor("#1F2C34"));
        
        TextView tvStatusHeader = createCardTitle("System Status & Permissions");
        cardStatus.addView(tvStatusHeader);

        tvPermissionStatus = new TextView(this);
        tvPermissionStatus.setTextColor(Color.WHITE);
        tvPermissionStatus.setTextSize(14);
        tvPermissionStatus.setPadding(0, 10, 0, 10);
        cardStatus.addView(tvPermissionStatus);

        Button btnGrantPerms = createButton("Grant Required Permissions", Color.parseColor("#25D366"), Color.BLACK);
        btnGrantPerms.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                requestRequiredPermissions();
            }
        });
        cardStatus.addView(btnGrantPerms);
        rootLayout.addView(cardStatus);

        addSpacing(rootLayout, 30);

        // Card 2: Business Profile
        LinearLayout cardProfile = createCard(Color.parseColor("#1F2C34"));
        cardProfile.addView(createCardTitle("Business Profile"));

        TextView lblBiz = createLabel("Business Name:");
        cardProfile.addView(lblBiz);

        editBusinessName = createEditText(prefs.getString("business_name", "My Store"));
        cardProfile.addView(editBusinessName);

        TextView lblTemplate = createLabel("Instant Auto-Reply SMS Template:");
        cardProfile.addView(lblTemplate);

        editSmsTemplate = createEditText(prefs.getString(
            "sms_template",
            "Hello! Sorry we missed your call from our store. How can we help you today?"
        ));
        editSmsTemplate.setMinLines(3);
        cardProfile.addView(editSmsTemplate);

        Button btnSaveProfile = createButton("Save Settings", Color.parseColor("#202C33"), Color.WHITE);
        btnSaveProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                prefs.edit()
                    .putString("business_name", editBusinessName.getText().toString().trim())
                    .putString("sms_template", editSmsTemplate.getText().toString().trim())
                    .apply();
                Toast.makeText(MainActivity.this, "Settings saved successfully", Toast.LENGTH_SHORT).show();
            }
        });
        cardProfile.addView(btnSaveProfile);
        rootLayout.addView(cardProfile);

        addSpacing(rootLayout, 30);

        // Card 3: Automation & SIM Configuration
        LinearLayout cardAutomation = createCard(Color.parseColor("#1F2C34"));
        cardAutomation.addView(createCardTitle("Call Screening & Dual-SIM Setup"));

        switchAutoReply = new Switch(this);
        switchAutoReply.setText("Enable Missed Call Auto-SMS");
        switchAutoReply.setTextColor(Color.WHITE);
        switchAutoReply.setChecked(prefs.getBoolean("auto_reply_enabled", true));
        switchAutoReply.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                prefs.edit().putBoolean("auto_reply_enabled", isChecked).apply();
            }
        });
        cardAutomation.addView(switchAutoReply);

        tvSimStatus = new TextView(this);
        tvSimStatus.setTextColor(Color.parseColor("#8696A0"));
        tvSimStatus.setTextSize(13);
        tvSimStatus.setPadding(0, 16, 0, 16);
        cardAutomation.addView(tvSimStatus);

        Button btnSimulate = createButton("Test Follow-Up Workflow", Color.parseColor("#00A884"), Color.WHITE);
        btnSimulate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                simulateMissedCall();
            }
        });
        cardAutomation.addView(btnSimulate);
        rootLayout.addView(cardAutomation);

        addSpacing(rootLayout, 30);

        // Card 4: Pro Subscription & AutoPay
        LinearLayout cardSub = createCard(Color.parseColor("#182229"));
        cardSub.addView(createCardTitle("Pro Subscription"));

        tvSubStatus = new TextView(this);
        tvSubStatus.setText("Status: Active • Verified with VistaroAI Cloud");
        tvSubStatus.setTextColor(Color.parseColor("#25D366"));
        tvSubStatus.setTextSize(14);
        tvSubStatus.setPadding(0, 10, 0, 20);
        cardSub.addView(tvSubStatus);

        Button btnOpenWeb = createButton("Open Web Dashboard", Color.parseColor("#202C33"), Color.WHITE);
        btnOpenWeb.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://ais-dev-ut755injwoy6iy3whqwgcf-490915955561.asia-southeast1.run.app"));
                startActivity(browserIntent);
            }
        });
        cardSub.addView(btnOpenWeb);
        rootLayout.addView(cardSub);

        setContentView(scrollView);

        updatePermissionsAndSimInfo();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updatePermissionsAndSimInfo();
    }

    private void updatePermissionsAndSimInfo() {
        boolean hasCallLog = checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED;
        boolean hasPhone = checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        boolean hasSms = checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;

        if (hasCallLog && hasPhone && hasSms) {
            tvPermissionStatus.setText("All permissions granted! Call detection active.");
            tvPermissionStatus.setTextColor(Color.parseColor("#25D366"));
        } else {
            tvPermissionStatus.setText("Missing permissions: " +
                (!hasCallLog ? "Call Log, " : "") +
                (!hasPhone ? "Phone State, " : "") +
                (!hasSms ? "SMS " : "")
            );
            tvPermissionStatus.setTextColor(Color.parseColor("#EF4444"));
        }

        // SIM slots
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1 && hasPhone) {
            SubscriptionManager sm = (SubscriptionManager) getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
            if (sm != null) {
                try {
                    List<SubscriptionInfo> list = sm.getActiveSubscriptionInfoList();
                    if (list != null && !list.isEmpty()) {
                        StringBuilder sb = new StringBuilder("Active SIMs Detected:\n");
                        for (SubscriptionInfo info : list) {
                            sb.append("• Slot ").append(info.getSimSlotIndex() + 1)
                              .append(": ").append(info.getCarrierName()).append("\n");
                        }
                        tvSimStatus.setText(sb.toString().trim());
                    } else {
                        tvSimStatus.setText("Dual-SIM: Ready (Using system default line)");
                    }
                } catch (SecurityException e) {
                    tvSimStatus.setText("Dual-SIM: Permission required");
                }
            }
        } else {
            tvSimStatus.setText("Dual-SIM: Ready (Using system default line)");
        }
    }

    private void requestRequiredPermissions() {
        List<String> perms = new ArrayList<>();
        perms.add(Manifest.permission.READ_CALL_LOG);
        perms.add(Manifest.permission.READ_PHONE_STATE);
        perms.add(Manifest.permission.SEND_SMS);
        perms.add(Manifest.permission.READ_CONTACTS);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            perms.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        List<String> toRequest = new ArrayList<>();
        for (String p : perms) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                toRequest.add(p);
            }
        }

        if (!toRequest.isEmpty()) {
            requestPermissions(toRequest.toArray(new String[0]), PERMISSION_REQ_CODE);
        } else {
            Toast.makeText(this, "All permissions are already granted!", Toast.LENGTH_SHORT).show();
        }
    }

    private void simulateMissedCall() {
        Toast.makeText(this, "Simulating missed call follow-up...", Toast.LENGTH_SHORT).show();
        String sampleNumber = "+919876543210";
        String template = editSmsTemplate.getText().toString();

        // Launch WhatsApp Intent (Mode 1)
        try {
            Intent waIntent = new Intent(Intent.ACTION_VIEW);
            waIntent.setData(Uri.parse("https://api.whatsapp.com/send?phone=" + sampleNumber + "&text=" + Uri.encode(template)));
            waIntent.setPackage("com.whatsapp");
            startActivity(waIntent);
        } catch (Exception e) {
            // WhatsApp not installed or browser fallback
            Intent webIntent = new Intent(Intent.ACTION_VIEW);
            webIntent.setData(Uri.parse("https://api.whatsapp.com/send?phone=" + sampleNumber + "&text=" + Uri.encode(template)));
            startActivity(webIntent);
        }
    }

    private LinearLayout createCard(int bgColor) {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(36, 36, 36, 36);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(bgColor);
        bg.setCornerRadius(24);
        bg.setStroke(2, Color.parseColor("#2A3942"));
        layout.setBackground(bg);
        return layout;
    }

    private TextView createCardTitle(String title) {
        TextView tv = new TextView(this);
        tv.setText(title);
        tv.setTextColor(Color.WHITE);
        tv.setTextSize(17);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setPadding(0, 0, 0, 16);
        return tv;
    }

    private TextView createLabel(String text) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextColor(Color.parseColor("#8696A0"));
        tv.setTextSize(12);
        tv.setPadding(0, 10, 0, 4);
        return tv;
    }

    private EditText createEditText(String text) {
        EditText et = new EditText(this);
        et.setText(text);
        et.setTextColor(Color.WHITE);
        et.setTextSize(14);
        et.setPadding(20, 20, 20, 20);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#111B21"));
        bg.setCornerRadius(14);
        bg.setStroke(2, Color.parseColor("#2A3942"));
        et.setBackground(bg);
        return et;
    }

    private Button createButton(String text, int bgColor, int textColor) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(textColor);
        btn.setTextSize(14);
        btn.setTypeface(null, Typeface.BOLD);

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(bgColor);
        bg.setCornerRadius(16);
        btn.setBackground(bg);
        return btn;
    }

    private void addSpacing(LinearLayout layout, int height) {
        View v = new View(this);
        v.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, height));
        layout.addView(v);
    }
}
