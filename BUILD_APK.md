# Lokales APK-Build für Android

## Build-Prozess

Der Build läuft aktuell im Hintergrund. Das APK wird erstellt unter:

```
android/app/build/outputs/apk/release/app-release.apk
```

## Build-Status prüfen

Um zu sehen, ob der Build fertig ist, können Sie:

1. **Build-Log prüfen:**
   ```bash
   tail -f android/build.log
   ```

2. **APK-Datei prüfen:**
   ```bash
   ls -lh android/app/build/outputs/apk/release/app-release.apk
   ```

## APK auf Emulator installieren

Sobald das APK erstellt wurde, können Sie es auf Ihrem Android-Emulator installieren:

1. **Emulator starten** (falls noch nicht gestartet):
   ```bash
   emulator -avd <emulator-name>
   ```

2. **APK installieren:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

   Oder falls Sie die App neu installieren möchten:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

## Manuell neu bauen

Falls Sie das APK erneut erstellen möchten:

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## Alternative: Debug-APK (schneller)

Für Tests können Sie auch ein Debug-APK erstellen (schneller, aber größer):

```bash
cd android
./gradlew assembleDebug
```

Das Debug-APK finden Sie unter:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
