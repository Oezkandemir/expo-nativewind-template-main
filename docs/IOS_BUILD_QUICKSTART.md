# ⚡ iOS Production Build - Quick Start

**Privacy Policy URL:** ✅ https://www.spotxapp.com/datenschutz

---

## 🚀 SCHNELLSTART (3 Schritte)

### Schritt 1: iOS Credentials einrichten

```bash
eas credentials -p ios
```

**Wähle:**
1. Platform: `iOS` (Enter)
2. Build Profile: `production` (Enter)
3. Action: `Set up new credentials` (Enter)
4. Method: `Automatic` (Enter)
5. Gib deine Apple Developer Account Zugangsdaten ein

⏱️ **Dauer:** 2-5 Minuten

---

### Schritt 2: Production Build erstellen

```bash
npm run build:production:ios
```

⏱️ **Dauer:** 15-30 Minuten

**Du kannst den Fortschritt verfolgen:**
- Im Terminal
- Oder hier: https://expo.dev/accounts/demiroo/projects/spotx/builds

---

### Schritt 3: Zu App Store Connect hochladen

```bash
npm run submit:ios
```

**Wähle:**
1. Build: `Latest build for production profile` (Enter)
2. Gib deine Apple ID ein
3. Falls 2FA: Gib App-Specific Password ein

⏱️ **Dauer:** 5-10 Minuten

---

## ✅ FERTIG!

Nach erfolgreichem Upload:

1. **Gehe zu App Store Connect:**
   https://appstoreconnect.apple.com

2. **Füge Privacy Policy URL hinzu:**
   - App → App Privacy → Privacy Policy URL
   - URL: `https://www.spotxapp.com/datenschutz`

3. **Fülle App Information aus** (falls noch nicht geschehen)

4. **Sende zur Review:**
   - App Store → 1.0 Prepare for Submission
   - Build auswählen → Submit for Review

---

## 📚 DETAILLIERTE ANLEITUNG

Siehe: `docs/IOS_PRODUCTION_BUILD_ANLEITUNG.md`

---

## 🆘 PROBLEME?

### Credentials Problem?
```bash
eas credentials -p ios
# Wähle: production → Set up → Automatic
```

### Build fehlgeschlagen?
```bash
# Prüfe Logs
eas build:list --platform ios
eas build:view [BUILD_ID] --logs
```

### Upload fehlgeschlagen?
- Prüfe Apple ID Zugang
- Falls 2FA: Verwende App-Specific Password
- Prüfe, ob Build erfolgreich war

---

**Viel Erfolg! 🎉**
