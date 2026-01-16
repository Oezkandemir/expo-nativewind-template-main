# iOS Archive Failed - Exit Status 65 Fix

## Problem
Build schlägt beim Archivieren fehl:
```
▸ ** ARCHIVE FAILED **
▸ The following build commands failed:
▸ 	CompileAssetCatalogVariant thinned ... /Images.xcassets (in target 'spotx' from project 'spotx')
▸ 	Archiving workspace spotx with scheme spotx
▸ (2 failures)
Exit status: 65
```

### Specific Error: CompileAssetCatalogVariant Failed

**Symptom:** `CompileAssetCatalogVariant` fails when compiling `Images.xcassets`

**Common Causes:**
1. **Missing icon file** - The asset catalog references `App-Icon-1024x1024@1x.png` but the file doesn't exist
2. **Invalid asset catalog structure** - The Contents.json references images that don't exist
3. **Corrupted icon file** - The icon file exists but is corrupted or empty
4. **Plugin execution order** - Icon generation plugin runs after asset catalog update

**Solution (Implemented):**
- Enhanced `plugins/withIosIcons.js` to validate icon file exists before updating Contents.json
- Plugin now checks for icon file and throws error if missing (fails fast during prebuild)
- Plugin validates icon file is not empty before proceeding

## Häufige Ursachen:

### 1. Code Signing Problem (Häufigste Ursache)

**Symptom:** Build schlägt beim Archivieren fehl ohne klare Fehlermeldung

**Lösung:**
```bash
# iOS Credentials prüfen/setzen
eas credentials -p ios

# Wähle:
# - Platform: iOS (i)
# - Build Profile: production (p)
# - Action: Set up credentials oder Configure credentials
# - Choose: Automatic provisioning
```

### 2. Hermes Engine Problem

Die Warnung über Hermes könnte ein Hinweis sein.

**Lösung:** Prüfe ob Hermes richtig konfiguriert ist:

**In `ios/Podfile.properties.json`:**
```json
{
  "expo.jsEngine": "hermes"
}
```

Oder deaktiviere Hermes temporär:
```json
{
  "expo.jsEngine": "jsc"
}
```

### 3. Missing Dependencies

**Lösung:**
```bash
# Lokal testen
cd ios
pod deintegrate
pod install
cd ..
```

### 4. Build Settings Problem

**Lösung:** Prüfe Xcode Build Settings:
- Deployment Target muss >= 15.1 sein
- Code Signing muss richtig konfiguriert sein

## Debugging Steps:

### Schritt 1: Vollständige Build-Logs prüfen

Gehe zu: https://expo.dev/accounts/demiroo/projects/spotx/builds/[BUILD_ID]

Suche nach:
- `error:` (nicht `warning:`)
- `failed`
- `missing`
- `cannot find`

### Schritt 2: Lokal testen

```bash
# iOS Projekt neu generieren
rm -rf ios
npx expo prebuild --platform ios

# Lokal bauen (falls Xcode installiert)
cd ios
pod install
cd ..
npx expo run:ios --configuration Release
```

### Schritt 3: Credentials prüfen

```bash
eas credentials -p ios
# Wähle: production
# Wähle: View credentials
```

Prüfe:
- ✅ Distribution Certificate vorhanden
- ✅ Provisioning Profile vorhanden
- ✅ Provisioning Profile hat richtige Entitlements

## Schnelle Lösung:

1. **Credentials neu setzen:**
   ```bash
   eas credentials -p ios
   # Wähle: production → Set up credentials → Automatic
   ```

2. **Neuen Build erstellen:**
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

3. **Falls weiterhin Fehler:**
   - Prüfe vollständige Build-Logs
   - Suche nach spezifischen Fehlermeldungen
   - Prüfe ob alle Dependencies installiert sind

## Wichtig:

Exit status 65 ist ein generischer Xcode Build-Fehler. Die **tatsächliche Fehlermeldung** steht normalerweise **vor** der "ARCHIVE FAILED" Meldung in den Build-Logs.

**Prüfe die vollständigen Build-Logs** um die genaue Fehlermeldung zu finden!
