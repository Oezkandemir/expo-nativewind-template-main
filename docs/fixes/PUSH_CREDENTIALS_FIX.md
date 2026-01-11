# ⚠️ Push-Benachrichtigungen funktionieren nicht - Credentials fehlen

## Problem

Die Logs zeigen:
```
Push notification error: Token ExponentPushToken[...]: Could not find APNs credentials
Benachrichtigung erfolgreich an 0 User gesendet
```

**Das bedeutet:** Die iOS APNs Credentials fehlen und müssen hochgeladen werden.

## Lösung (5 Minuten)

### Schritt 1: EAS Credentials öffnen

```bash
eas credentials
```

### Schritt 2: Folgende Optionen wählen

1. **Select platform:** → Drücke `i` für **iOS**
2. **Which build profile?** → Drücke `p` für **production** (oder `d` für development)
3. **What would you like to do?** → Wähle **Push Notifications: Set up**
4. **How would you like to set up push notifications?** → Wähle **Generate new APNs Key** (empfohlen)

EAS generiert dann automatisch die Credentials und lädt sie hoch.

### Schritt 3: Neuen Build erstellen

**WICHTIG:** Nach dem Hochladen der Credentials musst du einen neuen Build erstellen:

```bash
# Für Production
eas build --platform ios --profile production

# Oder für Development (mit Simulator)
eas build --platform ios --profile development
```

### Schritt 4: Neuen Build installieren

1. Warte bis der Build fertig ist
2. Installiere den neuen Build auf deinem Gerät
3. Öffne die App und melde dich an
4. Aktiviere Benachrichtigungen

### Schritt 5: Testen

1. Gehe zu `/admin/notifications`
2. Sende eine Test-Benachrichtigung
3. Die Benachrichtigung sollte jetzt ankommen! ✅

## Warum funktioniert es nicht ohne Credentials?

- **iOS** benötigt **APNs (Apple Push Notification Service) Credentials**
- Diese werden von Apple/Expo verwaltet
- Ohne diese Credentials kann Expo keine Push-Benachrichtigungen an iOS-Geräte senden

## Alternative: Android testen

Falls du ein Android-Gerät hast:

1. Android benötigt **FCM (Firebase Cloud Messaging) Credentials**
2. Siehe `APNS_CREDENTIALS_SETUP.md` für Android Setup
3. Oder teste mit **Expo Go** (funktioniert ohne Credentials, aber nur für Development)

## Schnellhilfe

Falls du Hilfe brauchst:

```bash
# Script ausführen (führt dich durch den Prozess)
./setup-push-credentials.sh

# Oder manuell
eas credentials
```

## Status-Check

Nach dem Setup kannst du prüfen:

```bash
# Prüfe Credentials Status
eas credentials --platform ios --profile production
```

Die Credentials sollten dann angezeigt werden.

---

**Wichtig:** Die Credentials müssen **einmalig** hochgeladen werden. Danach funktionieren alle zukünftigen Builds automatisch.
