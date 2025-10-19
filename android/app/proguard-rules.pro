# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-svg
-keep public class com.horcrux.svg.** {*;}

# react-native-vector-icons
-keep class com.oblador.vectoricons.** { *; }

# Expo vector icons
-keep class expo.modules.** { *; }

# QR Code SVG
-keep class org.wonday.pdf.** { *; }

# Keep all font files
-keep class **.R$font { *; }
-keep class **.R$drawable { *; }

# Keep React Native image resources
-keep class com.facebook.react.views.image.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Prevent stripping of image and icon assets
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Add any project specific keep options here:
