# Push Notifications Setup

## Current Status

**Die App verwendet derzeit nur lokale Notifications (kein Firebase benötigt).**

Lokale Notifications funktionieren:
- ✅ Tägliche Kampagnen-Erinnerungen
- ✅ Sofortige Notifications von der App selbst
- ✅ Funktioniert auf iOS und Android ohne zusätzliche Konfiguration

## Lokale vs. Remote Notifications

### Lokale Notifications (Aktuell verwendet)
- Werden von der App selbst geplant und versendet
- Kein Server/Backend benötigt
- Kein Firebase benötigt
- Funktionieren auch wenn die App geschlossen ist (durch OS geplant)

### Remote Push Notifications (Derzeit NICHT verwendet)
- Werden von einem Server/Backend versendet
- Benötigen Firebase Cloud Messaging (FCM) für Android
- Benötigen Apple Push Notification Service (APNs) für iOS
- Nützlich für:
  - Benachrichtigungen von einem Backend
  - Echtzeit-Updates
  - Marketing-Kampagnen vom Server

## Firebase Setup (Optional - für Remote Push Notifications)

Falls du später Remote Push Notifications brauchst, folge diesen Schritten:

### 1. Android - Firebase Cloud Messaging (FCM)

#### Schritt 1: Firebase Projekt erstellen
1. Gehe zu https://console.firebase.google.com/
2. Erstelle ein neues Projekt oder wähle ein existierendes
3. Füge eine Android App hinzu
   - Package Name: `com.exponativewindtemplate.app`
   - App Nickname: `SpotX`

#### Schritt 2: google-services.json herunterladen
1. Lade die `google-services.json` Datei herunter
2. **WICHTIG**: Diese Datei enthält sensible Daten!
3. Platziere sie im Projekt-Root (neben `app.json`)
4. Füge sie zu `.gitignore` hinzu:
   ```
   google-services.json
   ```

#### Schritt 3: app.json aktualisieren
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.exponativewindtemplate.app"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ED4842",
          "sounds": [],
          "mode": "production"
        }
      ]
    ]
  }
}
```

#### Schritt 4: FCM Server Key in EAS
```bash
# FCM Server Key von Firebase Console kopieren
# (Project Settings > Cloud Messaging > Server Key)

# In EAS Secrets speichern
eas secret:create --scope project --name FCM_SERVER_KEY --value YOUR_SERVER_KEY
```

#### Schritt 5: Code aktivieren
In `lib/notifications/notification-service.ts`:

```typescript
// Push Token für beide Plattformen holen
try {
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: '8ddfb1eb-b6c2-44dc-ad88-00e4652e956c',
  });
  console.log('Push notification token:', token.data);
  // Token an deinen Backend Server senden
  // await sendTokenToBackend(token.data);
} catch (error) {
  console.warn('Could not get push token:', error);
}
```

### 2. iOS - Apple Push Notification Service (APNs)

#### Schritt 1: Apple Developer Account
1. Gehe zu https://developer.apple.com/account/
2. Navigiere zu Certificates, Identifiers & Profiles
3. Erstelle eine Push Notification Certificate für deine App

#### Schritt 2: EAS Credentials
```bash
# APNs Key erstellen und in EAS speichern
eas credentials
```

#### Schritt 3: app.json aktualisieren
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.exponativewindtemplate.app",
      "backgroundModes": ["remote-notification"],
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 3. Backend Server Setup

Für Remote Push Notifications brauchst du einen Backend Server:

```typescript
// Beispiel: Node.js Backend mit Expo Push API
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

async function sendPushNotification(pushToken: string, title: string, body: string) {
  const messages = [{
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { /* custom data */ },
  }];

  const chunks = expo.chunkPushNotifications(messages);
  
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Tickets:', ticketChunk);
    } catch (error) {
      console.error('Error sending push:', error);
    }
  }
}
```

## Aktuelle Implementierung (Lokale Notifications)

Die App ist derzeit so konfiguriert, dass:
1. ❌ Kein Firebase benötigt wird
2. ✅ Lokale Notifications funktionieren
3. ✅ Keine Warnungen mehr angezeigt werden
4. ✅ Auf Android wird der Push Token nicht geholt (vermeidet Firebase-Fehler)
5. ✅ Auf iOS wird der Token optional geholt (funktioniert ohne Firebase)

## Testing

### Lokale Notifications testen
```bash
# Development Build erstellen
eas build --platform android --profile development
eas build --platform ios --profile development

# App installieren und testen
# Notifications werden automatisch geplant wenn die App startet
```

### Remote Notifications testen (nach Firebase Setup)
```bash
# Mit Expo Push Tool testen
npx expo-push-tool
# Token eingeben und Test-Notification senden
```

## Android Notification Icon Setup

### Wichtige Anforderungen für Android Notification Icons

**Das Notification Icon muss:**
- ✅ **Weiß sein** auf transparentem Hintergrund (Android-Standard)
- ✅ **96x96 Pixel** oder größer (empfohlen)
- ✅ **Transparenter Hintergrund** (kein Farbhintergrund)
- ✅ **Einfaches Design** (nur weiße Formen/Symbole)

### Aktuelle Konfiguration

Die `app.json` ist bereits konfiguriert mit:
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/icon.png",
        "color": "#ffffff",
        "sounds": [],
        "mode": "default",
        "androidMode": "default"
      }
    ]
  ]
}
```

### Icon erstellen

Falls das aktuelle Icon (`./assets/images/icon.png`) nicht weiß auf transparentem Hintergrund ist:

1. **Icon erstellen:**
   - Öffne das App-Icon in einem Bildbearbeitungsprogramm
   - Konvertiere es zu einem weißen Icon auf transparentem Hintergrund
   - Speichere als PNG mit transparentem Hintergrund
   - Empfohlene Größe: 96x96 Pixel oder größer

2. **Icon ersetzen:**
   - Ersetze `./assets/images/icon.png` mit dem neuen weißen Icon
   - Oder erstelle ein neues Icon: `./assets/images/notification-icon.png`
   - Aktualisiere den Pfad in `app.json` falls nötig

3. **App neu bauen:**
   ```bash
   eas build --platform android --profile development
   # oder
   npx expo run:android
   ```

**Hinweis:** Das Notification Icon wird nur beim Build-Prozess eingebunden. Nach dem Ändern des Icons muss die App neu gebaut werden!

## Troubleshooting

### Warnung: "FirebaseApp is not initialized"
- ✅ **Gelöst**: Push Token wird auf Android nicht mehr geholt
- Lokale Notifications funktionieren trotzdem

### Notification Icon wird nicht angezeigt (Android)
- ✅ **Prüfe:** Ist das Icon weiß auf transparentem Hintergrund?
- ✅ **Prüfe:** Wurde die App nach Icon-Änderung neu gebaut?
- ✅ **Prüfe:** Ist der Pfad in `app.json` korrekt?
- Das Icon wird nur beim Build-Prozess eingebunden, nicht zur Laufzeit!

### Notifications werden nicht angezeigt
1. Prüfe Permissions: Settings → Apps → SpotX → Notifications
2. Prüfe Code: `await notificationService.requestPermissions()`
3. Logs prüfen: `npx react-native log-android` oder `npx react-native log-ios`

### Token wird nicht generiert
- Für lokale Notifications: **Nicht benötigt!**
- Für Remote Push: Firebase Setup erforderlich (siehe oben)

## Weitere Ressourcen

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase FCM Setup](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Apple APNs Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
