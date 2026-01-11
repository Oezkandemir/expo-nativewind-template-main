# 🔔 Push-Credentials jetzt einrichten

## Warum?

Die Development Builds laufen gerade, aber **Remote Push-Benachrichtigungen** funktionieren erst nach dem Setup der Credentials.

## Schnell-Setup (5 Minuten)

### iOS APNs Credentials (ERFORDERLICH für iOS Push)

```bash
eas credentials
```

**Wähle:**
1. `iOS`
2. `production` (oder `development`)
3. `Push Notifications: Set up`
4. `Generate new APNs Key` ✅ (empfohlen)

EAS generiert automatisch die Credentials!

### Android FCM Credentials (Optional, für Android Push)

1. **Firebase Projekt erstellen:**
   - https://console.firebase.google.com/
   - Neues Projekt erstellen
   - Android App hinzufügen
   - Package Name: `com.exponativewindtemplate.app`

2. **google-services.json herunterladen:**
   - Firebase Console → Project Settings → Apps
   - Lade `google-services.json` herunter
   - Speichere es im **Projekt-Root** (neben `app.json`)

3. **Fertig!** Die `app.json` ist bereits konfiguriert ✅

## Nach dem Setup

### WICHTIG: Neuen Production Build erstellen

Nach dem Hochladen der Credentials:

```bash
# iOS Production Build
eas build --platform ios --profile production

# Android Production Build  
eas build --platform android --profile production
```

### Testen

1. Installiere den neuen Production Build
2. Öffne die App und melde dich an
3. Aktiviere Benachrichtigungen
4. Gehe zu `/admin/notifications`
5. Sende eine Test-Benachrichtigung
6. ✅ Die Benachrichtigung sollte jetzt ankommen!

## Status

- ✅ `app.json` ist bereits für `google-services.json` konfiguriert
- ✅ `.gitignore` ignoriert `google-services.json` (sicher)
- ⏳ **Du musst jetzt:** `eas credentials` ausführen für iOS
- ⏳ **Optional:** Firebase Setup für Android

## Hilfe

- **iOS Setup:** Siehe `APNS_CREDENTIALS_SETUP.md`
- **Android Setup:** Siehe `APNS_CREDENTIALS_SETUP.md` (Android Abschnitt)
- **Script:** Führe `./setup-push-credentials-now.sh` aus

---

**Tipp:** Die Development Builds funktionieren auch ohne Credentials, aber nur **lokale Notifications**. Für **Remote Push-Benachrichtigungen** (vom Server) benötigst du die Credentials.
