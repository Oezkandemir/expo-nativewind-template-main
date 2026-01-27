# Lösung ohne Setup-Seite sichtbar

## ✅ Wichtig: Der SHA1 aus der Fehlermeldung ist korrekt!

Da Google Play Console dir eine Fehlermeldung mit einem spezifischen SHA1 zeigt:
```
SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

**Das ist der SHA1, den du brauchst!** Google Play hat diesen bereits registriert (wahrscheinlich beim ersten Upload).

## 🔍 Schritt 1: Suche nach dem Keystore

Suche auf deinem Computer nach Keystore-Dateien:

### Auf macOS/Linux:
```bash
# Suche nach .keystore Dateien
find ~ -name "*.keystore" -o -name "*.jks" 2>/dev/null

# Suche auch in Downloads, Desktop, etc.
find ~/Downloads ~/Desktop ~/Documents -name "*.keystore" -o -name "*.jks" 2>/dev/null
```

### Auf Windows:
- Suche im Explorer nach `*.keystore` oder `*.jks`
- Prüfe Downloads, Desktop, Dokumente

### Prüfe auch:
- ✅ 1Password, LastPass, Bitwarden (Passwort-Manager)
- ✅ Dropbox, Google Drive, iCloud Ordner
- ✅ Backup-Festplatten
- ✅ E-Mails (falls du dir den Keystore geschickt hast)

## 🔍 Schritt 2: Prüfe den SHA1 jedes gefundenen Keystores

Falls du einen Keystore gefunden hast:

```bash
# Prüfe SHA1 (du wirst nach Passwort gefragt)
keytool -list -v -keystore /pfad/zum/keystore.jks -alias alias-name
```

**Oder verwende das Script:**
```bash
./scripts/check-keystore-sha1.sh /pfad/zum/keystore.jks alias-name
```

**Suche nach:**
```
SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

## ✅ Schritt 3: Falls du den Keystore hast

Lade ihn zu EAS hoch:

```bash
eas credentials -p android
# Wähle dann interaktiv: production → Update credentials
```

Wähle:
- Platform: **Android** (a)
- Build Profile: **production** (p)
- Action: **Update credentials** oder **Set up new credentials**
- Option: **Upload existing keystore**
- Gib alle Daten ein

Dann:
```bash
eas build --platform android --profile production
```

## ❌ Schritt 4: Falls du den Keystore NICHT findest

### Option A: Google Play Support kontaktieren

1. Gehe zu Google Play Console
2. Klicke auf **"Hilfe & Support"** (oben rechts)
3. Erkläre: "Ich habe den Upload-Key verloren. SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"
4. Frage, ob sie dir helfen können, einen neuen Upload-Key zu registrieren

### Option B: Neuen Keystore erstellen (nur wenn Google es erlaubt)

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

## 🆘 Alternative: Prüfe EAS Credentials

Vielleicht ist der richtige Keystore bereits in EAS, aber mit falschen Einstellungen:

```bash
eas credentials -p android
# Wähle dann interaktiv: production → Update credentials
```

Wähle "View credentials" und prüfe den SHA1. Falls er nicht übereinstimmt, musst du ihn aktualisieren.

## 📝 Zusammenfassung

**Du brauchst:**
- Keystore mit SHA1: `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24`

**Nächste Schritte:**
1. Suche nach dem Keystore auf deinem Computer
2. Prüfe den SHA1 jedes gefundenen Keystores
3. Falls gefunden: Lade zu EAS hoch
4. Falls nicht gefunden: Kontaktiere Google Play Support
