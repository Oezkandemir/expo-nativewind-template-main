# Development Build Setup Status

## ✅ Abgeschlossen

1. **Voraussetzungen geprüft:**
   - ✅ Xcode installiert (Version 26.2)
   - ✅ CocoaPods installiert (Version 1.16.2)
   - ✅ Android SDK gefunden (`/Users/dmr/Library/Android/sdk`)
   - ✅ EAS CLI installiert (Version 14.4.0)
   - ✅ Node.js installiert (Version 20.19.5)

2. **Native Ordner generiert:**
   - ✅ `ios/` Ordner erstellt mit Xcode-Projekt
   - ✅ `android/` Ordner erstellt mit Gradle-Projekt
   - ✅ Podfile erstellt in `ios/`
   - ✅ Gradle-Konfiguration erstellt in `android/`

## ✅ Build-Fehler behoben

3. **Android SDK Konfiguration:**
   - ✅ `android/local.properties` erstellt mit SDK-Pfad
   - ✅ Android Build sollte jetzt funktionieren

4. **iOS Build-Fix:**
   - ✅ Podfile aktualisiert mit Yoga Build-Fix
   - ✅ Fix für `-fmodules-cache-path` Compiler-Fehler hinzugefügt
   - **Nächster Schritt:** Pods neu installieren, damit der Fix angewendet wird

## 📋 Nächste Schritte

### 1. iOS Pods Installation abschließen (mit Fix)

Da das Podfile aktualisiert wurde, müssen die Pods neu installiert werden:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Hinweis:** Dieser Befehl kann 5-10 Minuten dauern, da viele Dependencies heruntergeladen werden müssen.

**Wichtig:** Der Yoga Build-Fix wurde bereits zum Podfile hinzugefügt und wird bei der nächsten `pod install` automatisch angewendet.

### 2. iOS Development Build erstellen

Nach erfolgreicher Pod-Installation:

```bash
# Option A: Lokaler Build (empfohlen für tägliche Entwicklung)
npm run ios

# Oder mit Expo CLI
npx expo run:ios

# Für bestimmten Simulator
npx expo run:ios --device "iPhone 15 Pro"
```

### 3. Android Development Build erstellen

```bash
# Option A: Lokaler Build (empfohlen für tägliche Entwicklung)
npm run android

# Oder mit Expo CLI
npx expo run:android

# Für bestimmten Emulator/Gerät
npx expo run:android --device
```

### 4. Development Server starten

Nach dem Build muss der Development Server gestartet werden:

```bash
npm start
# oder mit Cache löschen
npm run dev
```

Die App verbindet sich automatisch mit dem Development Server.

## 🔧 Alternative Build-Methoden

### EAS Local Builds

```bash
# iOS Development Build (EAS Local)
npm run build:ios:local -- --profile development

# Android Development Build (EAS Local)
npm run build:android:local -- --profile development
```

### EAS Cloud Builds

```bash
# iOS Development Build (Cloud)
npm run build:dev:ios

# Android Development Build (Cloud)
npm run build:dev:android
```

## 🐛 Troubleshooting

### iOS Pods Installation Probleme

Falls `pod install` fehlschlägt:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Probleme

```bash
cd android
./gradlew clean
chmod +x gradlew
cd ..
```

### Allgemeine Probleme

- Metro Cache löschen: `npx expo start --clear`
- Node Modules neu installieren: `rm -rf node_modules && bun install`

## 📚 Weitere Dokumentation

- `docs/DEV_BUILD_GUIDE.md` - Detaillierte Anleitung für Development Builds
- `docs/BUILD.md` - Allgemeine Build-Anleitung
- `BUILD_APK.md` - Spezifische Android APK Build-Anleitung

## ✅ Checkliste

- [x] Voraussetzungen geprüft
- [x] Native Ordner generiert
- [x] Android SDK konfiguriert (`android/local.properties`)
- [x] iOS Build-Fix hinzugefügt (Yoga Fix im Podfile)
- [ ] iOS Pods neu installiert (`cd ios && rm -rf Pods Podfile.lock && pod install`)
- [ ] iOS Build getestet (`npm run ios`)
- [ ] Android Build getestet (`npm run android`)
- [ ] Development Server gestartet und Verbindung geprüft
