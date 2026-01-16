# 🚀 iOS Production Build - Schritt-für-Schritt Anleitung

**Privacy Policy URL:** ✅ https://www.spotxapp.com/datenschutz  
**Ziel:** Production Build für App Store erstellen und hochladen

---

## 📋 VORBEREITUNG

### 1. EAS CLI installieren (falls noch nicht vorhanden)

```bash
npm install -g eas-cli
```

### 2. Bei EAS anmelden

```bash
eas login
```

Gib deine Expo/EAS Zugangsdaten ein.

### 3. Projekt-Verzeichnis öffnen

```bash
cd /Users/dmr/Desktop/expo-nativewind-template-main
```

---

## 🔐 SCHRITT 1: iOS Production Credentials einrichten

### Option A: Automatisch (Empfohlen)

EAS kann die Credentials automatisch erstellen und verwalten:

```bash
eas credentials -p ios
```

**Interaktive Schritte:**

1. **Platform auswählen:**
   ```
   ? Select platform: (Use arrow keys)
   ❯ iOS
     Android
   ```
   Drücke `Enter` für iOS

2. **Build Profile auswählen:**
   ```
   ? Select build profile: (Use arrow keys)
   ❯ production
     preview
     development
   ```
   Drücke `Enter` für `production`

3. **Aktion auswählen:**
   ```
   ? What would you like to do? (Use arrow keys)
   ❯ Set up new credentials
     Use existing credentials
     Remove credentials
   ```
   Wähle `Set up new credentials` (oder `Use existing credentials` falls bereits vorhanden)

4. **Setup-Methode:**
   ```
   ? How would you like to set up your credentials? (Use arrow keys)
   ❯ Automatic (recommended)
     Manual
   ```
   Wähle `Automatic (recommended)`

5. **Apple Developer Account:**
   - EAS wird dich nach deinen Apple Developer Account Zugangsdaten fragen
   - Gib deine Apple ID und Passwort ein
   - Falls 2FA aktiviert ist, gib den Code ein

6. **Team auswählen:**
   Falls du mehrere Teams hast, wähle das richtige Team aus

**EAS wird automatisch:**
- ✅ Distribution Certificate erstellen
- ✅ Provisioning Profile erstellen (mit Push Notifications)
- ✅ APNs Key konfigurieren (falls benötigt)
- ✅ Alle Credentials sicher speichern

### Option B: Credentials prüfen (falls bereits vorhanden)

```bash
eas credentials -p ios
```

Wähle:
1. Platform: `iOS`
2. Build Profile: `production`
3. Action: `View credentials`

Du solltest sehen:
- ✅ Distribution Certificate: Configured
- ✅ Provisioning Profile: Configured
- ✅ Push Notifications: Configured

---

## 🔍 SCHRITT 2: Pre-Build Checks (Optional aber empfohlen)

Führe vor dem Build Checks durch:

```bash
# TypeScript Check
npm run typecheck

# Linting
npm run lint

# Oder beides auf einmal:
npm run prebuild
```

Falls Fehler auftreten, behebe sie vor dem Build.

---

## 🏗️ SCHRITT 3: Production Build erstellen

### Build starten:

```bash
npm run build:production:ios
```

**Oder direkt mit EAS:**

```bash
eas build --platform ios --profile production
```

### Was passiert jetzt:

1. **EAS lädt deinen Code hoch** (kann einige Minuten dauern)
2. **EAS erstellt den Build** auf Apple's Servern (15-30 Minuten)
3. **Du erhältst eine Build-URL** im Terminal
4. **Du kannst den Fortschritt verfolgen:**
   - Im Terminal
   - Oder im Browser: https://expo.dev/accounts/demiroo/projects/spotx/builds

### Build-Status prüfen:

```bash
eas build:list --platform ios
```

Zeigt alle iOS Builds mit Status an.

---

## ⏳ SCHRITT 4: Build abwarten

**Typische Build-Zeit:** 15-30 Minuten

Du kannst:
- Den Fortschritt im Terminal verfolgen
- Die EAS Build-Seite im Browser öffnen
- Andere Aufgaben erledigen

**Bei erfolgreichem Build siehst du:**
```
✅ Build finished
📦 Build artifact: https://expo.dev/...
```

---

## 📤 SCHRITT 5: Build zu App Store Connect hochladen

### Option A: Automatisch mit EAS Submit (Empfohlen)

```bash
npm run submit:ios
```

**Oder direkt:**

```bash
eas submit --platform ios --profile production
```

**Interaktive Schritte:**

1. **Build auswählen:**
   ```
   ? Which build would you like to submit? (Use arrow keys)
   ❯ Latest build for production profile
     Choose from a list of builds
   ```
   Wähle `Latest build for production profile`

2. **Apple ID:**
   - Gib deine Apple ID ein (die für App Store Connect)

3. **App-Specific Password (falls 2FA aktiviert):**
   - Falls 2FA aktiviert ist, erstelle ein App-Specific Password:
     - Gehe zu: https://appleid.apple.com
     - Sign-In and Security → App-Specific Passwords
     - Erstelle neues Password für "EAS Submit"
     - Gib dieses Password ein

4. **App Store Connect API Key (Optional, aber empfohlen):**
   - Falls du einen API Key hast, kannst du ihn verwenden
   - Sonst wird EAS dich nach Apple ID/Password fragen

**EAS lädt automatisch hoch:**
- ✅ Build wird zu App Store Connect hochgeladen
- ✅ Build erscheint in App Store Connect unter "TestFlight" oder "App Store"

### Option B: Manuell hochladen

1. Gehe zu: https://appstoreconnect.apple.com
2. Wähle deine App
3. Gehe zu "TestFlight" oder "App Store"
4. Klicke auf "+" oder "Add Build"
5. Wähle den Build aus der Liste

---

## ✅ SCHRITT 6: App Store Connect konfigurieren

Nach erfolgreichem Upload musst du in App Store Connect:

### 1. Privacy Policy URL hinzufügen

1. Gehe zu: https://appstoreconnect.apple.com
2. Wähle deine App: **spotx**
3. Gehe zu: **App Privacy** (links im Menü)
4. Scrolle zu: **Privacy Policy URL**
5. Füge ein: `https://www.spotxapp.com/datenschutz`
6. Speichern

### 2. App Information ausfüllen (falls noch nicht geschehen)

**App Store Tab:**
- [ ] App Name: `spotx`
- [ ] Subtitle (optional)
- [ ] Category auswählen
- [ ] Description schreiben
- [ ] Keywords setzen
- [ ] Screenshots hochladen (mindestens 1)
- [ ] App Icon hochladen (1024x1024)
- [ ] Support URL angeben

**App Information Tab:**
- [ ] Age Rating ausfüllen
- [ ] Contact Information ausfüllen

### 3. Build für Review auswählen

1. Gehe zu: **App Store** → **1.0 Prepare for Submission**
2. Wähle den Build aus (der gerade hochgeladen wurde)
3. Fülle alle erforderlichen Felder aus
4. Klicke auf **"Submit for Review"**

---

## 🐛 TROUBLESHOOTING

### Problem 1: "No credentials found"

**Lösung:**
```bash
eas credentials -p ios
# Wähle: production → Set up credentials → Automatic
```

### Problem 2: "Invalid Apple ID"

**Lösung:**
- Stelle sicher, dass deine Apple ID Zugang zu App Store Connect hat
- Prüfe, ob du im Apple Developer Program bist (99$/Jahr)
- Falls 2FA aktiviert: Verwende App-Specific Password

### Problem 3: "Build failed"

**Lösung:**
1. Prüfe die Build-Logs:
   ```bash
   eas build:view [BUILD_ID]
   ```
2. Häufige Ursachen:
   - TypeScript Fehler → `npm run typecheck`
   - Linting Fehler → `npm run lint:fix`
   - Credentials Problem → `eas credentials -p ios`

### Problem 4: "Bundle ID not found"

**Lösung:**
1. Gehe zu: https://developer.apple.com/account/resources/identifiers/list
2. Erstelle neue App ID: `com.exponativewindtemplate.app`
3. Oder verwende eine bestehende App ID

### Problem 5: "Push Notifications not configured"

**Lösung:**
```bash
eas credentials -p ios
# Wähle: production → Push Notifications → Set up
# Wähle: Automatic
```

---

## 📊 BUILD STATUS PRÜFEN

### Alle Builds anzeigen:

```bash
eas build:list --platform ios
```

### Spezifischen Build anzeigen:

```bash
eas build:view [BUILD_ID]
```

### Build-Logs anzeigen:

```bash
eas build:view [BUILD_ID] --logs
```

---

## 🎯 SCHNELLREFERENZ

### Komplette Pipeline (alle Schritte):

```bash
# 1. Credentials einrichten
eas credentials -p ios
# Wähle: production → Set up → Automatic

# 2. Pre-Checks
npm run prebuild

# 3. Build erstellen
npm run build:production:ios

# 4. Build hochladen (nach erfolgreichem Build)
npm run submit:ios
```

### Nur Build erstellen (wenn Credentials bereits vorhanden):

```bash
npm run build:production:ios
```

### Nur hochladen (wenn Build bereits vorhanden):

```bash
npm run submit:ios
```

---

## 📝 WICHTIGE HINWEISE

1. **Build-Zeit:** Ein Production Build dauert 15-30 Minuten
2. **Kosten:** EAS Builds sind kostenlos für Expo-Accounts
3. **Apple Developer:** Du brauchst einen aktiven Apple Developer Account (99$/Jahr)
4. **Privacy Policy:** Vergiss nicht, die URL in App Store Connect hinzuzufügen!
5. **Screenshots:** Mindestens 1 Screenshot ist erforderlich für App Store Submission

---

## ✅ CHECKLISTE

Vor dem Build:
- [ ] EAS CLI installiert: `npm install -g eas-cli`
- [ ] Bei EAS angemeldet: `eas login`
- [ ] Apple Developer Account aktiv
- [ ] Pre-Checks durchgeführt: `npm run prebuild`

Credentials:
- [ ] iOS Production Credentials konfiguriert: `eas credentials -p ios`

Build:
- [ ] Production Build erstellt: `npm run build:production:ios`
- [ ] Build erfolgreich abgeschlossen

Submission:
- [ ] Build zu App Store Connect hochgeladen: `npm run submit:ios`
- [ ] Privacy Policy URL in App Store Connect hinzugefügt
- [ ] App Information ausgefüllt
- [ ] Build für Review ausgewählt

---

## 🆘 HILFE

- **EAS Dokumentation:** https://docs.expo.dev/build/introduction/
- **EAS Build Status:** https://expo.dev/accounts/demiroo/projects/spotx/builds
- **App Store Connect:** https://appstoreconnect.apple.com

---

**Viel Erfolg mit deinem Build! 🚀**
