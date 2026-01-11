# Android Build Fehler beheben

## Problem: INSTALL_FAILED_UPDATE_INCOMPATIBLE

**Fehler:**
```
INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package com.exponativewindtemplate.app signatures do not match newer version
```

**Ursache:** Die App ist bereits auf dem Emulator/Gerät installiert, aber mit einer anderen Signatur (z.B. von einem EAS Build oder einem anderen Signing-Key).

## Lösung

### Option 1: App vom Emulator deinstallieren (Empfohlen)

```bash
# App deinstallieren
adb uninstall com.exponativewindtemplate.app

# Dann neu bauen
npm run android
```

### Option 2: Emulator zurücksetzen

```bash
# Emulator komplett zurücksetzen (löscht alle Apps)
# In Android Studio: Device Manager → Wipe Data
```

### Option 3: Neuen Emulator erstellen

1. Öffne Android Studio
2. Gehe zu Tools → Device Manager
3. Erstelle einen neuen Emulator
4. Starte den neuen Emulator
5. Führe `npm run android` aus

## Schnellfix

```bash
# App deinstallieren und neu bauen
adb uninstall com.exponativewindtemplate.app && npm run android
```

## Weitere häufige Android Build Probleme

### 1. SDK nicht gefunden

**Fehler:** `SDK location not found`

**Lösung:** Erstelle `android/local.properties`:
```properties
sdk.dir=/Users/dmr/Library/Android/sdk
```

### 2. Gradle Build fehlgeschlagen

**Lösung:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 3. Kein Emulator/Gerät gefunden

**Prüfe verbundene Geräte:**
```bash
adb devices
```

**Falls leer:**
- Starte einen Emulator in Android Studio
- Oder verbinde ein physisches Gerät mit USB-Debugging aktiviert

### 4. Port bereits belegt

**Fehler:** `Port 8081 already in use`

**Lösung:**
```bash
# Prozess auf Port 8081 beenden
lsof -ti:8081 | xargs kill -9

# Oder anderen Port verwenden
npx expo start --port 8082
```

## Prävention

Um diesen Fehler zu vermeiden:
- Verwende immer den gleichen Signing-Key für Development Builds
- Deinstalliere die App vor einem neuen Build, wenn du den Signing-Key geändert hast
- Verwende `--clear` Flag beim Starten: `npx expo start --clear`
