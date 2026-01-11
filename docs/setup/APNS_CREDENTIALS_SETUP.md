# APNs Credentials Setup für iOS Push-Benachrichtigungen

## Problem

Der Fehler zeigt:
```
Could not find APNs credentials for com.exponativewindtemplate.app (@demiroo/spotx). 
You may need to generate or upload new push credentials.
```

Das bedeutet, dass die Apple Push Notification Service (APNs) Credentials fehlen.

## Lösung: APNs Credentials über EAS hochladen

### Schritt 1: EAS CLI installieren (falls nicht vorhanden)

```bash
npm install -g eas-cli
```

### Schritt 2: Bei EAS anmelden

```bash
eas login
```

### Schritt 3: APNs Credentials hochladen

Es gibt zwei Optionen:

#### Option A: Automatisch generieren lassen (Empfohlen)

```bash
eas credentials
```

Wähle dann:
1. **iOS** → **production** (für Production Builds) oder **preview** (für Test-Builds auf echten Geräten)
   ⚠️ **WICHTIG:** Wähle NICHT `development` - dieser Profile ist für Simulator-Builds und unterstützt keine Push-Credentials!
2. **Push Notifications: Set up**
3. EAS generiert automatisch die Credentials

#### Option B: Manuell hochladen

Wenn du bereits APNs Credentials hast:

1. **APNs Key erstellen** (in Apple Developer Portal):
   - Gehe zu https://developer.apple.com/account/resources/authkeys/list
   - Erstelle einen neuen Key
   - Aktiviere "Apple Push Notifications service (APNs)"
   - Lade die `.p8` Datei herunter
   - Notiere die Key ID und Team ID

2. **In EAS hochladen**:
   ```bash
   eas credentials
   ```
   - Wähle **iOS** → **production**
   - Wähle **Push Notifications: Set up**
   - Wähle **Upload an APNs Key (.p8)**
   - Gib die Key ID, Team ID und lade die `.p8` Datei hoch

### Schritt 4: Android FCM Credentials (Optional, für Android)

Für Android Push-Benachrichtigungen benötigst du Firebase Cloud Messaging (FCM):

1. **Firebase Projekt erstellen**:
   - Gehe zu https://console.firebase.google.com/
   - Erstelle ein neues Projekt
   - Füge eine Android App hinzu (Package: `com.exponativewindtemplate.app`)

2. **FCM Server Key holen**:
   - Firebase Console → Project Settings → Cloud Messaging
   - Kopiere den "Server key"

3. **In EAS speichern**:
   ```bash
   eas secret:create --scope project --name FCM_SERVER_KEY --value YOUR_SERVER_KEY
   ```

4. **google-services.json hochladen**:
   - Lade `google-services.json` von Firebase herunter
   - Speichere es im Projekt-Root
   - Füge zu `.gitignore` hinzu:
     ```
     google-services.json
     ```

5. **app.json aktualisieren**:
   ```json
   {
     "expo": {
       "android": {
         "googleServicesFile": "./google-services.json"
       }
     }
   }
   ```

### Schritt 5: Build neu erstellen

Nach dem Hochladen der Credentials musst du einen neuen Build erstellen:

```bash
# Für iOS Production
eas build --platform ios --profile production

# Für iOS Development (mit Simulator)
eas build --platform ios --profile development

# Für Android Production
eas build --platform android --profile production
```

### Schritt 6: Testen

1. **Installiere den neuen Build** auf deinem Gerät
2. **Öffne die App** und melde dich an
3. **Aktiviere Benachrichtigungen** in der App
4. **Sende eine Test-Benachrichtigung** über `/admin/notifications`

## Wichtige Hinweise

### Build Profile Auswahl

- **production**: Für Production Builds und App Store (empfohlen für Push-Benachrichtigungen)
- **preview**: Für Test-Builds auf echten Geräten (funktioniert auch mit Push-Benachrichtigungen)
- **development**: ⚠️ NICHT für Push-Credentials verwenden - dieser Profile ist nur für Simulator-Builds!

### Expo Go vs. Development Build

- **Expo Go**: Push-Benachrichtigungen funktionieren ohne zusätzliche Credentials (Expo verwaltet das)
- **Development Build / Production Build**: Benötigen eigene Credentials

### Aktueller Status

- ✅ Push-Token wird registriert
- ✅ Backend sendet Benachrichtigungen
- ❌ APNs Credentials fehlen → iOS Benachrichtigungen kommen nicht an
- ⚠️ Android: Prüfe ob FCM Credentials vorhanden sind

## Alternative: Lokale Notifications verwenden

Falls du keine Remote Push-Benachrichtigungen brauchst, kannst du lokale Notifications verwenden (funktionieren ohne Credentials):

Die App unterstützt bereits lokale Notifications für:
- Tägliche Kampagnen-Erinnerungen
- Sofortige Notifications von der App selbst

Diese funktionieren ohne APNs/FCM Credentials.

## Weitere Ressourcen

- [EAS Credentials Docs](https://docs.expo.dev/app-signing/managed-credentials/)
- [APNs Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [FCM Setup Guide](https://docs.expo.dev/push-notifications/fcm-credentials/)
