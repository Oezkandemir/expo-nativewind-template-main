# Lösung: P8 File Fehler beim APNs Setup

## Problem

EAS fragt nach einem P8 File, aber die Datei existiert nicht.

## Lösung: Lass EAS automatisch generieren (Empfohlen)

### Option 1: Abbrechen und neu starten mit automatischer Generierung

1. **Drücke `Ctrl+C` um den aktuellen Prozess abzubrechen**

2. **Starte neu:**
   ```bash
   eas credentials
   ```

3. **Wähle:**
   - `iOS`
   - `production` (oder `development`)
   - `Push Notifications: Set up`
   - **WICHTIG:** Wähle `Generate new APNs Key` (NICHT "Upload an APNs Key")
   
   EAS generiert dann automatisch einen neuen Key!

## Option 2: Manuell P8 File erstellen (Falls du einen eigenen Key willst)

Falls du einen eigenen APNs Key erstellen möchtest:

1. **Gehe zu Apple Developer Portal:**
   - https://developer.apple.com/account/resources/authkeys/list
   - Klicke auf `+` (Create a key)

2. **Erstelle einen neuen Key:**
   - Key Name: z.B. "SpotX Push Notifications"
   - ✅ Aktiviere "Apple Push Notifications service (APNs)"
   - Klicke "Continue" → "Register"

3. **Lade den Key herunter:**
   - ⚠️ **WICHTIG:** Du kannst die Datei nur EINMAL herunterladen!
   - Speichere die `.p8` Datei sicher
   - Notiere die **Key ID** (z.B. "ABC123XYZ")
   - Notiere deine **Team ID** (findest du oben rechts im Portal)

4. **In EAS hochladen:**
   ```bash
   eas credentials
   ```
   - Wähle: iOS → production → Push Notifications: Set up
   - Wähle: "Upload an APNs Key (.p8)"
   - Gib den Pfad zur `.p8` Datei ein
   - Gib die Key ID ein
   - Gib die Team ID ein

## Empfehlung

**Verwende Option 1** (automatische Generierung) - das ist einfacher und schneller!

EAS verwaltet dann alles automatisch für dich.

## Nach dem Setup

Nach erfolgreichem Setup der Credentials:

```bash
# Neuen Production Build erstellen
eas build --platform ios --profile production
```

Dann funktionieren Push-Benachrichtigungen! ✅
