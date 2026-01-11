# ✅ Was musst du jetzt tun? - Schnell-Checkliste

## 🎯 Kurzfassung

**Gute Nachricht:** Dein Code ist bereits bereit! `expo-server-sdk@4.0.0` unterstützt automatisch die FCM HTTP v1 API.

**Du musst nur noch 2 Dinge in Firebase machen:**

---

## ✅ Schritt 1: Firebase Cloud Messaging API (V1) aktivieren

**Das ist das WICHTIGSTE!**

1. **Öffne Firebase Console:**
   - Gehe zu: <https://console.firebase.google.com/>
   - Wähle dein Projekt: **spotx-52cc3**

2. **API aktivieren:**
   - Klicke auf **⚙️ Zahnrad** (oben links) → **Project Settings**
   - Gehe zum Tab **Cloud Messaging**
   - Suche nach **"Firebase Cloud Messaging API (V1)"**
   - **Prüfe:** Ist es aktiviert? (sollte "Enabled" oder "Aktiviert" stehen)

3. **Falls NICHT aktiviert:**
   - Klicke auf die **drei Punkte** (⋮) neben "Firebase Cloud Messaging API (V1)"
   - Wähle **"Manage API in Google Cloud Console"**
   - In der neuen Seite: Klicke auf **"Enable"** oder **"Aktivieren"**
   - Warte ein paar Sekunden
   - Kehre zur Firebase Console zurück und aktualisiere die Seite
   - ✅ Jetzt sollte "Enabled" stehen

**Das war's für Schritt 1!** 🎉

---

## ✅ Schritt 2: FCM Credentials in EAS hochladen (Optional)

**WICHTIG:** Schritt 1 (API aktivieren) ist das Wichtigste! Schritt 2 ist nur nötig, wenn du noch keine Credentials in EAS hast.

### Option A: Service Account Key erstellen (Modern, empfohlen)

**Das ist die moderne Methode für FCM HTTP v1!**

1. **In Firebase Console:**
   - Gehe zu: ⚙️ **Settings** → **Project Settings**
   - Tab: **Service Accounts**
   - Klicke auf **"Generate new private key"**
   - Bestätige mit **"Generate key"**
   - Eine JSON-Datei wird heruntergeladen - **bewahre sie sicher auf!**

2. **Service Account Key in EAS hochladen:**
   
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
   4. Option: `Upload FCM Server Key` oder `Upload Service Account Key` (je nach EAS Version)
   5. Füge den Inhalt der JSON-Datei ein (oder den Key, je nachdem was EAS verlangt)

### Option B: Legacy Server Key (Falls noch verfügbar)

**Hinweis:** Die Legacy API ist verworfen, aber Expo kann Legacy Server Keys noch verwenden (wird automatisch konvertiert).

Falls du noch einen Legacy Server Key siehst:
- Tab **Cloud Messaging** → Unter **"Cloud Messaging API (Legacy)"** → **Server Key** kopieren
- In EAS hochladen wie oben beschrieben

**Aber:** Service Account Key (Option A) ist die bessere Wahl für die Zukunft!

---

## ✅ Schritt 3: Testen

Nach dem Setup:

1. **Neuen Build erstellen:**

   ```bash
   eas build --platform android --profile production
   ```

2. **Build installieren** auf deinem Gerät

3. **Test-Benachrichtigung senden:**
   - Gehe zu `/admin/notifications` im Merchant Portal
   - Sende eine Test-Benachrichtigung
   - ✅ Sollte jetzt funktionieren!

---

## 📋 Zusammenfassung - Was du JETZT tun musst

- [ ] **Schritt 1:** Firebase Console öffnen → Cloud Messaging API (V1) aktivieren ⚠️ **WICHTIG!**
- [ ] **Schritt 2:** Service Account Key erstellen und in EAS hochladen (optional, aber empfohlen)
- [ ] **Schritt 3:** Neuen Build erstellen und testen

**Wichtig:** Schritt 1 ist das Wichtigste! Schritt 2 ist optional - Expo kann auch ohne Credentials in EAS funktionieren, wenn die API aktiviert ist (für Development/Testing).

---

## ❓ Häufige Fragen

### "Muss ich Code ändern?"

**Nein!** Dein Code ist bereits bereit. `expo-server-sdk@4.0.0` verwendet automatisch FCM HTTP v1.

### "Was passiert, wenn ich nichts tue?"

Die Legacy API wird am 20.06.2024 eingestellt. Dann funktionieren Push-Benachrichtigungen nicht mehr, bis du die HTTP v1 API aktivierst.

### "Reicht es, nur die API zu aktivieren?"

Ja, für Development/Testing reicht das! Für Production Builds solltest du auch die Credentials in EAS hochladen (Schritt 2 mit Service Account Key).

### "Ich sehe keinen Legacy Server Key mehr"

Das ist normal! Die Legacy API ist verworfen. Verwende stattdessen einen **Service Account Key** (siehe Schritt 2, Option A). Das ist die moderne Methode für FCM HTTP v1.

### "Wo finde ich die Cloud Messaging API (V1)?"

Firebase Console → ⚙️ Settings → Project Settings → Tab "Cloud Messaging" → Suche nach "Firebase Cloud Messaging API (V1)"

---

## 🆘 Hilfe benötigt?

- **Detaillierte Anleitung:** Siehe `FCM_HTTP_V1_SETUP.md`
- **Schnell-Setup:** Siehe `QUICK_FCM_SETUP.md`
- **Vollständiges Setup:** Siehe `PUSH_CREDENTIALS_COMPLETE_SETUP.md`
