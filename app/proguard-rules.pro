# Keep app entry points
-keep class com.misscall.assistant.** { *; }
-keep class com.misscall.assistant.presentation.MainActivity { *; }
-keep class com.misscall.assistant.MissCallApplication { *; }
-keep class com.misscall.assistant.telephony.** { *; }

# Keep Hilt generated classes
-keep class * extends com.google.dagger.hilt.android.lifecycle.HiltViewModel { *; }
-keep class dagger.hilt.** { *; }

# Keep Kotlin coroutines
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# Keep Room database
-keep class * extends androidx.room.RoomDatabase { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }

# Keep Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keep class com.jakewharton.retrofit2.** { *; }

# Keep serialization
-keep class kotlinx.serialization.** { *; }
-keep class * extends kotlinx.serialization.KSerializer { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }

# =========================================================================
# RULE 9 (SEC-09-R8-OBFUSCATION): R8 / ProGuard Obfuscation & Hardening
# =========================================================================

# Keep Security Enforcement Suite
-keep class com.misscall.assistant.security.** { *; }

# Razorpay SDK security rules
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Strip verbose/debug logs in release builds to prevent credential and phone leakage
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}

# Preserve cryptographic and serializable models
-keepattributes EnclosingMethod,InnerClasses,Signature,*Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
