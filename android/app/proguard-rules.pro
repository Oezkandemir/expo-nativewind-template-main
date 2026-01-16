# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.UIProp <fields>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# React Native - Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# React Native - Keep Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.common.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# react-native-screens
-keep class com.swmansion.rnscreens.** { *; }

# react-native-safe-area-context
-keep class com.th3rdwave.safeareacontext.** { *; }

# react-native-svg
-keep class com.horcrux.svg.** { *; }
-keep class com.facebook.react.views.text.** { *; }

# react-native-webview
-keep class com.reactnativecommunity.webview.** { *; }

# react-native-worklets-core
-keep class com.margelo.reactnativeworklets.** { *; }
-keep class com.margelo.worklets.** { *; }

# @gorhom/bottom-sheet
-keep class com.gorhom.bottomSheet.** { *; }
-keep class com.gorhom.portal.** { *; }

# Expo
-keep class expo.modules.** { *; }
-keep class org.unimodules.** { *; }
-keepclassmembers class expo.modules.** { *; }

# Expo Router
-keep class expo.router.** { *; }

# Supabase
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# Keep native method names for crash reporting
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep annotation default values
-keepattributes AnnotationDefault

# Keep line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep important attributes for reflection and crash reporting
-keepattributes Exceptions,Signature,Deprecated,EnclosingMethod,InnerClasses
-keepattributes *Annotation*
-keepattributes EnclosingMethod

# Firebase / Google Services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native New Architecture
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep all React Native ViewManagers
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.SimpleViewManager { *; }
-keep class * implements com.facebook.react.uimanager.ViewManager { *; }

# Keep React Native Modules
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { *; }
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }

# Expo Modules - Comprehensive
-keep class expo.modules.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.interfaces.** { *; }
-keepclassmembers class expo.modules.** { *; }
-keepclassmembers class * extends expo.modules.core.interfaces.** { *; }

# Expo specific modules
-keep class expo.modules.camera.** { *; }
-keep class expo.modules.clipboard.** { *; }
-keep class expo.modules.contacts.** { *; }
-keep class expo.modules.location.** { *; }
-keep class expo.modules.mediaLibrary.** { *; }
-keep class expo.modules.notifications.** { *; }
-keep class expo.modules.splashscreen.** { *; }
-keep class expo.modules.font.** { *; }
-keep class expo.modules.image.** { *; }
-keep class expo.modules.haptics.** { *; }
-keep class expo.modules.blur.** { *; }
-keep class expo.modules.webBrowser.** { *; }
-keep class expo.modules.constants.** { *; }
-keep class expo.modules.linking.** { *; }
-keep class expo.modules.statusbar.** { *; }
-keep class expo.modules.systemui.** { *; }
-keep class expo.modules.network.** { *; }

# Expo Application
-keep class expo.modules.ApplicationLifecycleDispatcher { *; }
-keep class expo.modules.ReactNativeHostWrapper { *; }
-keep class expo.modules.ReactActivityDelegateWrapper { *; }

# Keep MainApplication and MainActivity
-keep class com.exponativewindtemplate.app.MainApplication { *; }
-keep class com.exponativewindtemplate.app.MainActivity { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# NetInfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# Keep all classes with @ReactModule annotation
-keep @interface com.facebook.react.module.annotations.ReactModule
-keep @com.facebook.react.module.annotations.ReactModule class * { *; }

# Keep all classes with @ReactMethod annotation
-keep @interface com.facebook.react.bridge.annotations.ReactMethod
-keepclassmembers class * {
    @com.facebook.react.bridge.annotations.ReactMethod <methods>;
}

# Keep classes accessed via reflection (common in React Native)
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep all JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Keep R class
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Keep BuildConfig
-keep class **.BuildConfig { *; }

# Keep all enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep native method names and signatures
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# Keep JNI methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Don't warn about missing classes (some might be optional)
-dontwarn com.facebook.react.**
-dontwarn expo.modules.**
-dontwarn org.unimodules.**

# Keep Kotlin metadata
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep Kotlin coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# Keep Kotlin serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# Keep all classes in the app package (safety net)
-keep class com.exponativewindtemplate.app.** { *; }

# Add any project specific keep options here:
