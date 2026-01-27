# Development Build Guide - iOS & Android

Diese Anleitung zeigt, wie Sie Development Builds für die lokale Entwicklung erstellen.

## Was ist ein Development Build?

Ein Development Build ist eine App-Version mit `expo-dev-client`, die es ermöglicht:
- Native Module zu testen
- Custom native Code zu verwenden
- Hot Reload und Fast Refresh zu nutzen
- Ohne Expo Go zu entwickeln

## Option 1: Lokale Builds (Schnellste Methode)

### Voraussetzungen

**iOS:**
- Xcode installiert (über App Store)
- CocoaPods installiert: `sudo gem install cocoapods`
- iOS Simulator oder physisches Gerät

**Android:**
- Android Studio installiert
- Android SDK installiert
- Android Emulator oder physisches Gerät
- `ANDROID_HOME` Umgebungsvariable gesetzt

### iOS Development Build (Lokal)

```bash
# Einfachste Methode - baut und startet automatisch
npm run ios

# Oder mit Expo CLI
npx expo run:ios

# Für bestimmten Simulator
npx expo run:ios --device "iPhone 15 Pro"

# Mit Cache löschen (empfohlen bei Problemen)
npx expo start --clear
# Dann im Terminal 'i' drücken für iOS
```

**Build-Output:**
- Die App wird automatisch im iOS Simulator installiert und gestartet
- Oder auf verbundenem physischem Gerät

### Android Development Build (Lokal)

```bash
# Einfachste Methode - baut und startet automatisch
npm run android

# Oder mit Expo CLI
npx expo run:android

# Für bestimmten Emulator/Gerät
npx expo run:android --device

# Mit Cache löschen (empfohlen bei Problemen)
npx expo start --clear
# Dann im Terminal 'a' drücken für Android
```

**Build-Output:**
- APK wird erstellt unter: `android/app/build/outputs/apk/debug/app-debug.apk`
- Die App wird automatisch im Emulator/Gerät installiert und gestartet

## Option 2: EAS Development Builds (Lokal)

Wenn Sie EAS Build verwenden möchten, aber lokal bauen:

### iOS Development Build (EAS Local)

```bash
# Development Build für iOS Simulator (lokal)
npm run build:ios:local -- --profile development

# Oder direkt
eas build --platform ios --profile development --local
```

### Android Development Build (EAS Local)

```bash
# Development Build für Android (lokal)
npm run build:android:local -- --profile development

# Oder direkt
eas build --platform android --profile development --local
```

**Build-Output:**
- iOS: `.app` Datei für Simulator oder `.ipa` für Gerät
- Android: `.apk` Datei

## Option 3: EAS Cloud Development Builds

Für Cloud Builds (benötigt EAS Account):

```bash
# iOS Development Build (Cloud)
npm run build:dev:ios

# Android Development Build (Cloud)
npm run build:dev:android
```

## Nach dem Build

### Development Server starten

Nach dem Build müssen Sie den Development Server starten:

```bash
# Startet Metro Bundler
npm start

# Oder mit Cache löschen
npm run dev
```

Die App verbindet sich automatisch mit dem Development Server.

## Troubleshooting

### iOS: Pods neu installieren

```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### Android: Gradle Cache löschen

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Metro Bundler Cache löschen

```bash
npx expo start --clear
```

### Node Modules neu installieren

```bash
rm -rf node_modules
npm install
# oder mit bun
bun install
```

### iOS: Xcode Build Cache löschen

```bash
# In Xcode: Product > Clean Build Folder (Shift+Cmd+K)
# Oder Terminal:
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Android: Build Cache löschen

```bash
cd android
./gradlew clean
rm -rf .gradle
rm -rf app/build
cd ..
```

## Häufige Probleme

### "No devices found"

**iOS:**
- Simulator starten: `open -a Simulator`
- Oder in Xcode: Window > Devices and Simulators

**Android:**
- Emulator starten: `emulator -avd <emulator-name>`
- Oder in Android Studio: AVD Manager

### "Command not found: pod"

```bash
sudo gem install cocoapods
```

### Android Build Fehler

```bash
# Gradle Wrapper Berechtigungen prüfen
chmod +x android/gradlew

# Android SDK Path prüfen
echo $ANDROID_HOME
```

### iOS Build Fehler

```bash
# Xcode Command Line Tools installieren
xcode-select --install

# CocoaPods aktualisieren
sudo gem install cocoapods
pod repo update
```

## Empfohlener Workflow

1. **Erstes Mal Setup:**
   ```bash
   # Dependencies installieren
   npm install
   
   # iOS Pods installieren (nur iOS)
   cd ios && pod install && cd ..
   ```

2. **Development:**
   ```bash
   # Development Server starten
   npm start
   
   # In neuem Terminal: App bauen
   npm run ios    # oder npm run android
   ```

3. **Bei Code-Änderungen:**
   - Hot Reload funktioniert automatisch
   - Bei Native Code Änderungen: App neu bauen

4. **Bei Problemen:**
   ```bash
   # Cache löschen und neu bauen
   npm run dev
   # Dann im Terminal 'i' oder 'a' drücken
   ```

## Unterschiede zwischen Build-Typen

| Methode | Geschwindigkeit | Voraussetzungen | Verwendung |
|---------|----------------|-----------------|------------|
| `expo run:ios/android` | Sehr schnell | Lokale Tools | Tägliche Entwicklung |
| EAS Local Build | Schnell | Lokale Tools | Testing vor Deployment |
| EAS Cloud Build | Langsam | EAS Account | CI/CD, Team-Sharing |

## Nächste Schritte

Nach erfolgreichem Development Build:
- App sollte automatisch starten
- Metro Bundler läuft im Terminal
- Code-Änderungen werden automatisch geladen (Hot Reload)
- Native Module sind verfügbar

Für Production Builds siehe: [BUILD.md](./BUILD.md)
