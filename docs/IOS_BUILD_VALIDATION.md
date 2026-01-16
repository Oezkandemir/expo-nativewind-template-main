# iOS Build Validation Guide

## Problem
Fehler werden erst beim Submit erkannt, obwohl der Build erfolgreich war. Dies führt zu unnötigen Rebuilds.

## Lösung: Lokale Validierung vor dem Build

### Schnellstart

**Vor jedem iOS Build:**
```bash
npm run validate:ios
```

Dies prüft:
- ✅ CFBundleIconName in app.json und Info.plist
- ✅ Icon-Datei existiert und ist 1024x1024
- ✅ AppIcon Asset Catalog hat alle benötigten Größen
- ✅ Build-Nummer ist gesetzt

### Vollständiger Workflow

#### 1. Validierung (NEU!)
```bash
npm run validate:ios
```

Dies führt `expo prebuild` lokal aus und prüft die generierte iOS-Konfiguration.

#### 2. Build erstellen
```bash
npm run build:production:ios
```

**Wichtig:** Dies führt automatisch die Validierung aus!

#### 3. Submit (IMMER mit --latest!)
```bash
npm run submit:ios
# oder
eas submit --platform ios --latest
```

**⚠️ KRITISCH:** Verwende IMMER `--latest` beim Submit, um sicherzustellen, dass der neueste Build eingereicht wird!

### Manuelle Validierung

Falls du das Skript manuell ausführen möchtest:
```bash
./scripts/validate-ios-config.sh
```

### Was wird geprüft?

1. **app.json Konfiguration**
   - CFBundleIconName ist gesetzt
   - Icon-Pfad ist korrekt
   - Build-Nummer ist vorhanden

2. **Icon-Datei**
   - Datei existiert
   - Größe ist 1024x1024 Pixel

3. **Generierte iOS-Konfiguration**
   - Info.plist enthält CFBundleIconName
   - AppIcon Asset Catalog existiert
   - Alle benötigten Icon-Größen sind konfiguriert

### Häufige Fehler vermeiden

#### ❌ Falsch: Alten Build submiten
```bash
eas submit --platform ios --id <old-build-id>
```

#### ✅ Richtig: Neuesten Build submiten
```bash
eas submit --platform ios --latest
```

#### ❌ Falsch: Build ohne Validierung
```bash
eas build --platform ios --profile production
```

#### ✅ Richtig: Mit automatischer Validierung
```bash
npm run build:production:ios
```

### Troubleshooting

#### Validierung schlägt fehl

1. **CFBundleIconName fehlt:**
   ```json
   // In app.json → ios.infoPlist hinzufügen:
   "CFBundleIconName": "AppIcon"
   ```

2. **Icon ist nicht 1024x1024:**
   ```bash
   sips -z 1024 1024 assets/images/icon.png
   ```

3. **Asset Catalog fehlt:**
   - Das Skript führt automatisch `expo prebuild` aus
   - Prüfe `ios/spotx/Images.xcassets/AppIcon.appiconset/Contents.json`

### Build-Nummer prüfen

Um sicherzustellen, dass du den richtigen Build submitest:

```bash
# Liste aller Builds anzeigen
eas build:list --platform ios

# Neuesten Build-ID finden
eas build:list --platform ios --limit 1
```

### Best Practices

1. ✅ **Immer validieren** vor dem Build
2. ✅ **Immer `--latest`** beim Submit verwenden
3. ✅ **Build-Nummer prüfen** vor dem Submit
4. ✅ **Build-Logs prüfen** wenn Fehler auftreten

### Scripts Übersicht

| Command | Beschreibung |
|---------|-------------|
| `npm run validate:ios` | Validiert iOS-Konfiguration lokal |
| `npm run build:production:ios` | Build mit automatischer Validierung |
| `npm run submit:ios` | Submit mit `--latest` Flag |
