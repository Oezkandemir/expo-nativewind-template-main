# Android Keystore - Wichtige Klarstellung

## ⚠️ WICHTIG: Zwei verschiedene Keys!

Google Play Console verwendet **zwei verschiedene Keys**:

### 1. **Upload Key** (der, den DU verwendest)
- Mit diesem Key signierst du dein App Bundle
- Dieser Key wird von **EAS Build** verwendet
- Du musst diesen Key zu EAS hochladen

### 2. **App Signing Key** (von Google verwaltet)
- Google verwendet diesen Key für die finale Signatur
- Dieser wird von Google Play automatisch verwaltet
- Du siehst diesen in Google Play Console → Setup → App signing

## 🔍 Was bedeutet die Fehlermeldung?

Wenn Google Play Console sagt:
> "Dein App Bundle muss mit dem Zertifikat mit diesem Fingerabdruck signiert sein: SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"

Das bedeutet:
- **Google Play erwartet einen bestimmten Upload-Key**
- Dieser Upload-Key wurde bereits in Google Play Console registriert
- Du musst **genau diesen Key** verwenden, um das Bundle zu signieren

## ✅ Lösung: Den richtigen Upload-Key finden

### Option 1: Prüfe Google Play Console (EMPFOHLEN)

1. Gehe zu: https://play.google.com/console
2. Wähle deine App aus
3. Gehe zu: **Setup** → **App signing**
4. Suche nach **"Upload key certificate"**
5. Dort siehst du den SHA1 Fingerabdruck des erwarteten Upload-Keys

**Das ist der Key, den du brauchst!**

### Option 2: Hast du den Keystore bereits?

Falls du bereits einen Keystore hast, prüfe seinen SHA1:

```bash
# Prüfe SHA1 eines Keystores
keytool -list -v -keystore /path/to/keystore.jks -alias alias-name
```

Suche nach dem SHA1, der mit `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24` übereinstimmt.

### Option 3: Neuen Upload-Key registrieren (wenn der alte verloren ist)

⚠️ **WARNUNG:** Dies ist kompliziert und sollte nur gemacht werden, wenn der alte Key wirklich verloren ist!

1. Erstelle einen neuen Keystore:
   ```bash
   keytool -genkeypair -v \
     -storetype PKCS12 \
     -keystore android/app/upload-key.keystore \
     -alias upload-key \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

2. Lade diesen zu EAS hoch:
   ```bash
   eas credentials -p android
# Wähle dann interaktiv: production
   ```

3. **WICHTIG:** Kontaktiere Google Play Support, um den Upload-Key zu ändern:
   - Gehe zu Google Play Console → Hilfe & Support
   - Erkläre, dass du den Upload-Key ändern musst
   - Google wird dich durch den Prozess führen

## 🚀 Schnell-Lösung: Aktuellen Keystore zu EAS hochladen

Falls du den Keystore mit SHA1 `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24` bereits hast:

```bash
# 1. Stelle sicher, dass du bei EAS angemeldet bist
eas login

# 2. Starte Credentials Setup
eas credentials -p android
# Wähle dann interaktiv: production
```

**Wähle:**
- Platform: **Android** (a)
- Build Profile: **production** (p)
- Action: **Update credentials** oder **Set up new credentials**
- Option: **Upload existing keystore**
- Gib den Pfad zum Keystore ein
- Gib Passwörter ein

## ❓ Was ist, wenn ich den Keystore nicht finde?

1. **Prüfe alle sicheren Speicher:**
   - 1Password, LastPass, Bitwarden
   - Cloud-Speicher (Dropbox, Google Drive, iCloud)
   - Backup-Festplatten
   - E-Mails (falls du ihn dir selbst geschickt hast)

2. **Prüfe Google Play Console:**
   - Gehe zu Setup → App signing
   - Dort siehst du den SHA1 des erwarteten Upload-Keys
   - Das bestätigt, welcher Key benötigt wird

3. **Falls wirklich verloren:**
   - Kontaktiere Google Play Support
   - Sie können dir helfen, einen neuen Upload-Key zu registrieren

## 📝 Checkliste

- [ ] Google Play Console geöffnet und Upload-Key SHA1 geprüft
- [ ] Keystore mit korrektem SHA1 gefunden
- [ ] Keystore zu EAS hochgeladen
- [ ] Neuen Build erstellt: `eas build --platform android --profile production`
- [ ] Neues Bundle zu Google Play hochgeladen
- [ ] Signatur-Fehler behoben ✅

## 🆘 Hilfe

Falls du immer noch nicht weiterkommst:

1. **Prüfe zuerst Google Play Console:**
   - Welcher SHA1 wird dort angezeigt?
   - Ist das derselbe wie `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24`?

2. **Prüfe EAS Credentials:**
   ```bash
   eas credentials -p android
# Wähle dann interaktiv: production
   ```
   - Welcher SHA1 wird dort angezeigt?
   - Stimmt er mit Google Play überein?

3. **Falls unterschiedlich:**
   - Du musst den Keystore mit dem SHA1 aus Google Play Console zu EAS hochladen
