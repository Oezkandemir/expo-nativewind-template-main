# Cache-Problem beheben - Logo wird nicht angezeigt

## Problem
Das Logo wird auf den Sign-In und Sign-Up Screens nicht angezeigt, möglicherweise aufgrund eines Cache-Problems.

## Lösung: Cache löschen

### 1. Metro Bundler Cache löschen

```bash
# Stoppe den Metro Bundler (Ctrl+C im Terminal)

# Lösche den Cache
npx expo start --clear

# Oder manuell:
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### 2. React Native Cache löschen

```bash
# Watchman Cache löschen (falls installiert)
watchman watch-del-all

# Metro Cache löschen
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Node modules neu installieren (optional)
rm -rf node_modules
npm install
```

### 3. App neu bauen

**Für Development:**
```bash
npx expo start --clear
```

**Für Production Build:**
```bash
# iOS
npx expo run:ios --clear

# Android
npx expo run:android --clear
```

### 4. App auf dem Gerät neu installieren

**iOS:**
- App vom Gerät löschen
- Neu installieren über Xcode oder Expo Go

**Android:**
- App vom Gerät löschen
- Neu installieren über `adb install` oder Expo Go

## Verifizierung

Nach dem Cache-Löschen sollte das Logo (`spotxlogo.png`) auf beiden Screens angezeigt werden:
- ✅ Sign-In Screen (`app/(auth)/login.tsx`)
- ✅ Sign-Up Screen (`app/(auth)/register.tsx`)

## Logo-Datei

Das Logo befindet sich unter:
- `assets/images/spotxlogo.png`
- Größe: 120x120 Pixel
- Format: PNG

## Falls das Problem weiterhin besteht

1. **Prüfe, ob die Datei existiert:**
   ```bash
   ls -la assets/images/spotxlogo.png
   ```

2. **Prüfe den Import-Pfad:**
   - Der Pfad sollte sein: `require('@/assets/images/spotxlogo.png')`
   - Der Alias `@/` zeigt auf das Root-Verzeichnis

3. **Prüfe die Metro-Konfiguration:**
   - `metro.config.js` sollte korrekt konfiguriert sein
   - TypeScript-Pfade sollten in `tsconfig.json` definiert sein

4. **Alternative: Relativer Pfad verwenden:**
   ```typescript
   // Von app/(auth)/login.tsx
   source={require('../../assets/images/spotxlogo.png')}
   ```

## Quick Fix

Falls nichts hilft, versuche:

```bash
# Alles löschen und neu starten
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/metro-*
npm install
npx expo start --clear
```
