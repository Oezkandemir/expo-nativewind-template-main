# App Bundles Verzeichnis

**Hier die `.aab` Dateien für den Google Play Store ablegen.**

## 📦 Dateien hier ablegen

Nachdem Sie ein App Bundle erstellt haben:

1. **Von EAS Build heruntergeladen:**
   ```bash
   # Nach dem Build von https://expo.dev herunterladen
   # Datei hier speichern: play-store/app-bundles/
   ```

2. **Lokaler Build:**
   ```bash
   # Falls lokal gebaut, die .aab Datei hier ablegen
   # Typischerweise: android/app/build/outputs/bundle/release/app-release.aab
   ```

## 📋 Beispiel-Dateinamen

- `spotx-1.0.0.aab`
- `app-release-1.0.0.aab`
- `spotx-production-2024-01-15.aab`

## ⚠️ Wichtig

- **NICHT** in Git committen (bereits in `.gitignore`)
- Nur für lokale Aufzeichnungen
- App Bundles können groß sein (10-100 MB)
- Für Produktion immer von EAS Build verwenden

## 🔄 Workflow

1. Build erstellen: `npm run build:production:android`
2. Von EAS herunterladen
3. Hier ablegen (optional, für Aufzeichnungen)
4. Zur Play Console hochladen: `eas submit --platform android`
