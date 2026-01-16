# 🔧 iOS Push Notifications Setup - Fehlerbehebung

## Problem

```
✖ Failed to create Apple push key
Apple provided the following error info:
No value was provided for the parameter 'scope'.
```

## ✅ Lösung 1: Push Notifications vorerst überspringen (Empfohlen)

Du kannst den Build auch ohne Push Notifications erstellen und sie später einrichten.

### Schritt 1: Credentials Setup erneut starten

```bash
eas credentials -p ios
```

**Wähle:**
1. Platform: `iOS` (Enter)
2. Build Profile: `production` (Enter)
3. Action: `Use existing credentials` oder `Set up new credentials` (Enter)
4. **WICHTIG:** Wenn gefragt "Would you like to set up Push Notifications?" → **Wähle `No`**

### Schritt 2: Build erstellen

Nach erfolgreichem Credentials-Setup:

```bash
npm run build:production:ios
```

Die App funktioniert ohne Push Notifications. Du kannst sie später einrichten.

---

## ✅ Lösung 2: Manuell APNs Key erstellen und hochladen

### Schritt 1: APNs Key im Apple Developer Portal erstellen

1. **Gehe zu Apple Developer Portal:**
   https://developer.apple.com/account/resources/authkeys/list

2. **Erstelle neuen Key:**
   - Klicke auf `+` (Create a key)
   - Key Name: z.B. "SpotX Push Notifications"
   - ✅ Aktiviere "Apple Push Notifications service (APNs)"
   - Klicke "Continue" → "Register"

3. **Key herunterladen:**
   - ⚠️ **WICHTIG:** Du kannst die Datei nur EINMAL herunterladen!
   - Klicke "Download" und speichere die `.p8` Datei sicher
   - Notiere die **Key ID** (z.B. "ABC123XYZ")
   - Notiere deine **Team ID** (findest du oben rechts im Portal, z.B. "PV2FX8H2XR")

### Schritt 2: APNs Key in EAS hochladen

```bash
eas credentials -p ios
```

**Wähle:**
1. Platform: `iOS` (Enter)
2. Build Profile: `production` (Enter)
3. Action: `Push Notifications: Set up` (Enter)
4. Option: `Upload an APNs Key (.p8)` (Enter)
5. Gib den Pfad zur `.p8` Datei ein
6. Gib die Key ID ein
7. Gib die Team ID ein (z.B. "PV2FX8H2XR")

### Schritt 3: Build erstellen

```bash
npm run build:production:ios
```

---

## ✅ Lösung 3: EAS CLI aktualisieren

Der Fehler könnte durch eine veraltete EAS CLI Version verursacht werden:

```bash
npm install -g eas-cli@latest
```

Dann erneut versuchen:

```bash
eas credentials -p ios
```

---

## 🎯 Empfehlung

**Für jetzt:** Verwende **Lösung 1** (Push Notifications überspringen), um den Build schnell zu erstellen.

**Später:** Richte Push Notifications mit **Lösung 2** (manuell) ein, wenn du sie brauchst.

---

## 📝 Notizen

- **Deine Team ID:** PV2FX8H2XR
- **Bundle ID:** com.exponativewindtemplate.app
- **Apple Team:** Buelent Tepe (Individual)

---

## ✅ Nach erfolgreichem Setup

Nach dem Credentials-Setup (mit oder ohne Push Notifications):

```bash
npm run build:production:ios
```

Der Build sollte jetzt erfolgreich sein! 🚀
