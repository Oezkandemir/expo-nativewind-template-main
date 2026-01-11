# 🔧 google-services.json für EAS Builds einrichten

## Problem

Der Build schlägt fehl mit:
```
File google-services.json is missing.
The Google Services Plugin cannot function without it.
```

## Lösung: google-services.json als EAS Secret hochladen

### Schritt 1: google-services.json von Firebase herunterladen

1. **Gehe zu Firebase Console:**
   - https://console.firebase.google.com/
   - Wähle Projekt: **spotx-52cc3**

2. **Öffne Project Settings:**
   - Klicke auf **⚙️ Zahnrad** (oben links) → **Project Settings**

3. **Gehe zum Tab "General":**
   - Scroll nach unten zu **"Your apps"**
   - Falls keine Android App vorhanden ist:
     - Klicke auf **"Add app"** → **Android**
     - Package Name: `com.exponativewindtemplate.app`
     - App Nickname: `SpotX` (optional)
     - Klicke auf **"Register app"**
   
4. **google-services.json herunterladen:**
   - Nach dem Hinzufügen der App siehst du **"Download google-services.json"**
   - Klicke darauf und speichere die Datei
   - **WICHTIG:** Speichere sie im **Projekt-Root** (neben `app.json`)

### Schritt 2: google-services.json als EAS Secret hochladen

```bash
# Stelle sicher, dass du im Projekt-Root bist
cd /Users/dmr/Desktop/expo-nativewind-template-main

# Lade google-services.json als EAS Secret hoch
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

**Hinweis:** Falls die Datei noch nicht existiert, lade sie zuerst von Firebase herunter (Schritt 1).

### Schritt 3: app.json konfigurieren (Optional)

Falls du `app.config.js` verwendest, kannst du die Datei dynamisch laden:

```javascript
// app.config.js
export default {
  expo: {
    // ... andere Konfigurationen
    android: {
      // ... andere Android Konfigurationen
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
  },
};
```

**Für `app.json`:** EAS verwendet automatisch das Secret, wenn es hochgeladen ist. Du musst nichts ändern!

### Schritt 4: Neuen Build erstellen

Nach dem Hochladen des Secrets:

```bash
eas build --platform android --profile production
```

## ✅ Überprüfung

Nach erfolgreichem Setup:

1. ✅ `google-services.json` existiert lokal (im Projekt-Root)
2. ✅ `google-services.json` ist in `.gitignore` (Sicherheit)
3. ✅ `GOOGLE_SERVICES_JSON` Secret ist in EAS hochgeladen
4. ✅ Build sollte jetzt funktionieren!

## 🐛 Troubleshooting

### "File google-services.json is missing"

**Lösung:**
- Stelle sicher, dass die Datei von Firebase heruntergeladen wurde
- Stelle sicher, dass sie im Projekt-Root liegt (neben `app.json`)
- Stelle sicher, dass sie als EAS Secret hochgeladen wurde

### "Secret not found"

**Lösung:**
```bash
# Prüfe ob das Secret existiert
eas secret:list

# Falls nicht, lade es hoch:
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

### "Invalid package name"

**Lösung:**
- Stelle sicher, dass der Package Name in Firebase Console genau `com.exponativewindtemplate.app` ist
- Prüfe `app.json` → `android.package` sollte `com.exponativewindtemplate.app` sein

## 📋 Checkliste

- [ ] `google-services.json` von Firebase heruntergeladen
- [ ] Datei im Projekt-Root gespeichert (neben `app.json`)
- [ ] Datei zu `.gitignore` hinzugefügt (bereits erledigt ✅)
- [ ] Als EAS Secret hochgeladen: `GOOGLE_SERVICES_JSON`
- [ ] Neuer Build erstellt
- [ ] Build erfolgreich! ✅

## 🔗 Weitere Informationen

- **Firebase Console:** https://console.firebase.google.com/
- **EAS Secrets Dokumentation:** https://docs.expo.dev/eas/environment-variables/
- **Firebase Setup:** Siehe `FIREBASE_ANDROID_SETUP.md`
