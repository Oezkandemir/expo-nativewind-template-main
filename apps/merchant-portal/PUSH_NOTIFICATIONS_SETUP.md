# Push-Benachrichtigungen Setup - Vollständige Anleitung

## Problem
Die gesendeten Benachrichtigungen kommen nicht in den nativen Apps an, weil die vollständige Implementierung noch fehlt.

## Lösung - Schritt für Schritt

### Schritt 1: expo-server-sdk installieren

```bash
cd apps/merchant-portal
npm install expo-server-sdk
```

### Schritt 2: Datenbank-Migration ausführen

Führen Sie die SQL-Migration aus, um die `push_tokens` Tabelle zu erstellen:

1. Öffnen Sie das Supabase Dashboard
2. Gehen Sie zu SQL Editor
3. Kopieren Sie den Inhalt von `scripts/create-push-tokens-table.sql`
4. Führen Sie das Script aus

**Oder direkt in Supabase:**

```sql
-- Siehe scripts/create-push-tokens-table.sql
```

### Schritt 3: Backend-URL konfigurieren

Die Mobile App muss wissen, wo das Backend (Merchant Portal) läuft.

**Option A: Umgebungsvariable setzen (Empfohlen)**

In der Mobile App `.env` oder `app.json`:

```env
EXPO_PUBLIC_API_URL=https://ihre-merchant-portal-domain.com
```

**Option B: Code anpassen**

Falls das Merchant Portal lokal läuft oder eine andere URL hat, passen Sie `lib/notifications/notification-service.ts` an:

```typescript
// Zeile 86-88 anpassen:
const apiEndpoint = 'https://ihre-tatsächliche-domain.com/api/users/push-token';
```

### Schritt 4: Mobile App aktualisieren

Die Mobile App wurde bereits aktualisiert, um Push-Tokens automatisch zu registrieren. 

**Wichtig:** User müssen:
1. Die App öffnen
2. Sich anmelden
3. Benachrichtigungen aktivieren

Dann werden ihre Push-Tokens automatisch an das Backend gesendet.

### Schritt 5: Testen

1. **Push-Token registrieren:**
   - Öffnen Sie die Mobile App
   - Melden Sie sich an
   - Aktivieren Sie Benachrichtigungen
   - Prüfen Sie in Supabase, ob Tokens in der `push_tokens` Tabelle gespeichert wurden

2. **Benachrichtigung senden:**
   - Gehen Sie zu `/admin/notifications`
   - Geben Sie Titel und Nachricht ein
   - Wählen Sie User aus
   - Klicken Sie auf "Benachrichtigung senden"

3. **Ergebnis prüfen:**
   - Die API sollte jetzt echte Push-Benachrichtigungen senden
   - Prüfen Sie die Antwort der API für Details (sentCount, errors, etc.)

## Troubleshooting

### Fehler: "expo-server-sdk nicht installiert"

**Lösung:**
```bash
cd apps/merchant-portal
npm install expo-server-sdk
```

### Fehler: "Keine Push-Tokens gefunden"

**Ursachen:**
1. User haben die App noch nicht geöffnet/nicht angemeldet
2. Benachrichtigungen sind nicht aktiviert
3. Backend-URL ist falsch konfiguriert

**Lösung:**
1. Stellen Sie sicher, dass User die App öffnen und sich anmelden
2. Prüfen Sie in Supabase `push_tokens` Tabelle, ob Tokens vorhanden sind
3. Prüfen Sie die Backend-URL Konfiguration

### Fehler: "Failed to register push token"

**Ursachen:**
1. Backend-URL ist falsch
2. API-Route existiert nicht
3. Authentifizierung fehlt

**Lösung:**
1. Prüfen Sie `EXPO_PUBLIC_API_URL` oder die hardcodierte URL
2. Stellen Sie sicher, dass `/api/users/push-token` Route existiert
3. Prüfen Sie, ob der User authentifiziert ist

### Benachrichtigungen kommen nicht an

**Mögliche Ursachen:**
1. Push-Token ist ungültig oder abgelaufen
2. App ist nicht installiert oder deinstalliert
3. Benachrichtigungen sind auf dem Gerät deaktiviert
4. Expo Push Service hat ein Problem

**Lösung:**
1. Prüfen Sie die API-Antwort für Fehlerdetails
2. Testen Sie mit einem bekannten gültigen Token
3. Verwenden Sie `npx expo-push-tool` zum Testen einzelner Tokens

## API-Antwort Format

Bei erfolgreichem Senden:

```json
{
  "success": true,
  "sentCount": 5,
  "totalTokens": 10,
  "messagesCreated": 8,
  "message": "Benachrichtigung an 5 von 8 User gesendet"
}
```

Bei Fehlern:

```json
{
  "success": true,
  "sentCount": 3,
  "errors": [
    "Token ExponentPushToken[...]: DeviceNotRegistered",
    "Token ExponentPushToken[...]: InvalidCredentials"
  ]
}
```

## Nächste Schritte

Nach erfolgreicher Einrichtung:

1. ✅ Push-Tokens werden automatisch registriert
2. ✅ Admin kann Benachrichtigungen senden
3. ✅ Benachrichtigungszeiten für Kampagnen können gesetzt werden
4. ⏳ Automatische Benachrichtigungen basierend auf Kampagnen-Zeiten (kann später implementiert werden)

## Wichtige Hinweise

- **Backend-URL:** Muss öffentlich erreichbar sein (nicht localhost für Production)
- **Push-Tokens:** Werden nur registriert, wenn User angemeldet sind
- **Expo Push Service:** Benötigt keine Firebase für Expo Go/Development Builds
- **Production:** Für Production Builds müssen Expo Credentials konfiguriert werden
- **FCM HTTP v1 API:** `expo-server-sdk@4.0.0+` verwendet automatisch die FCM HTTP v1 API (Legacy API wurde eingestellt)
- **Siehe:** `FCM_HTTP_V1_SETUP.md` für Details zur Migration von der Legacy API
