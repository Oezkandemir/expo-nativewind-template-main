# 🚀 Schnelle Lösung: Keystore Problem beheben

## ✅ Wichtig: Der SHA1 aus der Fehlermeldung ist korrekt!

Google Play erwartet:
```
SHA1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

## 🔍 Schritt 1: Prüfe EAS Credentials

Der Keystore könnte bereits in EAS sein, aber mit falschem SHA1:

```bash
# Stelle sicher, dass du bei EAS angemeldet bist
eas login

# Prüfe aktuelle Credentials
eas credentials -p android
# Wähle dann interaktiv: production → View credentials
```

Wähle: **"View credentials"** und prüfe den SHA1.

**Falls der SHA1 NICHT übereinstimmt:**
- Du musst den Keystore mit dem korrekten SHA1 hochladen
- Oder einen neuen Keystore erstellen (siehe Schritt 2)

## 🔧 Schritt 2: Neuen Keystore erstellen (falls der alte verloren ist)

⚠️ **WICHTIG:** Wenn du einen neuen Keystore erstellst, musst du Google Play Support kontaktieren, um den Upload-Key zu ändern!

### 2.1: Erstelle neuen Keystore

```bash
cd /Users/dmr/Desktop/expo-nativewind-template-main

# Erstelle neuen Keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/upload-key.keystore \
  -alias upload-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Wichtig:** Notiere dir:
- Keystore-Passwort
- Key-Alias: `upload-key`
- Key-Passwort

### 2.2: Lade zu EAS hoch

```bash
eas credentials -p android
```

Wähle dann interaktiv:
- Build Profile: **production** (wird in der Liste angezeigt)
- Action: **Set up new credentials** oder **Update credentials**
- Option: **Upload existing keystore**
- Pfad: `android/app/upload-key.keystore`
- Alias: `upload-key`
- Passwörter eingeben

### 2.3: Kontaktiere Google Play Support

⚠️ **KRITISCH:** Du musst Google Play Support kontaktieren!

1. Gehe zu: https://play.google.com/console
2. Klicke auf **"Hilfe & Support"** (oben rechts)
3. Erkläre:
   > "Ich habe den Upload-Key verloren. Ich habe einen neuen Keystore erstellt und möchte diesen als neuen Upload-Key registrieren. Bitte helfen Sie mir dabei."

4. Google wird dich durch den Prozess führen

## 🎯 Alternative: Prüfe ob EAS den Key automatisch erstellt hat

Manchmal erstellt EAS automatisch einen Keystore beim ersten Build. Prüfe:

```bash
eas credentials -p android
# Wähle: production → View credentials
```

Falls dort ein Keystore ist, aber der SHA1 nicht übereinstimmt:
- Google Play erwartet einen anderen Key
- Du musst den Key finden, der den SHA1 `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24` hat

## 📝 Zusammenfassung

**Option 1: Keystore finden** (beste Lösung)
- Suche nach dem Keystore mit SHA1 `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24`
- Lade ihn zu EAS hoch

**Option 2: Neuen Keystore erstellen** (wenn der alte verloren ist)
- Erstelle neuen Keystore
- Lade zu EAS hoch
- Kontaktiere Google Play Support, um den Upload-Key zu ändern

## 🆘 Hilfe-Script

Falls du verwirrt bist:

```bash
# Suche nach Keystores
./scripts/finde-keystore.sh

# Oder prüfe manuell
./scripts/check-keystore-sha1.sh /pfad/zum/keystore.jks alias
```
