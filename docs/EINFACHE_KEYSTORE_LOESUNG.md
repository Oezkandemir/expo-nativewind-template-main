# 🔧 Einfache Lösung: Android Keystore Problem beheben

## ❓ Was ist das Problem?

Google Play Console sagt:
> "Dein App Bundle wurde mit dem falschen Schlüssel signiert"

Das bedeutet: **Du verwendest einen anderen Key als Google Play erwartet.**

## ✅ Lösung in 3 Schritten

### Schritt 1: Finde heraus, welcher Key wirklich benötigt wird

**Gehe zu Google Play Console:**
1. Öffne: https://play.google.com/console
2. Wähle deine App aus
3. Gehe zu: **Setup** → **App signing**
4. Suche nach **"Upload key certificate"**
5. **Notiere dir den SHA1 Fingerabdruck** (z.B. `AE:98:21:3F:79:BC:...`)

**Das ist der Key, den du brauchst!**

### Schritt 2: Finde den Keystore mit diesem SHA1

Du musst den Keystore finden, der diesen SHA1 Fingerabdruck hat.

**Wo könnte der Keystore sein?**
- ✅ 1Password, LastPass, Bitwarden (Passwort-Manager)
- ✅ Dropbox, Google Drive, iCloud (Cloud-Speicher)
- ✅ Backup-Festplatten
- ✅ E-Mails (falls du ihn dir selbst geschickt hast)
- ✅ Auf deinem Computer (suche nach `*.keystore` oder `*.jks`)

**Falls du einen Keystore gefunden hast, prüfe seinen SHA1:**

```bash
# Prüfe SHA1 eines Keystores
keytool -list -v -keystore /pfad/zum/keystore.jks -alias alias-name
```

**Oder verwende das Script:**
```bash
./scripts/check-keystore-sha1.sh /pfad/zum/keystore.jks alias-name
```

### Schritt 3: Lade den Keystore zu EAS hoch

**Falls du den Keystore mit dem korrekten SHA1 hast:**

```bash
# 1. Stelle sicher, dass du bei EAS angemeldet bist
eas login

# 2. Starte Credentials Setup
eas credentials -p android
```

**Wähle dann interaktiv:**
- Build Profile: **production** (wird in der Liste angezeigt)
- Action: **Update credentials** oder **Set up new credentials**
- Option: **Upload existing keystore**
- Gib den Pfad zum Keystore ein
- Gib das Keystore-Passwort ein
- Gib den Key-Alias ein
- Gib das Key-Passwort ein

**Dann erstelle einen neuen Build:**
```bash
eas build --platform android --profile production
```

## ❌ Was ist, wenn ich den Keystore nicht finde?

### Option 1: Google Play Support kontaktieren

Falls der Keystore wirklich verloren ist:
1. Gehe zu Google Play Console → **Hilfe & Support**
2. Erkläre, dass du den Upload-Key verloren hast
3. Google wird dir helfen, einen neuen Upload-Key zu registrieren

### Option 2: Neuen Keystore erstellen (nur wenn Google es erlaubt)

⚠️ **WARNUNG:** Dies funktioniert nur, wenn Google Play Support es erlaubt!

```bash
# Erstelle neuen Keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/upload-key.keystore \
  -alias upload-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Lade zu EAS hoch
eas credentials -p android --profile production
```

**Dann:** Kontaktiere Google Play Support, um den neuen Upload-Key zu registrieren.

## 🆘 Hilfe-Script verwenden

Falls du verwirrt bist, verwende dieses Script:

```bash
./scripts/verify-google-play-key.sh
```

Das Script führt dich durch alle Schritte und hilft dir, die Situation zu klären.

## 📝 Checkliste

- [ ] Google Play Console geöffnet → Setup → App signing
- [ ] SHA1 Fingerabdruck des Upload-Keys notiert
- [ ] Keystore mit diesem SHA1 gefunden
- [ ] Keystore zu EAS hochgeladen
- [ ] Neuen Build erstellt
- [ ] Neues Bundle zu Google Play hochgeladen
- [ ] Problem behoben ✅

## 💡 Wichtig zu verstehen

**Es gibt zwei verschiedene Keys:**

1. **Upload Key** (den DU verwendest)
   - Mit diesem signierst du dein Bundle
   - Muss zu EAS hochgeladen werden
   - Wird von Google Play erwartet

2. **App Signing Key** (von Google verwaltet)
   - Wird von Google Play verwendet
   - Wird automatisch verwaltet
   - Du musst dich darum nicht kümmern

**Du musst den Upload-Key mit dem SHA1 aus Google Play Console verwenden!**
