# Plan: 100% Lifetime Free Modern Electric Blue Redesign

## Overview
Redesign MissCall Assistant into a 100% Lifetime Free, zero-login, production-ready utility. Eliminate all paywalls, trial countdowns, ₹99/month references, and subscription locking dialogs. Implement the **Modern Electric Blue** palette (`#2563EB` sapphire, `#0284C7` cyan, `#F8FAFC` slate-50 canvas, crisp border tokens `#E2E8F0`, zero purple) with a clean 3-Tab Bottom Navigation (`Home`, `Activity`, `Settings`). Update the public landing page to reflect "100% Free Forever • No Sign-up Required".

---

## Target Architecture & UI Changes

### 1. Android Application (`app/`)
- **Remove Paywall & Trial Barriers:**
  - In `SubscriptionClient.java`: Always return `isEntitled = true`. Remove all payment requirements.
  - In `MainActivity.java`: Remove `containerSubscription`, `btnNavSubscription`, and `showHardPaywallDialog()`.
  - Remove all ₹99/mo, ₹100/mo, and Razorpay checkout triggers from the user UI.
  - Background device registration remains silently active with graceful offline fallback (never blocks the UI).
- **Modern Electric Blue 3-Tab Layout:**
  - **Tab 1: Home:**
    - Live Automation Status Hero Card with animated pulse dot.
    - Quick Action Delay Pills (`2s`, `5s`, `10s`) with smooth active highlight.
    - Dual-SIM Smart Switcher Card (`SIM 1`, `SIM 2`) with live carrier labels.
    - Instant SMS Template Editor with dynamic token preview (`{{business_name}}`).
    - Test Call Simulator button to safely test in-memory.
  - **Tab 2: Activity:**
    - Clean chronologically sorted list of recent missed calls and dispatched SMS logs.
    - Delivery status badges (`Sent`, `Scheduled`, `Cancelled via Callback`).
    - Local storage with 100-entry rolling FIFO cap.
  - **Tab 3: Settings:**
    - Business details (Store name, sender identity).
    - Delay & SIM default routing preferences.
    - System Permissions Health Card (Call Log, SMS, Phone State).
    - Clear cache / local data reset options.
    - Privacy Policy & Terms links.
- **Color Palette Tokens (Zero Purple):**
  - Primary Brand: `#2563EB` (Electric Sapphire)
  - Secondary Accent: `#0284C7` (Sky Cyan)
  - Surface Canvas: `#F8FAFC` (Slate 50)
  - Card Surface: `#FFFFFF` (Pure White)
  - Borders: `#E2E8F0` (Slate 200)
  - Text Primary: `#0F172A` (Slate 900)
  - Text Muted: `#64748B` (Slate 500)
  - Success Green: `#10B981` (Emerald)

### 2. Public Website & Dashboard (`web-dashboard/` & `src/`)
- Update Hero headline: **"100% Free Forever • Missed Call SMS Automation for Small Businesses"**.
- Remove pricing tiers / ₹99 badges from download cards and hero sections.
- Emphasize "No Credit Card, No Login, No Ads, 100% Private On-Device".
- Ensure mobile-responsive download cards and simulator view.

### 3. Verification & Compliance
- Verify all 10 Android Security Rules (`python scripts/test_10_android_security_rules.py`).
- Verify Web Build (`npm run build`).
- Commit and push to GitHub `main`.
