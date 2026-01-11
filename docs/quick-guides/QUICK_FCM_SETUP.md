# ⚡ FCM HTTP v1 API - Schnell-Setup

## ⚠️ WICHTIG: Legacy API wurde eingestellt

Die **Cloud Messaging API (Legacy)** wurde am **20.06.2023 verworfen** und wird am **20.06.2024 komplett eingestellt**.

**Für vollständige Anleitung siehe `FCM_HTTP_V1_SETUP.md`**

## Projekt-Info

- **Projektnummer:** `514290450822`
- **Projekt-ID:** `spotx-52cc3`
- **Package:** `com.exponativewindtemplate.app`

## ✅ Expo Push Notifications (Schnellste Lösung)

**Gute Nachricht:** `expo-server-sdk@4.0.0+` verwendet automatisch FCM HTTP v1!

### Schritt 1: Firebase Cloud Messaging API (V1) aktivieren

1. Gehe zu: https://console.firebase.google.com/
2. Wähle Projekt: **spotx-52cc3**
3. Klicke auf **⚙️ Zahnrad** (oben links) → **Project Settings**
4. Gehe zum Tab **Cloud Messaging**
5. Stelle sicher, dass **Firebase Cloud Messaging API (V1)** aktiviert ist
6. Falls nicht: Klicke auf drei Punkte → **Manage API in Google Cloud Console** → **Enable**

### Schritt 2: Legacy Server Key (Optional - für Expo)

**Hinweis:** Expo kann Legacy Server Keys noch verwenden (wird automatisch konvertiert), aber für neue Setups sollte HTTP v1 verwendet werden.

1. In Firebase Console: Tab **Cloud Messaging**
2. Unter **Cloud Messaging API (Legacy)**:
   - **Server Key** - Kann noch für Expo verwendet werden
   - Kopiere den gesamten Key (beginnt meist mit `AAAA...`)

### Schritt 3: In EAS hochladen

```bash
# Stelle sicher, dass EAS CLI installiert ist
npm install -g eas-cli

# Token setzen (falls noch nicht gesetzt)
export EXPO_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"

# Credentials öffnen
eas credentials
```

**Wähle:**
1. Platform: `Android` (drücke `a`)
2. Build Profile: `production` (p) oder `preview`
3. Action: `Push Notifications: Set up`
4. Option: `Upload FCM Server Key`
5. Füge den kopierten Server Key ein

## ✅ Fertig!

Nach dem Upload sollte Android Push-Benachrichtigungen funktionieren!

## Testen

1. Erstelle einen neuen Build:
   ```bash
   eas build --platform android --profile production
   ```

2. Installiere den Build auf deinem Gerät

3. Teste Push-Benachrichtigungen über `/admin/notifications`

## Troubleshooting

### "Server Key nicht gefunden"

- Stelle sicher, dass du im richtigen Projekt bist: **spotx-52cc3**
- Prüfe, ob Cloud Messaging API aktiviert ist
- Falls nicht sichtbar, aktiviere die Cloud Messaging API in Firebase Console

### "Invalid Server Key"

- Stelle sicher, dass der gesamte Key kopiert wurde (keine Leerzeichen am Anfang/Ende)
- Prüfe, ob der Key zum richtigen Firebase-Projekt gehört
- Stelle sicher, dass der Key für das richtige Package (`com.exponativewindtemplate.app`) ist

## Weitere Hilfe

Siehe: `FCM_SERVER_KEY_SETUP.md` für detaillierte Anleitung
