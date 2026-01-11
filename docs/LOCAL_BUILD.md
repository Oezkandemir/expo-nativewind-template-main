# Lokale Development Builds (ohne EAS)

## Schnellstart

### iOS Build (Simulator)
```bash
npm run ios
```
Oder:
```bash
npx expo run:ios
```

### Android Build (Emulator)
```bash
npm run android
```
Oder:
```bash
npx expo run:android
```

## Mit Cache löschen (empfohlen für Logo-Fix)

### iOS mit Cache löschen
```bash
npx expo start --clear
# Dann im Terminal: 'i' für iOS Simulator drücken
```

### Android mit Cache löschen
```bash
npx expo start --clear
# Dann im Terminal: 'a' für Android Emulator drücken
```

## Voraussetzungen

### iOS
- Xcode installiert
- iOS Simulator verfügbar
- CocoaPods installiert (`sudo gem install cocoapods`)

### Android
- Android Studio installiert
- Android SDK installiert
- Android Emulator eingerichtet
- `ANDROID_HOME` Umgebungsvariable gesetzt

## Troubleshooting

### Metro Bundler Cache löschen
```bash
npx expo start --clear
```

### Node Modules neu installieren
```bash
rm -rf node_modules
npm install
```

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

## Unterschied zu EAS Builds

- **Lokale Builds**: Schneller, aber benötigen lokale Entwicklungsumgebung
- **EAS Builds**: Langsamer, aber funktionieren ohne lokale Setup (machen wir später)

## Wichtig für Logo-Fix

Nach Änderungen am Logo oder anderen Assets:
1. Cache löschen: `npx expo start --clear`
2. App neu bauen: `npm run ios` oder `npm run android`
