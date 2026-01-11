# Dependency Update Guide

## Status

Die `package.json` wurde mit den von Expo Doctor empfohlenen Versionen aktualisiert.

## Nächste Schritte

Nach dem Update der `package.json` führen Sie bitte folgende Befehle aus:

```bash
# 1. Dependencies installieren/aktualisieren
npm install

# 2. Expo Doctor erneut ausführen, um zu prüfen ob alles passt
npx expo-doctor

# 3. Optional: Expo install --check für automatische Korrekturen
npx expo install --check
```

## Expo Doctor Warnungen

### 1. Native Module Compatibility
Diese Warnung betrifft interne Expo-Pakete und sollte sich nach `npm install` automatisch lösen.

### 2. App Config Sync Warning
Diese Warnung erscheint, weil das Projekt sowohl native Ordner (`ios/`, `android/`) als auch Prebuild-Konfiguration in `app.json` hat. Das ist normal für Projekte mit vorhandenen nativen Modulen.

**Optionen:**
- **Option A**: Native Ordner behalten (aktueller Zustand) - EAS Build verwendet die nativen Ordner direkt
- **Option B**: Native Ordner löschen und Prebuild verwenden - EAS Build generiert native Ordner automatisch

Für SpotX empfehlen wir **Option A** (native Ordner behalten).

### 3. Package Version Mismatches
Diese wurden in `package.json` korrigiert. Nach `npm install` sollten diese Warnungen verschwinden.

## Aktualisierte Pakete

- `@react-native-async-storage/async-storage`: `^2.1.0` → `2.1.2`
- `babel-preset-expo`: `^13.2.4` → `~13.0.0`
- `expo`: `~53.0.22` → `~53.0.25`
- `expo-constants`: `~17.1.7` → `~17.1.8`
- `expo-dev-client`: `^6.0.20` → `~5.2.4`
- `expo-image`: `^2.4.0` → `~2.4.1`
- `expo-router`: `~5.1.5` → `~5.1.10`
- `react-native-safe-area-context`: `^5.4.0` → `5.4.0`
- `react-native-svg`: `^15.12.1` → `15.11.2`
- `react-native-web`: `^0.21.1` → `^0.20.0`

## Nach dem Update

```bash
# Pre-Build-Checks erneut ausführen
./scripts/pre-build-check.sh

# Oder manuell
npm run typecheck
npm run lint
npx expo-doctor
```

## Wichtige Hinweise

- **expo-dev-client** wurde von `^6.0.20` auf `~5.2.4` downgraded, da Expo SDK 53 diese Version erwartet
- Einige Pakete wurden von `^` (caret) auf `~` (tilde) geändert für genauere Versionierung
- Nach `npm install` sollten alle Expo Doctor Checks grün sein


