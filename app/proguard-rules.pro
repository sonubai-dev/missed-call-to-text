# Keep app entry points
-keep class com.misscall.whatsappassistant.** { *; }
-keep class com.misscall.whatsappassistant.presentation.MainActivity { *; }
-keep class com.misscall.whatsappassistant.MissCallApplication { *; }
-keep class com.misscall.whatsappassistant.telephony.** { *; }

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
