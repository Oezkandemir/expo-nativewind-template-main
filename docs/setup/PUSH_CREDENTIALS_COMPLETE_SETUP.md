# 🔐 Push-Benachrichtigungen Credentials - Komplettes Setup

## ✅ Status

**Push-Token-Registrierung funktioniert!** ✅

- iOS Token: `ExponentPushToken[u7S5S7Op0x0oxDqfiCBRcx]` ✅
- Android Token: `ExponentPushToken[nazvG8IeGFtkIlPGX5Hyvn]` ✅

**Fehlende Credentials:**

- ❌ iOS: APNs Credentials
- ❌ Android: FCM Server Key

## 🍎 iOS: APNs Credentials Setup

### Option 1: Mit EAS Access Token (Schnell)

Du hast bereits einen EAS Access Token: `KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d`

```bash
# Token setzen
export EXPO_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"
export EAS_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"

# Credentials einrichten
eas credentials
```

**Wähle:**

1. Platform: `iOS` (i)
2. Build Profile: `production` (p) oder `preview`
3. Action: `Push Notifications: Set up`
4. Option: `Generate new APNs Key` (empfohlen)

### Option 2: Manuell mit Apple Developer Account

1. Gehe zu [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Erstelle einen neuen APNs Key
3. Lade die `.p8` Datei herunter
4. Notiere Key ID und Team ID
5. In EAS hochladen: `eas credentials` → iOS → Push Notifications → Upload APNs Key

**Detaillierte Anleitung:** `EAS_TOKEN_SETUP.md` oder `APNS_CREDENTIALS_SETUP.md`

## 🤖 Android: FCM HTTP v1 API Setup

### ⚠️ WICHTIG: Legacy API wurde eingestellt

Die **Cloud Messaging API (Legacy)** wurde am **20.06.2023 verworfen** und wird am **20.06.2024 komplett eingestellt**.

**Expo Push Notifications verwendet automatisch die FCM HTTP v1 API** (ab expo-server-sdk@4.0.0).

### Schritt 1: Firebase Cloud Messaging API (V1) aktivieren

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle Projekt: **spotx-52cc3** (Projektnummer: `514290450822`)
3. ⚙️ **Settings** → **Project Settings**
4. Tab: **Cloud Messaging**
5. Stelle sicher, dass **Firebase Cloud Messaging API (V1)** aktiviert ist
6. Falls nicht aktiviert:
   - Klicke auf die drei Punkte neben "Firebase Cloud Messaging API (V1)"
   - Wähle **Manage API in Google Cloud Console**
   - Klicke auf **Enable**
   - Kehre zur Firebase Console zurück

### Schritt 2: FCM Credentials für Expo (Optional - für Legacy Server Key)

**Hinweis:** Expo konvertiert automatisch Legacy Server Keys zu HTTP v1. Falls du noch einen Legacy Server Key hast:

1. In Firebase Console: Tab **Cloud Messaging**
2. Unter **Cloud Messaging API (Legacy)** findest du:
   - **Server Key** - Kann noch für Expo verwendet werden (wird automatisch konvertiert)
   - Kopiere den Server Key (beginnt meist mit `AAAA...`)

**Empfohlen:** Verwende stattdessen einen Service Account Key (siehe `FCM_HTTP_V1_SETUP.md`)

### Schritt 2: FCM Server Key in EAS hochladen

**WICHTIG:** Für Expo Push Notifications muss der FCM Server Key in **EAS** konfiguriert werden, nicht direkt im Code!

```bash
# Mit EAS CLI
eas credentials
```

**Wähle:**

1. Platform: `Android` (a)
2. Build Profile: `production` oder `preview`
3. Action: `Push Notifications: Set up`
4. Option: `Upload FCM Server Key`
5. Füge den Server Key ein

### Schritt 3: Alternativ - FCM Server Key als EAS Secret

```bash
# Als EAS Secret speichern (für Production)
eas secret:create --scope project --name FCM_SERVER_KEY --value "DEIN_SERVER_KEY_HIER"
```

**Hinweis:** Expo Push Notifications verwendet automatisch den FCM Server Key aus EAS, wenn er konfiguriert ist.

## 📋 Checkliste

### iOS

- [ ] EAS Access Token gesetzt
- [ ] `eas credentials` ausgeführt
- [ ] APNs Key generiert/hochgeladen
- [ ] Neuer Build erstellt: `eas build --platform ios --profile production`

### Android

- [ ] Firebase Console geöffnet
- [ ] FCM Server Key kopiert
- [ ] `eas credentials` → Android → Push Notifications → FCM Server Key hochgeladen
- [ ] `google-services.json` ist im `android/app/` Verzeichnis ✅ (bereits erledigt)
- [ ] Firebase Gradle Plugin konfiguriert ✅ (bereits erledigt)

## 🚀 Nach dem Setup

### Neuen Build erstellen

**iOS:**

```bash
eas build --platform ios --profile production
```

**Android:**

```bash
eas build --platform android --profile production
```

### Testen

1. Installiere den neuen Build auf deinem Gerät
2. Öffne die App und melde dich an
3. Aktiviere Benachrichtigungen
4. Sende eine Test-Benachrichtigung über `/admin/notifications`
5. Die Benachrichtigung sollte jetzt ankommen! ✅

## 🔍 Überprüfung

Nach erfolgreichem Setup solltest du sehen:

✅ **iOS:**

```
✅ Push notification sent successfully
```

✅ **Android:**

```
✅ Push notification sent successfully
```

Statt:

```
❌ APNs Credentials fehlen
❌ FCM Credentials fehlen
```

## 📚 Weitere Ressourcen

- **iOS Setup:** `EAS_TOKEN_SETUP.md` oder `APNS_CREDENTIALS_SETUP.md`
- **Android Setup:** `FCM_SERVER_KEY_SETUP.md` oder `FIREBASE_ANDROID_SETUP.md`
- **Ohne Apple Developer Account:** `PUSH_NOTIFICATIONS_WITHOUT_APPLE_ACCOUNT.md`

## ⚡ Schnell-Referenz

```bash
# 1. EAS Token setzen
export EXPO_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"

# 2. iOS Credentials
eas credentials  # → iOS → production → Push Notifications → Generate APNs Key

# 3. Android Credentials  
eas credentials  # → Android → production → Push Notifications → Upload FCM Server Key

# 4. Builds erstellen
eas build --platform ios --profile production
eas build --platform android --profile production
```
