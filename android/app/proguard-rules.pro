# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native / Expo shrinking best practices
# Reanimated & TurboModules
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Preserve React Prop annotations usage (reflection)
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}
-keepattributes *Annotation*

# Core RN classes accessed via reflection
-keep class com.facebook.react.views.image.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# react-native-svg
-keep public class com.horcrux.svg.** { *; }

# react-native-vector-icons and @expo/vector-icons
-keep class com.oblador.vectoricons.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# Lottie
-keep class com.airbnb.lottie.** { *; }

# VisionCamera (if present)
-keep class com.mrousavy.camera.** { *; }

# Keep generated R classes for fonts/drawables
-keep class **.R$font { *; }
-keep class **.R$drawable { *; }

# Add any project specific keep options here:
