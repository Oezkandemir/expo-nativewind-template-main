# 📋 Mapping-Datei für Google Play Console

## Was ist eine Mapping-Datei?

Die `mapping.txt` Datei wird von R8/ProGuard generiert und enthält die Zuordnung zwischen:
- **Obfuskiertem Code** (wie er in der App ist) → `a.b.c.d()`
- **Original Code** (wie du ihn geschrieben hast) → `com.exponativewindtemplate.app.MainActivity.onCreate()`

**Warum ist sie wichtig?**
- Ohne mapping.txt sind Crash-Reports unlesbar (nur obfuskierte Namen)
- Mit mapping.txt kann Google Play Console Crash-Reports automatisch deobfuscaten
- Erleichtert die Fehlersuche erheblich

## ⚠️ Aktuelle Situation

**ProGuard Status:** Deaktiviert (`android.enableProguardInReleaseBuilds=false`)

**Aber:** EAS Build könnte trotzdem R8 verwenden, daher die Warnung.

## 📍 Wo finde ich die mapping.txt?

### Bei EAS Build (Cloud Build)

Die mapping.txt wird **nicht automatisch** mit dem AAB hochgeladen. Du musst sie manuell herunterladen:

1. **Nach dem Build:**
   - Gehe zu: https://expo.dev/accounts/demiroo/projects/spotx/builds
   - Öffne den Build (z.B. VersionCode 8)
   - Scrolle nach unten zu "Artifacts"
   - Suche nach `mapping.txt` oder `app-mapping.txt`
   - Lade sie herunter

2. **Falls nicht verfügbar:**
   - EAS Build speichert mapping.txt nicht immer automatisch
   - Du musst sie lokal generieren (siehe unten)

### Bei lokalem Build

```bash
# Nach dem Build findest du die mapping.txt hier:
android/app/build/outputs/mapping/release/mapping.txt
```

## 📤 Mapping-Datei in Play Console hochladen

### Methode 1: Über Play Console Web-Interface

1. Gehe zu: https://play.google.com/console
2. Wähle deine App: **spotx**
3. Gehe zu: **Release** → **Production** (oder Testing)
4. Klicke auf den Release (z.B. VersionCode 7 oder 8)
5. Scrolle nach unten zu **"App-Bundle-Details"**
6. Klicke auf **"Offenlegungsdatei hochladen"** oder **"Upload mapping file"**
7. Wähle deine `mapping.txt` Datei
8. Klicke auf **"Hochladen"**

### Methode 2: Über Google Play Console API

```bash
# Mit fastlane (falls installiert)
fastlane supply \
  --mapping "path/to/mapping.txt" \
  --package_name "com.exponativewindtemplate.app" \
  --version_code 8
```

## 🔧 Mapping-Datei für EAS Build generieren

Falls EAS Build die mapping.txt nicht bereitstellt, kannst du sie lokal generieren:

### Option 1: Lokaler Build (nur für mapping.txt)

```bash
# 1. ProGuard aktivieren (temporär)
# In android/gradle.properties:
android.enableProguardInReleaseBuilds=true

# 2. Lokalen Release Build erstellen
cd android
./gradlew :app:assembleRelease

# 3. mapping.txt finden
# Die Datei liegt hier:
# android/app/build/outputs/mapping/release/mapping.txt

# 4. ProGuard wieder deaktivieren (falls gewünscht)
# android.enableProguardInReleaseBuilds=false
```

### Option 2: EAS Build mit lokalem Build

```bash
# EAS Build mit lokalem Build (generiert mapping.txt)
eas build --platform android --profile production --local
```

## ✅ Checkliste für jeden Release

- [ ] AAB-Datei hochgeladen
- [ ] mapping.txt heruntergeladen (von EAS Build oder lokal generiert)
- [ ] mapping.txt in Play Console hochgeladen
- [ ] VersionCode dokumentiert (für spätere Crash-Analysen)

## 🎯 Für VersionCode 8 (aktueller Build)

1. **Nach dem Build:**
   ```bash
   # Prüfe ob mapping.txt verfügbar ist
   # Falls nicht, generiere sie lokal (siehe oben)
   ```

2. **In Play Console:**
   - Gehe zu Release → Production
   - Wähle VersionCode 8
   - Lade mapping.txt hoch

## 📝 Wichtige Hinweise

1. **Jede Version braucht ihre eigene mapping.txt**
   - VersionCode 7 → mapping.txt für VersionCode 7
   - VersionCode 8 → mapping.txt für VersionCode 8
   - **NICHT vermischen!**

2. **Mapping-Datei aufbewahren**
   - Speichere jede mapping.txt für spätere Crash-Analysen
   - Benenne sie z.B.: `mapping-v7.txt`, `mapping-v8.txt`

3. **Ohne mapping.txt:**
   - Crash-Reports sind schwer lesbar
   - Fehlersuche dauert länger
   - Aber die App funktioniert trotzdem!

## 🔍 Prüfen ob mapping.txt hochgeladen wurde

1. Gehe zu Play Console → Release → Production
2. Wähle deinen Release
3. Prüfe ob "Offenlegungsdatei" oder "Mapping file" angezeigt wird
4. Wenn ja → ✅ Erfolgreich hochgeladen
5. Wenn nein → ⚠️ Noch hochladen

## 🚨 Aktueller Status

- **VersionCode 7:** ⚠️ Keine mapping.txt hochgeladen (Warnung erhalten)
- **VersionCode 8:** ⏳ Noch nicht gebaut → mapping.txt nach Build hochladen

## 💡 Empfehlung

Da ProGuard aktuell deaktiviert ist, ist die mapping.txt **optional**, aber:
- Google Play Console empfiehlt sie trotzdem
- Falls du später ProGuard aktivierst, brauchst du sie definitiv
- Besser jetzt schon hochladen (auch wenn leer/minimal)
