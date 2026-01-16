# 📱 iOS App Store Veröffentlichungs-Checkliste

**Status:** ⚠️ **NICHT BEREIT** - Es gibt noch einige kritische Punkte zu beheben

---

## 🔴 KRITISCHE PROBLEME (Müssen behoben werden)

### 1. Versionsinkonsistenz ❌
**Problem:** Die Versionen stimmen nicht überein zwischen `app.json` und `Info.plist`

- **app.json:** Version `2.0.3`, Build Number `3`
- **Info.plist:** CFBundleShortVersionString `2.0.0`, CFBundleVersion `2`

**Lösung:** Info.plist muss aktualisiert werden, um mit app.json übereinzustimmen.

### 2. Fehlende Privacy Policy URL ❌
**Problem:** App Store Connect erfordert eine Privacy Policy URL

**Lösung:** 
- Privacy Policy erstellen und hosten
- URL in App Store Connect hinzufügen
- Optional: URL in `app.json` unter `ios.infoPlist` hinzufügen

### 3. iOS Production Credentials ⚠️
**Status:** Unbekannt - muss überprüft werden

**Prüfung:**
```bash
eas credentials -p ios
# Wähle: production
# Prüfe ob Distribution Certificate und Provisioning Profile konfiguriert sind
```

**Falls nicht konfiguriert:**
```bash
eas credentials -p ios
# Wähle: production → Set up credentials → Automatic
```

---

## ✅ KONFIGURATION PRÜFUNG

### App-Konfiguration (app.json)
- ✅ Bundle Identifier: `com.exponativewindtemplate.app`
- ✅ Version: `2.0.3`
- ✅ Build Number: `3`
- ✅ App Name: `spotx`
- ✅ Icon konfiguriert
- ✅ Splash Screen konfiguriert
- ✅ Permissions mit Beschreibungen vorhanden
- ✅ ITSAppUsesNonExemptEncryption: `false` (korrekt für App Store)
- ⚠️ Privacy Policy URL: **FEHLT**

### Info.plist
- ⚠️ CFBundleShortVersionString: `2.0.0` (sollte `2.0.3` sein)
- ⚠️ CFBundleVersion: `2` (sollte `3` sein)
- ✅ Alle Permission Descriptions vorhanden
- ✅ ITSAppUsesNonExemptEncryption: `false`
- ✅ Minimum iOS Version: `12.0`

### EAS Build Konfiguration (eas.json)
- ✅ Production Profile vorhanden
- ✅ iOS Simulator: `false` (korrekt für App Store)
- ✅ Submit Konfiguration vorhanden

### Entitlements
- ✅ Push Notifications konfiguriert (`aps-environment: default`)

---

## 📋 APP STORE CONNECT CHECKLISTE

### Vor dem Build

#### 1. Apple Developer Account
- [ ] Apple Developer Program Mitgliedschaft aktiv (99$/Jahr)
- [ ] App Store Connect Zugang vorhanden
- [ ] Team ID bekannt

#### 2. App Store Connect App erstellen
- [ ] Neue App in App Store Connect erstellt
- [ ] Bundle ID: `com.exponativewindtemplate.app` registriert
- [ ] App Name gewählt (muss eindeutig sein)
- [ ] Primary Language ausgewählt

#### 3. App Information
- [ ] App Name: `spotx` (oder gewünschter Name)
- [ ] Subtitle (optional, max. 30 Zeichen)
- [ ] Category ausgewählt
- [ ] Content Rights: "Contains third-party content" (falls zutreffend)

#### 4. Pricing & Availability
- [ ] Preis festgelegt (kostenlos oder kostenpflichtig)
- [ ] Verfügbarkeit in Ländern festgelegt
- [ ] Verfügbarkeitsdatum gesetzt

#### 5. Privacy & Compliance
- [ ] **Privacy Policy URL** hinzugefügt (ERFORDERLICH!)
- [ ] Export Compliance Fragen beantwortet
- [ ] Content Rights Fragen beantwortet
- [ ] Advertising Identifier: "Serves Ads" oder "Does not serve ads"

#### 6. App Store Listing Assets
- [ ] App Icon (1024x1024 PNG, ohne Alpha-Kanal)
- [ ] Screenshots für iPhone (mindestens 1, max. 10)
  - [ ] iPhone 6.7" Display (iPhone 14 Pro Max, etc.)
  - [ ] iPhone 6.5" Display (iPhone 11 Pro Max, etc.)
  - [ ] iPhone 5.5" Display (iPhone 8 Plus, etc.)
- [ ] Screenshots für iPad (optional, falls `supportsTablet: true`)
- [ ] App Preview Video (optional)
- [ ] Description (max. 4000 Zeichen)
- [ ] Keywords (max. 100 Zeichen)
- [ ] Support URL
- [ ] Marketing URL (optional)

#### 7. Age Rating
- [ ] Age Rating Fragebogen ausgefüllt
- [ ] Content Descriptors angegeben

#### 8. App Review Information
- [ ] Contact Information ausgefüllt
- [ ] Demo Account (falls Login erforderlich)
- [ ] Notes für Reviewer (optional)

---

## 🔧 TECHNISCHE VORBEREITUNG

### 1. Versionen synchronisieren

**Info.plist aktualisieren:**
```xml
<key>CFBundleShortVersionString</key>
<string>2.0.3</string>
<key>CFBundleVersion</key>
<string>3</string>
```

**Oder:** Info.plist wird automatisch von Expo generiert. Stelle sicher, dass `app.json` korrekt ist.

### 2. Production Build erstellen

```bash
# Pre-Checks durchführen
npm run prebuild

# Production Build erstellen
npm run build:production:ios
```

### 3. Build überprüfen

Nach erfolgreichem Build:
- [ ] Build wurde erfolgreich erstellt
- [ ] Build ist in EAS Dashboard sichtbar
- [ ] Build kann zu App Store Connect hochgeladen werden

### 4. App Store Submission

```bash
# Automatisch zu App Store Connect hochladen
npm run submit:ios

# Oder manuell:
eas submit --platform ios --profile production
```

---

## 📝 SCHRITT-FÜR-SCHRITT ANLEITUNG

### Schritt 1: Versionen korrigieren

Die Info.plist wird von Expo automatisch generiert. Stelle sicher, dass `app.json` korrekt ist:

```json
{
  "expo": {
    "version": "2.0.3",
    "ios": {
      "buildNumber": "3"
    }
  }
}
```

Nach dem nächsten `expo prebuild` wird Info.plist automatisch aktualisiert.

### Schritt 2: Privacy Policy erstellen

1. Erstelle eine Privacy Policy (siehe `docs/MASTER_PLAN.md` für Template)
2. Hoste sie auf einer öffentlich zugänglichen URL
3. Füge URL in App Store Connect hinzu:
   - App Store Connect → Deine App → App Privacy → Privacy Policy URL

### Schritt 3: iOS Credentials prüfen

```bash
eas credentials -p ios
```

Wähle:
1. Platform: `iOS` (i)
2. Build Profile: `production` (p)
3. Action: `View credentials` oder `Set up credentials`

Stelle sicher, dass vorhanden sind:
- ✅ Distribution Certificate
- ✅ Provisioning Profile (mit Push Notifications)
- ✅ APNs Key (für Push Notifications)

### Schritt 4: App Store Connect vorbereiten

1. Gehe zu https://appstoreconnect.apple.com
2. Erstelle neue App (falls noch nicht vorhanden)
3. Fülle alle erforderlichen Felder aus (siehe Checkliste oben)
4. **WICHTIG:** Füge Privacy Policy URL hinzu

### Schritt 5: Production Build erstellen

```bash
# Pre-Checks
npm run prebuild

# Build erstellen
npm run build:production:ios
```

Warte auf Build-Abschluss (kann 15-30 Minuten dauern).

### Schritt 6: App einreichen

```bash
npm run submit:ios
```

Oder manuell in App Store Connect:
1. Gehe zu "TestFlight" oder "App Store"
2. Wähle den Build aus
3. Fülle alle erforderlichen Informationen aus
4. Sende zur Review

---

## ⚠️ HÄUFIGE FEHLER

### Fehler 1: "Missing Compliance"
**Lösung:** 
- Export Compliance Fragen in App Store Connect beantworten
- `ITSAppUsesNonExemptEncryption: false` ist bereits gesetzt (gut!)

### Fehler 2: "Missing Privacy Policy"
**Lösung:**
- Privacy Policy URL in App Store Connect hinzufügen
- URL muss öffentlich zugänglich sein

### Fehler 3: "Invalid Bundle"
**Lösung:**
- Stelle sicher, dass Bundle ID in App Store Connect registriert ist
- Prüfe, dass Bundle ID in `app.json` und App Store Connect übereinstimmt

### Fehler 4: "Missing Screenshots"
**Lösung:**
- Mindestens 1 Screenshot für iPhone 6.7" Display erforderlich
- Screenshots müssen echte App-Screenshots sein (keine Mockups)

### Fehler 5: "Invalid Version"
**Lösung:**
- Version muss höher sein als vorherige Version
- Build Number muss höher sein als vorherige Build Number

---

## ✅ FINALE CHECKLISTE VOR SUBMISSION

### Technisch
- [ ] Versionen sind konsistent (app.json und Info.plist)
- [ ] Production Credentials sind konfiguriert
- [ ] Production Build wurde erfolgreich erstellt
- [ ] Build wurde zu App Store Connect hochgeladen

### App Store Connect
- [ ] App wurde erstellt
- [ ] Alle erforderlichen Felder ausgefüllt
- [ ] Privacy Policy URL hinzugefügt
- [ ] Screenshots hochgeladen (mindestens 1)
- [ ] Description geschrieben
- [ ] Keywords gesetzt
- [ ] Age Rating ausgefüllt
- [ ] Support URL angegeben
- [ ] Contact Information ausgefüllt

### Testing
- [ ] App wurde auf echtem Gerät getestet
- [ ] Alle Features funktionieren
- [ ] Keine kritischen Bugs vorhanden
- [ ] Performance ist akzeptabel

---

## 🚀 NÄCHSTE SCHRITTE

1. **SOFORT:** Versionen in Info.plist korrigieren (oder `expo prebuild` ausführen)
2. **HEUTE:** Privacy Policy erstellen und hosten
3. **HEUTE:** iOS Production Credentials prüfen/konfigurieren
4. **DIESE WOCHE:** App Store Connect Listing vorbereiten
5. **DIESE WOCHE:** Production Build erstellen und testen
6. **DIESE WOCHE:** App zur Review einreichen

---

## 📚 WEITERE RESSOURCEN

- [Expo App Store Submission Guide](https://docs.expo.dev/submit/ios/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

**Letzte Aktualisierung:** $(date)
