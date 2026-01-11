# Google Play Store - App Bundles

Dieses Verzeichnis ist für App Bundles (.aab Dateien) gedacht, die zum Google Play Store hochgeladen werden sollen.

## 📁 Verzeichnisstruktur

```
play-store/
├── app-bundles/          # Hier die .aab Dateien ablegen
│   └── README.md        # Diese Datei
└── README.md            # Haupt-README
```

## 📦 App Bundle erstellen

### Mit EAS Build (empfohlen)

```bash
# Production Build für Android erstellen
npm run build:production:android

# Oder direkt mit EAS
eas build --platform android --profile production
```

Das App Bundle wird automatisch von EAS erstellt und kann von der EAS Build-Seite heruntergeladen werden.

### Lokaler Build (falls konfiguriert)

```bash
# Lokaler Build (benötigt Android Studio)
npm run build:android:local
```

## 📤 App Bundle hochladen

### Option 1: Automatisch mit EAS Submit (empfohlen)

```bash
# App Bundle automatisch zur Play Console hochladen
eas submit --platform android
```

**Voraussetzungen:**
- EAS CLI installiert: `npm install -g eas-cli`
- Bei EAS angemeldet: `eas login`
- Google Play Service Account konfiguriert

### Option 2: Manuell über Play Console

1. **App Bundle herunterladen**
   - Von EAS Build-Seite: https://expo.dev/accounts/[your-account]/builds
   - Oder aus dem `app-bundles/` Verzeichnis, falls lokal erstellt

2. **Zur Play Console hochladen**
   - Gehen Sie zu: https://play.google.com/console
   - Wählen Sie Ihre App aus
   - Navigieren Sie zu **"Produktion"** → **"Neue Version erstellen"**
   - Laden Sie die `.aab` Datei hoch

3. **Version und Release Notes eingeben**
   - Version: z.B. `1.0.0` (muss höher sein als vorherige Version)
   - Release Notes: Beschreibung der Änderungen

4. **Review und Veröffentlichung**
   - Prüfen Sie alle Angaben
   - Klicken Sie auf **"Review"** → **"Start rollout to Production"**

## 📋 Checkliste vor dem Upload

- [ ] App Bundle wurde erfolgreich erstellt (`.aab` Datei vorhanden)
- [ ] Version in `app.json` wurde erhöht
- [ ] Alle Tests wurden durchgeführt
- [ ] Release Notes sind vorbereitet
- [ ] Google Play Store Beschreibung ist aktuell (siehe `GOOGLE_PLAY_STORE_DESCRIPTION.md`)
- [ ] Screenshots und App-Icon sind hochgeladen
- [ ] Datenschutzerklärung ist verfügbar (falls erforderlich)

## 🔍 App Bundle finden

### Nach EAS Build

1. Gehen Sie zu: https://expo.dev/accounts/[your-account]/builds
2. Klicken Sie auf den erfolgreichen Android Build
3. Laden Sie die `.aab` Datei herunter
4. Speichern Sie sie in `app-bundles/` für Ihre Aufzeichnungen

### Dateiname Format

Typischerweise:
```
app-release-1.0.0-1234567890.aab
```

Oder:
```
spotx-1.0.0.aab
```

## 📝 Wichtige Hinweise

- **App Bundle vs APK**: Google Play Store akzeptiert nur `.aab` Dateien für neue Uploads (seit August 2021)
- **Signing**: EAS signiert automatisch die App Bundles
- **Version**: Die Version muss in `app.json` definiert sein und bei jedem Release erhöht werden
- **Testing**: Testen Sie immer zuerst mit einem Preview Build vor dem Production Build

## 🚨 Troubleshooting

### "App Bundle konnte nicht erstellt werden"
- Prüfen Sie die EAS Build Logs
- Stellen Sie sicher, dass `eas.json` korrekt konfiguriert ist
- Führen Sie `npx expo-doctor` aus

### "Upload zur Play Console fehlgeschlagen"
- Prüfen Sie die Google Play Console für Fehlermeldungen
- Stellen Sie sicher, dass die Version höher ist als die aktuelle
- Prüfen Sie, ob alle erforderlichen Felder ausgefüllt sind

### "App Bundle ist zu groß"
- Optimieren Sie Bilder und Assets
- Verwenden Sie ProGuard/R8 für Code-Optimierung
- Prüfen Sie die Bundle-Größe in der Play Console

## 📚 Weitere Ressourcen

- [EAS Build Dokumentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Hilfe](https://support.google.com/googleplay/android-developer)
- [App Bundle Format](https://developer.android.com/guide/app-bundle)

## 🔗 Verwandte Dateien

- `BUILD.md` - Build-Anleitung
- `GOOGLE_PLAY_STORE_DESCRIPTION.md` - Store-Beschreibung
- `eas.json` - EAS Build-Konfiguration
- `app.json` - App-Konfiguration und Version
