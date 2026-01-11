# Push-Benachrichtigungen Setup Guide

## Problem: Push-Benachrichtigungen kommen nicht auf den nativen Apps an

### Schritt 1: API-URL konfigurieren

Die Mobile App muss wissen, wo sich das Merchant-Portal befindet, um Push-Tokens zu registrieren.

**In der Root `.env` Datei** (nicht in `apps/merchant-portal/.env.local`):

```bash
# Setze die URL zu deinem Merchant-Portal
# Für lokale Entwicklung:
EXPO_PUBLIC_API_URL=http://localhost:3000

# Für Production (z.B. Vercel):
EXPO_PUBLIC_API_URL=https://deine-app.vercel.app
```

**Wichtig:** 
- Die Variable muss `EXPO_PUBLIC_API_URL` heißen (nicht `NEXT_PUBLIC_BASE_URL`)
- Sie muss im **Root-Verzeichnis** gesetzt werden, nicht im `apps/merchant-portal` Verzeichnis
- Nach dem Setzen: App neu starten (`npx expo start --clear`)

### Schritt 2: Push-Tokens registrieren

1. **User muss sich in der App anmelden**
2. **User muss Benachrichtigungs-Berechtigung erteilen**
3. Die App registriert automatisch den Push-Token beim Backend

**Prüfen ob Tokens gespeichert wurden:**

```sql
-- In Supabase SQL Editor ausführen:
SELECT 
  pt.id,
  pt.token,
  pt.platform,
  u.email,
  pt.created_at
FROM push_tokens pt
JOIN users u ON pt.user_id = u.id
ORDER BY pt.created_at DESC;
```

### Schritt 3: Admin-Benachrichtigung senden

1. Gehe zu `/admin/notifications` im Merchant-Portal
2. Wähle "Alle User" oder "Ausgewählte User"
3. Gib Titel und Nachricht ein
4. Klicke auf "Benachrichtigung senden"

**Debugging:**

Wenn keine Benachrichtigungen ankommen:

1. **Prüfe ob Tokens vorhanden sind:**
   ```sql
   SELECT COUNT(*) FROM push_tokens;
   ```

2. **Prüfe ob expo-server-sdk installiert ist:**
   ```bash
   cd apps/merchant-portal
   npm list expo-server-sdk
   ```
   
   Falls nicht installiert:
   ```bash
   cd apps/merchant-portal
   npm install expo-server-sdk
   ```

3. **Prüfe die Server-Logs** im Merchant-Portal Terminal für Fehler

4. **Prüfe die Mobile App Logs** für Token-Registrierungs-Fehler:
   - Suche nach "Registering push token at:"
   - Suche nach "Failed to register push token"

### Schritt 4: Häufige Probleme

**Problem: "Keine Push-Tokens für die ausgewählten User gefunden"**
- Lösung: User müssen die App öffnen und Benachrichtigungen aktivieren
- Die App registriert den Token automatisch beim ersten Öffnen

**Problem: "expo-server-sdk nicht installiert"**
- Lösung: `cd apps/merchant-portal && npm install expo-server-sdk`

**Problem: "EXPO_PUBLIC_API_URL not set"**
- Lösung: Setze `EXPO_PUBLIC_API_URL` in der Root `.env` Datei
- Starte die App neu mit `npx expo start --clear`

**Problem: Tokens werden nicht gespeichert**
- Prüfe die Mobile App Logs für Fehler
- Prüfe ob der User authentifiziert ist
- Prüfe ob die API-URL korrekt ist

**Problem: "Could not find APNs credentials" (iOS)**
- Lösung: APNs Credentials müssen über EAS hochgeladen werden
- Siehe: `APNS_CREDENTIALS_SETUP.md` für detaillierte Anleitung
- Kurzfassung: `eas credentials` → iOS → Push Notifications einrichten

**Problem: "InvalidCredentials" oder "0 sent"**
- iOS: APNs Credentials fehlen → Siehe `APNS_CREDENTIALS_SETUP.md`
- Android: FCM Credentials fehlen → Firebase Setup erforderlich
- Lösung: Credentials über EAS hochladen und neuen Build erstellen

### Schritt 5: Testen

1. **Token-Registrierung testen:**
   - Öffne die App
   - Melde dich an
   - Aktiviere Benachrichtigungen
   - Prüfe in Supabase ob ein Token gespeichert wurde

2. **Push-Benachrichtigung testen:**
   - Gehe zu `/admin/notifications`
   - Sende eine Test-Benachrichtigung
   - Prüfe die Antwort (sollte `sentCount > 0` zeigen)

3. **Auf dem Gerät prüfen:**
   - Benachrichtigung sollte innerhalb weniger Sekunden ankommen
   - Wenn nicht: Prüfe die Server-Logs für Fehler
   - **Wichtig**: Für iOS benötigst du APNs Credentials (siehe `APNS_CREDENTIALS_SETUP.md`)
   - **Wichtig**: Für Android benötigst du FCM Credentials (Firebase Setup)

## Technische Details

### API-Endpunkte

- **POST `/api/users/push-token`** - Registriert Push-Token von Mobile App
- **POST `/api/admin/notifications/send`** - Sendet Push-Benachrichtigungen

### Datenbank-Tabelle

Die `push_tokens` Tabelle speichert:
- `user_id` - Referenz zum User
- `token` - Expo Push Token
- `platform` - 'ios', 'android' oder 'web'
- `device_id` - Optional: Device ID

### Ablauf

1. User öffnet App → `requestPermissions()` wird aufgerufen
2. App holt Expo Push Token → `getExpoPushTokenAsync()`
3. App sendet Token an Backend → `POST /api/users/push-token`
4. Admin sendet Benachrichtigung → `POST /api/admin/notifications/send`
5. Backend holt alle Tokens → `SELECT * FROM push_tokens WHERE user_id IN (...)`
6. Backend sendet via Expo Push API → `expo.sendPushNotificationsAsync()`
7. Expo leitet an Geräte weiter → Push-Benachrichtigung erscheint
