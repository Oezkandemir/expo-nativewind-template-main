# Android Install-Fehler beheben

## Problem

```
INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package com.exponativewindtemplate.app 
signatures do not match newer version; ignoring!
```

Dieser Fehler tritt auf, wenn bereits eine Version der App mit einer anderen Signatur installiert ist.

## Lösung

### Option 1: Alte App manuell deinstallieren

```bash
# Prüfe verbundene Geräte
adb devices

# Deinstalliere die alte App
adb uninstall com.exponativewindtemplate.app

# Bereinige Build-Cache
cd android
./gradlew clean
cd ..

# Installiere neu
npx expo run:android
```

### Option 2: Über den Emulator

1. Öffne den Android Emulator
2. Gehe zu Settings → Apps
3. Suche nach "spotx" oder "exponativewindtemplate"
4. Deinstalliere die App
5. Führe dann `npx expo run:android` erneut aus

### Option 3: Emulator zurücksetzen

Falls nichts funktioniert, kannst du den Emulator zurücksetzen:

1. Öffne Android Studio
2. Tools → Device Manager
3. Klicke auf das Dropdown-Menü des Emulators
4. Wähle "Cold Boot Now" oder "Wipe Data"

## Schnell-Fix Script

Führe aus:

```bash
chmod +x fix-android-install.sh
./fix-android-install.sh
```

Dann:

```bash
npx expo run:android
```

## Warum passiert das?

- Die App wurde mit einem anderen Signing Key erstellt
- Ein neuer Build wurde mit einem anderen Key signiert
- Android erlaubt keine Updates, wenn die Signaturen nicht übereinstimmen

## Prävention

Für Production Builds solltest du einen eigenen Signing Key verwenden:

1. Erstelle einen KeyStore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Konfiguriere in `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('my-release-key.keystore')
           storePassword 'your-password'
           keyAlias 'my-key-alias'
           keyPassword 'your-password'
       }
   }
   ```

3. Verwende den Release-Build:
   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```
