# Firebase Cloud Messaging (FCM) Setup

## ⚠️ WICHTIG: Legacy API wurde eingestellt

Die **Cloud Messaging API (Legacy)** wurde am **20.06.2023 verworfen** und wird am **20.06.2024 komplett eingestellt**.

**Siehe `FCM_HTTP_V1_SETUP.md` für die aktuelle Anleitung zur FCM HTTP v1 API Migration.**

## Projekt-Informationen

- **Projektnummer:** `514290450822`
- **Projekt-ID:** `spotx-52cc3`
- **Package Name:** `com.exponativewindtemplate.app`

## ⚠️ Legacy Server Key (Veraltet)

**Hinweis:** Diese Anleitung beschreibt die Legacy API. Für neue Setups verwende bitte `FCM_HTTP_V1_SETUP.md`.

### Schritt 1: Firebase Console öffnen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt: **spotx-52cc3**

### Schritt 2: Cloud Messaging Server Key finden (Legacy)

1. Klicke auf das **⚙️ Zahnrad-Symbol** (oben links) → **Project Settings**
2. Gehe zum Tab **Cloud Messaging**
3. Unter **Cloud Messaging API (Legacy)** findest du:
   - **Server Key** - ⚠️ Veraltet, wird am 20.06.2024 eingestellt!
   - **Sender ID** - Das ist deine Projektnummer: `514290450822`

**⚠️ WICHTIG:** Expo Push Notifications kann Legacy Server Keys noch verwenden (wird automatisch zu HTTP v1 konvertiert), aber für neue Setups sollte die HTTP v1 API verwendet werden.

### Schritt 3: Server Key kopieren (Nur für Legacy-Support)

Kopiere den **Server Key** (beginnt meist mit `AAAA...` oder ähnlich)

**Empfohlen:** Verwende stattdessen einen Service Account Key (siehe `FCM_HTTP_V1_SETUP.md`)

## Server Key konfigurieren

### Option 1: In EAS Secrets speichern (Empfohlen für Production)

```bash
# Setze den FCM Server Key als EAS Secret
eas secret:create --scope project --name FCM_SERVER_KEY --value "DEIN_SERVER_KEY_HIER"
```

### Option 2: In Umgebungsvariablen (Für lokale Entwicklung)

Füge zur `.env` Datei im Root-Verzeichnis hinzu:

```bash
# Firebase Cloud Messaging Server Key
FCM_SERVER_KEY=DEIN_SERVER_KEY_HIER
```

**Wichtig:** Diese Datei sollte **NICHT** ins Git committed werden!

### Option 3: Direkt im Backend-Code (Nur für Tests)

Falls du den Key direkt verwenden möchtest (nicht empfohlen für Production):

In `apps/merchant-portal/app/api/admin/notifications/send/route.ts`:

```typescript
// Nur für Tests - nicht für Production!
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || 'DEIN_SERVER_KEY_HIER';
```

## Backend-Integration

### Expo Push Notifications (Empfohlen)

Die App verwendet Expo Push Notifications, die automatisch FCM HTTP v1 verwenden, wenn die `google-services.json` korrekt konfiguriert ist.

**expo-server-sdk@4.0.0+** unterstützt automatisch die FCM HTTP v1 API - keine Code-Änderungen erforderlich!

### Direkte FCM HTTP v1 Integration

**Siehe `FCM_HTTP_V1_SETUP.md` für vollständige Anleitung.**

Kurzfassung:

1. Installiere `firebase-admin`:
   ```bash
   cd apps/merchant-portal
   npm install firebase-admin
   ```

2. Erstelle Service Account Key (siehe `FCM_HTTP_V1_SETUP.md`)

3. Initialisiere Firebase Admin mit Service Account:
   ```typescript
   import admin from 'firebase-admin';
   
   // Mit Umgebungsvariable GOOGLE_APPLICATION_CREDENTIALS
   admin.initializeApp({
     credential: admin.credential.applicationDefault(),
   });
   
   // Oder direkt mit Service Account Key
   import serviceAccount from './service-account-key.json';
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
   });
   ```

## Überprüfung

Nach dem Setup:

1. ✅ `google-services.json` ist im `android/app/` Verzeichnis
2. ✅ Firebase Gradle Plugin ist konfiguriert
3. ✅ FCM Server Key ist verfügbar (für direkte FCM-Integration)
4. ✅ Android App kann Push-Tokens registrieren

## Troubleshooting

### "FCM Server Key nicht gefunden"

- Stelle sicher, dass du den **Server Key** (nicht Sender ID) kopiert hast
- Prüfe, ob der Key in der Firebase Console unter Cloud Messaging sichtbar ist

### "Invalid Server Key"

- Stelle sicher, dass der Key korrekt kopiert wurde (keine Leerzeichen am Anfang/Ende)
- Prüfe, ob der Key zum richtigen Firebase-Projekt gehört

### Push-Benachrichtigungen funktionieren nicht

- Prüfe ob `google-services.json` korrekt ist
- Stelle sicher, dass die App die richtige Package Name hat: `com.exponativewindtemplate.app`
- Prüfe die Android Logs für FCM-Fehler

## Nächste Schritte

1. ✅ FCM Server Key holen
2. ✅ Server Key konfigurieren
3. ✅ Android App testen
4. ✅ Push-Benachrichtigungen senden
