# Push-Benachrichtigungen Admin Dashboard

## Übersicht

Das Admin-Dashboard enthält jetzt einen neuen Tab für Push-Benachrichtigungen, mit dem Administratoren:
- Push-Benachrichtigungen an alle User oder ausgewählte User senden können
- Benachrichtigungszeiten für Kampagnen festlegen können

## Implementierte Features

### ✅ Abgeschlossen

1. **Admin-Seite für Push-Benachrichtigungen**
   - Route: `/admin/notifications`
   - UI zum Senden von Benachrichtigungen
   - UI zum Verwalten von Benachrichtigungszeiten für Kampagnen

2. **API-Routen**
   - `GET /api/admin/users` - Lädt alle User
   - `GET /api/admin/campaigns` - Lädt alle Kampagnen
   - `POST /api/admin/notifications/send` - Sendet Push-Benachrichtigungen
   - `POST /api/admin/notifications/time-preference` - Speichert Benachrichtigungszeiten
   - `GET /api/admin/notifications/time-preference` - Lädt Benachrichtigungszeiten

3. **Datenbank-Migration**
   - SQL-Script: `scripts/add-notification-time-to-campaigns.sql`
   - Fügt `notification_time` Spalte zur `campaigns` Tabelle hinzu

4. **Link im Admin-Dashboard**
   - Neuer Tab "Push-Benachrichtigungen" im Admin-Dashboard

## Setup-Anleitung

### Schritt 1: Datenbank-Migration ausführen

Führen Sie die SQL-Migration aus, um die `notification_time` Spalte hinzuzufügen:

```sql
-- In Supabase SQL Editor ausführen:
-- scripts/add-notification-time-to-campaigns.sql
```

Oder direkt in Supabase:
1. Gehen Sie zu Supabase Dashboard > SQL Editor
2. Kopieren Sie den Inhalt von `scripts/add-notification-time-to-campaigns.sql`
3. Führen Sie das Script aus

### Schritt 2: Push-Token Speicherung (Optional - für vollständige Implementierung)

Um Push-Benachrichtigungen tatsächlich zu senden, müssen Sie:

1. **Push-Token Tabelle erstellen** (optional):
```sql
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
```

2. **expo-server-sdk installieren**:
```bash
cd apps/merchant-portal
npm install expo-server-sdk
```

3. **Push-Token in der Mobile App speichern**:
   - Wenn ein User sich anmeldet, den Expo Push Token holen
   - Token an `/api/users/push-token` senden (muss noch erstellt werden)

### Schritt 3: Push-Benachrichtigungen aktivieren

Die API-Route `/api/admin/notifications/send` enthält bereits Platzhalter-Code für die vollständige Implementierung. 

**Aktueller Status:**
- ✅ UI ist vollständig funktionsfähig
- ✅ API-Routen sind vorhanden
- ⚠️ Push-Benachrichtigungen werden noch nicht tatsächlich gesendet (siehe Code-Kommentare)

**Um Push-Benachrichtigungen zu aktivieren:**

1. Kommentieren Sie den Beispiel-Code in `apps/merchant-portal/app/api/admin/notifications/send/route.ts` aus
2. Stellen Sie sicher, dass Push-Tokens in der Datenbank gespeichert werden
3. Konfigurieren Sie Expo Push API Credentials (falls nötig)

## Verwendung

### Push-Benachrichtigung senden

1. Gehen Sie zu `/admin/notifications`
2. Wählen Sie optional eine Kampagne aus
3. Geben Sie Titel und Nachricht ein
4. Wählen Sie "Alle User" oder "Ausgewählte User"
5. Falls "Ausgewählte User": User aus der Liste auswählen
6. Klicken Sie auf "Benachrichtigung senden"

### Benachrichtigungszeit für Kampagnen festlegen

1. Scrollen Sie zum Abschnitt "Benachrichtigungszeiten für Kampagnen"
2. Wählen Sie für jede aktive Kampagne eine Uhrzeit
3. Klicken Sie auf "Speichern"

Die gespeicherten Zeiten werden verwendet, um zu bestimmen, wann User Benachrichtigungen für diese Kampagne erhalten sollen.

## Technische Details

### Datenbank-Schema

**campaigns Tabelle:**
- `notification_time` (TIME) - Bevorzugte Uhrzeit für Benachrichtigungen

### API-Endpunkte

**POST /api/admin/notifications/send**
```json
{
  "type": "all" | "selected",
  "userIds": ["uuid1", "uuid2"], // Nur wenn type === "selected"
  "campaignId": "uuid", // Optional
  "title": "Titel der Benachrichtigung",
  "body": "Nachrichtentext"
}
```

**POST /api/admin/notifications/time-preference**
```json
{
  "campaignId": "uuid",
  "notificationTime": "09:00"
}
```

## Nächste Schritte

1. ✅ Datenbank-Migration ausführen
2. ⏳ Push-Token Speicherung implementieren (optional)
3. ⏳ Expo Push API Integration vollständig aktivieren (optional)
4. ⏳ Mobile App: Push-Token beim Login speichern (optional)

## Hinweise

- Die aktuelle Implementierung zeigt die UI und API-Struktur
- Push-Benachrichtigungen werden derzeit noch nicht tatsächlich gesendet
- Siehe Code-Kommentare in `/api/admin/notifications/send/route.ts` für Implementierungsdetails
- Die App verwendet derzeit lokale Notifications (siehe `docs/PUSH_NOTIFICATIONS.md`)
