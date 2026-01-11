# Schnell-Anleitung: APNs Credentials hochladen

## Automatisch (Empfohlen)

Führe dieses Script aus:

```bash
./setup-push-credentials.sh
```

Das Script führt dich durch alle Schritte.

## Manuell

### Schritt 1: EAS Credentials öffnen

```bash
eas credentials
```

### Schritt 2: Folgende Optionen wählen

1. **Select platform:** → `iOS`
2. **Which build profile?** → `production` (für Production) oder `preview` (für Tests auf echten Geräten)
   ⚠️ **WICHTIG:** Wähle NICHT `development` - dieser ist nur für Simulator-Builds!
3. **What would you like to do?** → `Push Notifications: Set up`
4. **How would you like to set up your push notifications?** → `Generate new APNs Key` (empfohlen)

EAS generiert dann automatisch die Credentials und lädt sie hoch.

### Schritt 3: Neuen Build erstellen

Nach dem Hochladen der Credentials:

```bash
eas build --platform ios --profile production
```

Oder für Preview (Test-Builds auf echten Geräten):

```bash
eas build --platform ios --profile preview
```

### Schritt 4: Testen

1. Installiere den neuen Build auf deinem Gerät
2. Öffne die App und melde dich an
3. Aktiviere Benachrichtigungen
4. Sende eine Test-Benachrichtigung über `/admin/notifications`

## Alternative: Manuell APNs Key hochladen

Falls du bereits einen APNs Key hast:

1. **APNs Key erstellen** (in Apple Developer Portal):
   - https://developer.apple.com/account/resources/authkeys/list
   - Erstelle neuen Key
   - Aktiviere "Apple Push Notifications service (APNs)"
   - Lade `.p8` Datei herunter
   - Notiere Key ID und Team ID

2. **In EAS hochladen**:
   ```bash
   eas credentials
   ```
   - Wähle: iOS → production → Push Notifications: Set up
   - Wähle: "Upload an APNs Key (.p8)"
   - Gib Key ID, Team ID ein und lade `.p8` Datei hoch

## Hilfe

Bei Problemen siehe: `APNS_CREDENTIALS_SETUP.md`
