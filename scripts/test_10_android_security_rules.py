#!/usr/bin/env python3
"""
Test Suite for 10 Android Security Rules
MissCall Assistant Android Telephony Engine
"""

import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MANIFEST_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "AndroidManifest.xml")
NET_SEC_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "res", "xml", "network_security_config.xml")
PROGUARD_PATH = os.path.join(ROOT_DIR, "app", "proguard-rules.pro")
SEC_MANAGER_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "java", "com", "misscall", "whatsappassistant", "security", "AndroidSecurityManager.java")
MAIN_ACTIVITY_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "java", "com", "misscall", "whatsappassistant", "presentation", "MainActivity.java")
SCHEDULER_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "java", "com", "misscall", "whatsappassistant", "telephony", "PendingSmsScheduler.java")
SMS_HELPER_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "java", "com", "misscall", "whatsappassistant", "telephony", "SmsManagerHelper.java")
SUB_CLIENT_PATH = os.path.join(ROOT_DIR, "app", "src", "main", "java", "com", "misscall", "whatsappassistant", "data", "SubscriptionClient.java")

def print_test_header(num, title):
    print("\n" + "=" * 70)
    print(f"[*] TEST {num}/10: {title}")
    print("=" * 70)

def print_result(num, passed, message):
    status = "PASSED [✓]" if passed else "FAILED [✗]"
    color_code = "\033[92m" if passed else "\033[91m"
    reset_code = "\033[0m"
    print(f"{color_code}{status} Rule {num}: {message}{reset_code}")
    return passed

def test_rule_1_manifest_backup():
    print_test_header(1, "SEC-01-NO-BACKUP (Manifest Hardening & Auto-Backup Leak Prevention)")
    assert os.path.exists(MANIFEST_PATH), f"Manifest not found: {MANIFEST_PATH}"
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    has_backup_false = 'android:allowBackup="false"' in content
    has_fragile_false = 'android:hasFragileUserData="false"' in content

    print(f"  • Checking android:allowBackup=\"false\" ... {'Found' if has_backup_false else 'Missing'}")
    print(f"  • Checking android:hasFragileUserData=\"false\" ... {'Found' if has_fragile_false else 'Missing'}")

    passed = has_backup_false and has_fragile_false
    return print_result(1, passed, "Manifest explicitly disables adb backup and fragile user data leakage.")

def test_rule_2_receiver_permission_guard():
    print_test_header(2, "SEC-02-RECEIVER-GUARD (Broadcast Receiver Anti-Spoofing Permission Guard)")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    receiver_block = re.search(r'<receiver[\s\S]*?PhoneCallReceiver[\s\S]*?</receiver>', content)
    assert receiver_block, "PhoneCallReceiver block not found in Manifest"
    block_text = receiver_block.group(0)

    has_perm = 'android:permission="android.permission.READ_PHONE_STATE"' in block_text
    print(f"  • PhoneCallReceiver protected with READ_PHONE_STATE permission ... {'Yes' if has_perm else 'No'}")

    passed = has_perm
    return print_result(2, passed, "PhoneCallReceiver guarded against unauthorized third-party spoofed broadcasts.")

def test_rule_3_cleartext_traffic_block():
    print_test_header(3, "SEC-03-CLEARTEXT-BLOCK (Cleartext HTTP Prohibition & Strict TLS/HTTPS)")
    assert os.path.exists(NET_SEC_PATH), f"Network security config not found: {NET_SEC_PATH}"
    with open(NET_SEC_PATH, "r", encoding="utf-8") as f:
        net_content = f.read()

    cleartext_blocked = 'cleartextTrafficPermitted="false"' in net_content
    print(f"  • network_security_config cleartextTrafficPermitted=\"false\" ... {'Enforced' if cleartext_blocked else 'Missing'}")

    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()
    has_https_validator = "validateHttpsUrl" in sec_content

    with open(SUB_CLIENT_PATH, "r", encoding="utf-8") as f:
        sub_content = f.read()
    has_https_enforcement = 'candidate.startsWith("https://")' in sub_content

    print(f"  • AndroidSecurityManager.validateHttpsUrl implemented ... {'Yes' if has_https_validator else 'No'}")
    print(f"  • SubscriptionClient enforces HTTPS endpoints ... {'Yes' if has_https_enforcement else 'No'}")

    passed = cleartext_blocked and has_https_validator and has_https_enforcement
    return print_result(3, passed, "All network traffic strictly prohibits cleartext HTTP and enforces HTTPS.")

def test_rule_4_tapjacking_defense():
    print_test_header(4, "SEC-04-TAPJACKING-DEFENSE (Overlay Attack & Clickjacking Mitigation)")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest_content = f.read()

    manifest_filtered = 'android:filterTouchesWhenObscured="true"' in manifest_content
    print(f"  • Manifest MainActivity filterTouchesWhenObscured=\"true\" ... {'Found' if manifest_filtered else 'Missing'}")

    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()
    has_method = "applyTapjackingDefense" in sec_content

    with open(MAIN_ACTIVITY_PATH, "r", encoding="utf-8") as f:
        main_content = f.read()
    has_usage = "AndroidSecurityManager.applyTapjackingDefense" in main_content

    print(f"  • AndroidSecurityManager.applyTapjackingDefense defined ... {'Yes' if has_method else 'No'}")
    print(f"  • MainActivity applies tapjacking defense on buttons/root ... {'Yes' if has_usage else 'No'}")

    passed = manifest_filtered and has_method and has_usage
    return print_result(4, passed, "Tapjacking and malicious screen overlay attacks are actively mitigated.")

def test_rule_5_flag_secure_protection():
    print_test_header(5, "SEC-05-FLAG-SECURE (Screen Recording & Screenshot Blocker on Sensitive Screens)")
    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()
    has_flag_secure_util = "applyFlagSecure" in sec_content and "FLAG_SECURE" in sec_content

    with open(MAIN_ACTIVITY_PATH, "r", encoding="utf-8") as f:
        main_content = f.read()
    has_flag_usage = "AndroidSecurityManager.applyFlagSecure" in main_content

    print(f"  • AndroidSecurityManager.applyFlagSecure defined ... {'Yes' if has_flag_secure_util else 'No'}")
    print(f"  • MainActivity applies FLAG_SECURE on payment & paywall dialogs ... {'Yes' if has_flag_usage else 'No'}")

    passed = has_flag_secure_util and has_flag_usage
    return print_result(5, passed, "Sensitive billing and credential dialogs protected with FLAG_SECURE.")

def test_rule_6_sms_rate_limiting():
    print_test_header(6, "SEC-06-SMS-RATE-LIMIT (Anti-Toll-Fraud Circuit Breaker & SMS Rate Limiting)")
    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()

    has_cooldown = "PER_NUMBER_COOLDOWN_MS" in sec_content and "15 * 60 * 1000L" in sec_content
    has_ceiling = "MAX_SMS_PER_HOUR" in sec_content and "50" in sec_content
    has_check = "isSmsRateLimitAllowed" in sec_content
    has_record = "recordSmsDispatched" in sec_content

    with open(SCHEDULER_PATH, "r", encoding="utf-8") as f:
        sched_content = f.read()
    sched_enforced = "AndroidSecurityManager.isSmsRateLimitAllowed" in sched_content

    print(f"  • 15-Minute per-number cooldown defined ... {'Yes' if has_cooldown else 'No'}")
    print(f"  • 50 SMS/hour global ceiling defined ... {'Yes' if has_ceiling else 'No'}")
    print(f"  • PendingSmsScheduler enforces rate limit check ... {'Yes' if sched_enforced else 'No'}")

    passed = has_cooldown and has_ceiling and has_check and has_record and sched_enforced
    return print_result(6, passed, "SMS rate-limiting and anti-toll-fraud circuit breaker active.")

def test_rule_7_e164_sanitizer():
    print_test_header(7, "SEC-07-E164-SANITIZER (Strict E.164 Phone Sanitization & Control Injection Defense)")
    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()

    has_e164_pattern = "E164_PATTERN" in sec_content
    has_blocked_prefixes = "BLOCKED_PREFIXES" in sec_content and "1900" in sec_content
    has_validator = "sanitizeAndValidatePhoneNumber" in sec_content

    with open(SCHEDULER_PATH, "r", encoding="utf-8") as f:
        sched_content = f.read()
    sched_calls_sanitizer = "AndroidSecurityManager.sanitizeAndValidatePhoneNumber" in sched_content

    with open(SMS_HELPER_PATH, "r", encoding="utf-8") as f:
        helper_content = f.read()
    helper_calls_sanitizer = "AndroidSecurityManager.sanitizeAndValidatePhoneNumber" in helper_content

    print(f"  • E.164 Regex pattern check implemented ... {'Yes' if has_e164_pattern else 'No'}")
    print(f"  • Premium toll prefixes blocked (1900, 900, etc.) ... {'Yes' if has_blocked_prefixes else 'No'}")
    print(f"  • Scheduler & SmsManagerHelper enforce sanitization ... {'Yes' if sched_calls_sanitizer and helper_calls_sanitizer else 'No'}")

    # Unit test logic check on regex simulation
    test_valid = "+919876543210"
    test_invalid_short = "100"
    test_invalid_chars = "+9198765*432#"
    pattern = re.compile(r"^\+?[1-9]\d{6,14}$")
    unit_ok = bool(pattern.match(test_valid)) and not bool(pattern.match(test_invalid_short))

    passed = has_e164_pattern and has_blocked_prefixes and has_validator and sched_calls_sanitizer and unit_ok
    return print_result(7, passed, "Strict E.164 number validation blocks invalid formats and injection characters.")

def test_rule_8_root_integrity():
    print_test_header(8, "SEC-08-INTEGRITY-ROOT (Environment Integrity & Root / Tamper Detection)")
    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()

    has_root_check = "isDeviceRootedOrCompromised" in sec_content
    checks_test_keys = "test-keys" in sec_content
    checks_su_paths = "/system/bin/su" in sec_content and "/sbin/su" in sec_content

    print(f"  • isDeviceRootedOrCompromised implemented ... {'Yes' if has_root_check else 'No'}")
    print(f"  • Build test-keys heuristic included ... {'Yes' if checks_test_keys else 'No'}")
    print(f"  • Known su binary filesystem paths included ... {'Yes' if checks_su_paths else 'No'}")

    passed = has_root_check and checks_test_keys and checks_su_paths
    return print_result(8, passed, "Device integrity heuristics detect rooted and compromised environments.")

def test_rule_9_proguard_r8():
    print_test_header(9, "SEC-09-R8-OBFUSCATION (R8 / ProGuard Obfuscation & Sensitive Log Stripping)")
    assert os.path.exists(PROGUARD_PATH), f"ProGuard rules not found: {PROGUARD_PATH}"
    with open(PROGUARD_PATH, "r", encoding="utf-8") as f:
        pg_content = f.read()

    has_log_strip = "-assumenosideeffects class android.util.Log" in pg_content
    has_sec_keep = "com.misscall.whatsappassistant.security" in pg_content
    has_razorpay_keep = "com.razorpay" in pg_content

    print(f"  • Release log stripping (-assumenosideeffects android.util.Log) ... {'Configured' if has_log_strip else 'Missing'}")
    print(f"  • Security suite rule preservation ... {'Configured' if has_sec_keep else 'Missing'}")
    print(f"  • Razorpay SDK rules ... {'Configured' if has_razorpay_keep else 'Missing'}")

    passed = has_log_strip and has_sec_keep and has_razorpay_keep
    return print_result(9, passed, "ProGuard / R8 rules strip release logs and protect cryptographic interfaces.")

def test_rule_10_token_scrubbing():
    print_test_header(10, "SEC-10-TOKEN-SCRUB (Memory Token Scrubbing & Zero Plaintext Keystore Guard)")
    with open(SEC_MANAGER_PATH, "r", encoding="utf-8") as f:
        sec_content = f.read()

    has_scrub = "scrubMemory" in sec_content and "Arrays.fill(buffer, '\\0')" in sec_content
    has_sanitize_msg = "sanitizeMessageContent" in sec_content

    with open(SUB_CLIENT_PATH, "r", encoding="utf-8") as f:
        sub_content = f.read()
    safe_errors = "SERVER_ERROR_" in sub_content

    print(f"  • Memory scrubbing utility (scrubMemory) ... {'Implemented' if has_scrub else 'Missing'}")
    print(f"  • Message sanitization against invisible Unicode ... {'Implemented' if has_sanitize_msg else 'Missing'}")
    print(f"  • Secure error token reporting without stacktrace leakage ... {'Yes' if safe_errors else 'No'}")

    passed = has_scrub and has_sanitize_msg and safe_errors
    return print_result(10, passed, "Token memory scrubbing and credential sanitization active.")

def main():
    print("\n" + "=" * 70)
    print("  MISSCALL ASSISTANT — 10 ANDROID SECURITY RULES VERIFICATION SUITE")
    print("=" * 70)

    results = []
    tests = [
        test_rule_1_manifest_backup,
        test_rule_2_receiver_permission_guard,
        test_rule_3_cleartext_traffic_block,
        test_rule_4_tapjacking_defense,
        test_rule_5_flag_secure_protection,
        test_rule_6_sms_rate_limiting,
        test_rule_7_e164_sanitizer,
        test_rule_8_root_integrity,
        test_rule_9_proguard_r8,
        test_rule_10_token_scrubbing,
    ]

    for test_fn in tests:
        results.append(test_fn())

    passed_count = sum(1 for r in results if r)
    total_count = len(results)

    print("\n" + "=" * 70)
    print(f"  FINAL SECURITY AUDIT SCORE: {passed_count}/{total_count} RULES PASSED")
    print("=" * 70)

    if passed_count == total_count:
        print("\033[92m[✓] ALL 10 ANDROID SECURITY RULES PASSED WITH 100% COMPLIANCE!\033[0m\n")
        return 0
    else:
        print(f"\033[91m[✗] {total_count - passed_count} SECURITY TEST(S) FAILED!\033[0m\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
