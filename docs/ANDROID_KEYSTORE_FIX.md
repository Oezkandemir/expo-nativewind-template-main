# Android Keystore Signatur-Fehler beheben

## Problem

Das Android App Bundle wurde mit dem falschen Schlüssel signiert.

**Erforderlicher SHA1 Fingerabdruck:**
```
AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

**Aktueller SHA1 Fingerabdruck:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## Lösung: Korrekten Keystore zu EAS hochladen

### Schritt 1: Prüfe aktuelle EAS Credentials

```bash
eas credentials -p android
```

Wähle:
- Platform: **Android** (a)
- Build Profile: **production** (p)
- Action: **View credentials** oder **Update credentials**

### Schritt 2: Prüfe ob du den korrekten Keystore hast

Falls du bereits einen Keystore mit dem korrekten SHA1 Fingerabdruck hast:

```bash
# Prüfe SHA1 Fingerabdruck eines Keystores
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
```

Suche nach:
```
Certificate fingerprints:
     SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

### Schritt 3: Keystore zu EAS hochladen

#### Option A: Über EAS CLI (Empfohlen)

```bash
eas credentials -p android
```

Wähle:
1. Platform: **Android** (a)
2. Build Profile: **production** (p)
3. Action: **Update credentials** oder **Set up new credentials**
4. **Upload existing keystore**
5. Gib den Pfad zu deinem Keystore ein
6. Gib Keystore-Passwort ein
7. Gib Key-Alias ein
8. Gib Key-Passwort ein

#### Option B: Keystore manuell hochladen

Falls du den Keystore manuell hochladen möchtest:

```bash
# Stelle sicher, dass du bei EAS angemeldet bist
eas login

# Starte Credentials Setup
eas credentials -p android
# Wähle dann interaktiv: production
```

### Schritt 4: Verifiziere den hochgeladenen Keystore

Nach dem Hochladen kannst du die Credentials prüfen:

```bash
eas credentials -p android
# Wähle dann interaktiv: production
```

Wähle **View credentials** und prüfe den SHA1 Fingerabdruck.

### Schritt 5: Neuen Production Build erstellen

Nach dem Hochladen des korrekten Keystores:

```bash
# Lösche alten Build (optional)
rm -f android/app/build/outputs/bundle/release/app-release.aab

# Erstelle neuen Production Build
eas build --platform android --profile production
```

### Schritt 6: Prüfe den neuen Build

Nach dem Build kannst du den SHA1 Fingerabdruck des signierten Bundles prüfen:

```bash
# Installiere bundletool (falls nicht vorhanden)
# Download: https://github.com/google/bundletool/releases

# Extrahiere APKs aus dem Bundle
bundletool build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks \
  --mode=universal

# Prüfe Signatur
apksigner verify --print-certs app.apks | grep SHA-1
```

## Falls du den korrekten Keystore nicht hast

### Option 1: Keystore aus Google Play Console exportieren

Falls du bereits einen Upload-Key in Google Play Console hast:

1. Gehe zu Google Play Console → **Setup** → **App signing**
2. Prüfe den **Upload key certificate** SHA1 Fingerabdruck
3. Falls dieser nicht übereinstimmt, musst du einen neuen Upload-Key erstellen

### Option 2: Neuen Keystore erstellen (NICHT empfohlen)

⚠️ **WARNUNG:** Wenn du einen neuen Keystore erstellst, musst du Google Play Console kontaktieren, um den Upload-Key zu ändern. Dies ist kompliziert und sollte vermieden werden.

Falls du trotzdem einen neuen Keystore erstellen musst:

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias spotx-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Dann zu EAS hochladen (siehe Schritt 3).

## Verhindere zukünftige Probleme

1. **Sichere den Keystore:** Speichere den Keystore sicher (z.B. in 1Password, LastPass, oder einem sicheren Cloud-Speicher)
2. **Dokumentiere Credentials:** Notiere dir:
   - Keystore-Pfad
   - Keystore-Passwort
   - Key-Alias
   - Key-Passwort
   - SHA1 Fingerabdruck
3. **Verwende EAS Credentials:** Lass EAS die Credentials verwalten, anstatt sie lokal zu speichern

## Hilfe

Falls du Probleme hast:

1. Prüfe EAS Credentials:
   ```bash
   eas credentials -p android
# Wähle dann interaktiv: production
   ```

2. Kontaktiere Google Play Support, falls der Upload-Key geändert werden muss

3. Siehe auch:
   - [EAS Android Credentials Docs](https://docs.expo.dev/app-signing/managed-credentials/)
   - [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
