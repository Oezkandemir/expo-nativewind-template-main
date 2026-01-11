# Firebase Android Setup für Push-Benachrichtigungen

## ✅ Was wurde bereits konfiguriert

1. ✅ Google Services Plugin zur root `build.gradle` hinzugefügt
2. ✅ Google Services Plugin zur app `build.gradle` hinzugefügt
3. ✅ Firebase BoM und Firebase Messaging Abhängigkeiten hinzugefügt
4. ✅ Firebase Analytics hinzugefügt (optional)

## 📋 Noch zu erledigen

### Schritt 1: google-services.json kopieren

Die `google-services.json` Datei muss ins `android/app/` Verzeichnis kopiert werden:

```bash
cp google-services.json android/app/google-services.json
```

**Wichtig:** Die Datei muss genau im `android/app/` Verzeichnis liegen, damit das Google Services Plugin sie finden kann.

### Schritt 2: Gradle synchronisieren

Nach dem Kopieren der Datei, synchronisiere das Android-Projekt:

```bash
cd android
./gradlew clean
```

Oder in Android Studio:
- File → Sync Project with Gradle Files

### Schritt 3: Build testen

```bash
# Im Root-Verzeichnis
npx expo run:android
```

## 🔍 Überprüfung

Stelle sicher, dass:

1. ✅ `android/app/google-services.json` existiert
2. ✅ `android/build.gradle` enthält `classpath('com.google.gms:google-services:4.4.2')`
3. ✅ `android/app/build.gradle` enthält:
   - `apply plugin: "com.google.gms.google-services"`
   - Firebase BoM und Abhängigkeiten

## 📱 Firebase Cloud Messaging Setup

### ⚠️ WICHTIG: Legacy API wurde eingestellt

Die **Cloud Messaging API (Legacy)** wurde am **20.06.2023 verworfen** und wird am **20.06.2024 komplett eingestellt**.

**Siehe `FCM_HTTP_V1_SETUP.md` für die aktuelle Anleitung zur FCM HTTP v1 API Migration.**

### Expo Push Notifications (Empfohlen)

**Gute Nachricht:** `expo-server-sdk@4.0.0+` verwendet automatisch die FCM HTTP v1 API!

1. Stelle sicher, dass **Firebase Cloud Messaging API (V1)** aktiviert ist:
   - Firebase Console → Project Settings → Cloud Messaging
   - Prüfe, ob "Firebase Cloud Messaging API (V1)" aktiviert ist
   - Falls nicht: Klicke auf drei Punkte → Manage API in Google Cloud Console → Enable

2. Für Expo Push Notifications kannst du noch einen Legacy Server Key verwenden (wird automatisch konvertiert):
   - Firebase Console → Project Settings → Cloud Messaging
   - Unter "Cloud Messaging API (Legacy)" findest du den Server Key
   - Kopiere den Server Key

3. In EAS Secrets speichern:
   ```bash
   eas secret:create --scope project --name FCM_SERVER_KEY --value YOUR_SERVER_KEY
   ```

**Empfohlen:** Verwende stattdessen einen Service Account Key (siehe `FCM_HTTP_V1_SETUP.md`).

## ✅ Nach dem Setup

Nach erfolgreichem Setup sollten Android Push-Benachrichtigungen funktionieren!

Die App kann jetzt:
- ✅ FCM Tokens empfangen
- ✅ Push-Benachrichtigungen von deinem Backend erhalten
- ✅ Benachrichtigungen anzeigen

## 🐛 Troubleshooting

### Build-Fehler: "google-services.json not found"

- Stelle sicher, dass `google-services.json` im `android/app/` Verzeichnis liegt
- Prüfe den Pfad: `android/app/google-services.json`

### Gradle Sync Fehler

- Prüfe ob alle Plugins korrekt hinzugefügt wurden
- Versuche: `cd android && ./gradlew clean`

### Push-Benachrichtigungen funktionieren nicht

- Prüfe ob FCM Server Key korrekt konfiguriert ist
- Stelle sicher, dass die App-Berechtigungen korrekt sind
- Prüfe die Logs für FCM Token-Registrierung
