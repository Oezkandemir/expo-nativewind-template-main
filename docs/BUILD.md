# Build & Deployment Guide

Dieses Dokument erklärt, wie Sie die SpotX App lokal testen und für Deployment vorbereiten.

## Pre-Deployment Checks

Bevor Sie die App zu EAS pushen, sollten Sie folgende Checks durchführen:

**Wichtig:** Führen Sie zuerst `npm install` aus, um die aktualisierten Dependencies zu installieren!

### 1. TypeScript Type Check

```bash
npm run typecheck
```

Prüft alle TypeScript-Fehler ohne Code zu generieren.

### 2. Linting

```bash
npm run lint
```

Oder mit Auto-Fix:

```bash
npm run lint:fix
```

### 3. Alle Checks auf einmal

```bash
npm run prebuild
```

Führt TypeScript-Check und Linting aus.

### 4. Pre-Build Script (erweitert)

```bash
./scripts/pre-build-check.sh
```

Führt alle Checks inklusive Expo Doctor aus.

## Lokale Builds (vor EAS)

### iOS Simulator Build

```bash
npm run ios
```

Oder:

```bash
expo run:ios
```

### Android Emulator Build

```bash
npm run android
```

Oder:

```bash
expo run:android
```

### EAS Local Builds (empfohlen vor Deployment)

**iOS lokal bauen:**
```bash
npm run build:ios:local
```

**Android lokal bauen:**
```bash
npm run build:android:local
```

**Hinweis:** Lokale Builds benötigen:
- iOS: Xcode und CocoaPods installiert
- Android: Android Studio und Android SDK installiert

## EAS Cloud Builds

### Preview Builds (für Testing)

**iOS Preview:**
```bash
npm run build:preview:ios
```

**Android Preview:**
```bash
npm run build:preview:android
```

### Production Builds (mit Pre-Checks)

**iOS Production:**
```bash
npm run build:production:ios
```

**Android Production:**
```bash
npm run build:production:android
```

**Beide Plattformen:**
```bash
npm run build:production:all
```

## Deployment Workflow

### Empfohlener Workflow:

1. **Code ändern und testen:**
   ```bash
   npm start
   # Testen im Simulator/Emulator
   ```

2. **Pre-Checks durchführen:**
   ```bash
   npm run prebuild
   # Oder
   ./scripts/pre-build-check.sh
   ```

3. **Lokalen Build testen (optional aber empfohlen):**
   ```bash
   npm run build:ios:local
   # Oder
   npm run build:android:local
   ```

4. **Preview Build erstellen:**
   ```bash
   npm run build:preview:ios
   # Testen Sie die Preview-Version
   ```

5. **Production Build erstellen:**
   ```bash
   npm run build:production:ios
   npm run build:production:android
   ```

6. **Zu App Stores submiten:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Troubleshooting

### TypeScript Fehler

Wenn TypeScript-Fehler auftreten:
1. Prüfen Sie die Fehlermeldungen
2. Beheben Sie die Fehler
3. Führen Sie `npm run typecheck` erneut aus

### Lint Fehler

Wenn Lint-Fehler auftreten:
```bash
npm run lint:fix  # Versucht automatisch zu fixen
```

### Build Fehler

Wenn Builds fehlschlagen:
1. Prüfen Sie die EAS Build Logs
2. Führen Sie `npx expo-doctor` aus
3. Prüfen Sie `eas.json` Konfiguration
4. Stellen Sie sicher, dass alle Dependencies installiert sind

### Expo Doctor

Führt eine umfassende Prüfung der Expo-Konfiguration durch:

```bash
npx expo-doctor
```

## Wichtige Hinweise

- **Immer Pre-Checks ausführen** bevor Sie zu EAS pushen
- **Lokale Builds** sind langsamer, aber helfen Fehler früh zu finden
- **Preview Builds** sind gut für interne Tests
- **Production Builds** sollten nur nach erfolgreichen Tests erstellt werden
- **Git Commits** sollten sauber sein vor Production Builds

## CI/CD Integration

Die `.github/workflows/pre-deploy-check.yml` Datei kann in GitHub Actions verwendet werden, um automatisch Checks durchzuführen bei Pull Requests.

