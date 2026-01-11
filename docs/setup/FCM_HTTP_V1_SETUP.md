# 🔔 Firebase Cloud Messaging (FCM) HTTP v1 API Setup

## ⚠️ WICHTIG: Legacy API wurde eingestellt

Die **Cloud Messaging API (Legacy)** wurde am **20.06.2023 verworfen** und wird am **20.06.2024 komplett eingestellt**.

**Du musst zur FCM HTTP v1 API migrieren!**

## 📋 Projekt-Informationen

- **Projektnummer:** `514290450822`
- **Projekt-ID:** `spotx-52cc3`
- **Package Name:** `com.exponativewindtemplate.app`

## ✅ Expo Push Notifications (Empfohlen)

**Gute Nachricht:** Wenn du `expo-server-sdk` Version 4.0.0 oder höher verwendest, unterstützt es bereits automatisch die FCM HTTP v1 API!

### Aktueller Status

- ✅ `expo-server-sdk@4.0.0` verwendet automatisch FCM HTTP v1
- ✅ Keine Code-Änderungen erforderlich für Expo Push Notifications
- ✅ Expo verwaltet die Migration automatisch

### Setup für Expo Push Notifications

1. **Stelle sicher, dass die neueste Version installiert ist:**
   ```bash
   cd apps/merchant-portal
   npm install expo-server-sdk@latest
   ```

2. **Firebase Cloud Messaging API (V1) aktivieren:**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Wähle Projekt: **spotx-52cc3**
   - ⚙️ **Settings** → **Project Settings** → Tab **Cloud Messaging**
   - Stelle sicher, dass **Firebase Cloud Messaging API (V1)** aktiviert ist
   - Falls nicht aktiviert: Klicke auf die drei Punkte → **Manage API in Google Cloud Console** → **Enable**

3. **Service Account Key für EAS erstellen (Optional, für erweiterte Konfiguration):**
   - Siehe Abschnitt "Service Account Key Setup" unten

4. **FCM Credentials in EAS hochladen:**
   ```bash
   eas credentials
   ```
   - Platform: `Android` (a)
   - Build Profile: `production` oder `preview`
   - Action: `Push Notifications: Set up`
   - Option: `Upload FCM Server Key` (Expo konvertiert automatisch zu HTTP v1)

## 🔧 Service Account Key Setup (Für direkte FCM HTTP v1 Integration)

Falls du direkt die FCM HTTP v1 API verwenden möchtest (ohne Expo Push Notifications):

### Schritt 1: Service Account Key erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle Projekt: **spotx-52cc3**
3. ⚙️ **Settings** → **Project Settings**
4. Tab: **Service Accounts**
5. Klicke auf **Generate new private key**
6. Bestätige mit **Generate key**
7. Eine JSON-Datei wird heruntergeladen - **bewahre sie sicher auf!**

### Schritt 2: Firebase Cloud Messaging API (V1) aktivieren

1. In Firebase Console: ⚙️ **Settings** → **Project Settings** → Tab **Cloud Messaging**
2. Prüfe, ob **Firebase Cloud Messaging API (V1)** aktiviert ist
3. Falls nicht:
   - Klicke auf die drei Punkte neben "Firebase Cloud Messaging API (V1)"
   - Wähle **Manage API in Google Cloud Console**
   - Klicke auf **Enable**
   - Kehre zur Firebase Console zurück und aktualisiere die Seite

### Schritt 3: Service Account Key konfigurieren

#### Option A: Als Umgebungsvariable (Empfohlen für Production)

```bash
# Linux/macOS
export GOOGLE_APPLICATION_CREDENTIALS="/pfad/zur/service-account-key.json"

# Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\pfad\zur\service-account-key.json"
```

#### Option B: In .env Datei (Für lokale Entwicklung)

```bash
# .env Datei im merchant-portal Verzeichnis
GOOGLE_APPLICATION_CREDENTIALS=/pfad/zur/service-account-key.json
```

**WICHTIG:** Füge die JSON-Datei zu `.gitignore` hinzu!

```gitignore
# Firebase Service Account Keys
*-firebase-adminsdk-*.json
service-account-key.json
```

#### Option C: Direkt im Code (Nur für Tests, nicht empfohlen)

```typescript
import admin from 'firebase-admin';
import serviceAccount from './service-account-key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
```

### Schritt 4: Firebase Admin SDK installieren

```bash
cd apps/merchant-portal
npm install firebase-admin
```

### Schritt 5: FCM HTTP v1 API verwenden

```typescript
import admin from 'firebase-admin';

// Initialisierung (einmal beim Server-Start)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Nachricht senden
async function sendPushNotification(fcmToken: string, title: string, body: string) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

## 🔄 Migration von Legacy API

### Was sich geändert hat:

| Legacy API | HTTP v1 API |
|------------|-------------|
| Server Key (String) | Service Account Key (JSON) |
| `Authorization: key=AAAA...` | `Authorization: Bearer <access_token>` |
| `https://fcm.googleapis.com/fcm/send` | `https://fcm.googleapis.com/v1/projects/{project_id}/messages:send` |
| Einfache Authentifizierung | OAuth 2.0 Access Tokens |

### Für Expo Push Notifications:

✅ **Keine Änderungen erforderlich!** Expo Server SDK Version 4.0.0+ verwendet automatisch HTTP v1.

### Für direkte FCM Integration:

1. ✅ Service Account Key erstellen (siehe oben)
2. ✅ Firebase Admin SDK installieren
3. ✅ Code aktualisieren (siehe Beispiel oben)
4. ✅ Legacy Server Key entfernen

## ✅ Checkliste

### Expo Push Notifications (Empfohlen)

- [ ] `expo-server-sdk@4.0.0+` installiert
- [ ] Firebase Cloud Messaging API (V1) aktiviert
- [ ] FCM Credentials in EAS hochgeladen
- [ ] Neuer Build erstellt: `eas build --platform android --profile production`

### Direkte FCM HTTP v1 Integration

- [ ] Service Account Key erstellt
- [ ] Firebase Cloud Messaging API (V1) aktiviert
- [ ] `firebase-admin` installiert
- [ ] Service Account Key konfiguriert (Umgebungsvariable oder Code)
- [ ] Code aktualisiert (Legacy API entfernt)
- [ ] Getestet

## 🧪 Testen

### Expo Push Notifications testen:

1. Erstelle einen neuen Build:
   ```bash
   eas build --platform android --profile production
   ```

2. Installiere den Build auf deinem Gerät

3. Sende eine Test-Benachrichtigung über `/admin/notifications`

### Direkte FCM HTTP v1 testen:

```typescript
// Test-Funktion
async function testPushNotification() {
  const testToken = 'DEIN_FCM_TOKEN_HIER';
  await sendPushNotification(testToken, 'Test', 'Dies ist eine Test-Benachrichtigung');
}
```

## 📚 Weitere Ressourcen

- [Firebase FCM HTTP v1 Migration Guide](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Firebase Admin SDK Dokumentation](https://firebase.google.com/docs/admin/setup)
- [Expo Push Notifications Dokumentation](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Server SDK GitHub](https://github.com/expo/expo-server-sdk-node)

## ⚠️ Wichtige Hinweise

1. **Legacy API wird am 20.06.2024 eingestellt** - Migration ist zwingend erforderlich!
2. **Service Account Keys sind sensibel** - niemals ins Git committen!
3. **Expo Push Notifications** ist die einfachste Lösung - keine direkte FCM-Integration erforderlich
4. **Firebase Cloud Messaging API (V1)** muss aktiviert sein, sonst funktioniert nichts

## 🐛 Troubleshooting

### "API not enabled"
- Stelle sicher, dass Firebase Cloud Messaging API (V1) aktiviert ist
- Prüfe in Google Cloud Console: APIs & Services → Enabled APIs

### "Invalid credentials"
- Prüfe, ob der Service Account Key korrekt ist
- Stelle sicher, dass `GOOGLE_APPLICATION_CREDENTIALS` korrekt gesetzt ist
- Prüfe, ob der Key zum richtigen Firebase-Projekt gehört

### "Permission denied"
- Stelle sicher, dass der Service Account die Rolle "Firebase Cloud Messaging Admin" hat
- Prüfe in Google Cloud Console: IAM & Admin → IAM
