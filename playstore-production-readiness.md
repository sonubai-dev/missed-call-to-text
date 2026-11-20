# Plan: Google Play Store Production Readiness & Package Migration

## Objectives
1. **Migrate Application ID & Package Name:** Change from `com.misscall.whatsappassistant` to `com.misscall.assistant` across Gradle, Manifest, Java/Kotlin packages, and security test scripts to eliminate Google Play trademark/impersonation policy violations.
2. **Implement Policy-Compliant Trial Expiration UI:** Remove direct in-app Razorpay SDK calls for the Google Play release build so it complies strictly with Google Play Billing policies (14-day free trial on device, web account management message).
3. **Generate Production Release Keystore:** Create `app/keystore/release.jks` with standard 2048-bit RSA key and extract the SHA-256 fingerprint for Google Play App Signing.
4. **Configure Release AAB (`bundleRelease`) Pipeline:** Configure Gradle and GitHub Actions to generate signed Android App Bundle (`.aab`) ready for upload to Google Play Console.
5. **Verify Security Rules & Build:** Ensure all 10 Android Security Rules pass 100% and web dashboard compiles without errors.

---

## Phases & Tasks

### Phase 1: Package Name Migration (`com.misscall.assistant`)
- [ ] Rename Java/Kotlin package directory from `com/misscall/whatsappassistant` to `com/misscall/assistant`.
- [ ] Update `package com.misscall.assistant;` and imports across all Java and Kotlin source files.
- [ ] Update `app/build.gradle.kts`:
  - `applicationId = "com.misscall.assistant"`
  - `namespace = "com.misscall.assistant"`
- [ ] Update `app/src/main/AndroidManifest.xml`:
  - `package="com.misscall.assistant"`
  - Update all activity, receiver, and service component references.
- [ ] Update `app/proguard-rules.pro` to keep `com.misscall.assistant.**`.
- [ ] Update `scripts/test_10_android_security_rules.py` and `scripts/build_production_release.py`.

### Phase 2: Google Play Policy-Compliant Trial Screen
- [ ] In `MainActivity.java` / `SubscriptionClient.java`:
  - When 14-day trial expires, show informational text: `"Your 14-day free trial has completed. To manage your business subscription, visit https://missed-call-to-text.vercel.app"` with a button to view account details online (no direct native payment SDK call that triggers Play Billing policy violation).

### Phase 3: Production Keystore & Signing Configuration
- [ ] Check if `keytool` is available or generate a secure `release.jks` in `app/keystore/`.
- [ ] Configure `app/build.gradle.kts` release signing block.

### Phase 4: Verification & GitHub Sync
- [ ] Run `python scripts/test_10_android_security_rules.py` (Must achieve 10/10).
- [ ] Run `npm.cmd run build` for web dashboard.
- [ ] Commit all changes and push to `origin main`.
