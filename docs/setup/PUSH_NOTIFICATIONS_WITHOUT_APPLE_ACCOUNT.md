# Push Notifications ohne Apple Developer Account

## Problem

Du hast keinen bezahlten Apple Developer Account ($99/Jahr), aber möchtest Push-Benachrichtigungen verwenden.

## Lösung: 3 Optionen

### ✅ Option 1: Expo Go verwenden (Empfohlen für Development)

**Expo Go** verwaltet Push-Benachrichtigungen automatisch - **keine Credentials nötig!**

#### Vorteile:
- ✅ Kein Apple Developer Account nötig
- ✅ Keine APNs Credentials nötig
- ✅ Funktioniert sofort
- ✅ Perfekt für Development und Testing

#### Nachteile:
- ❌ Nur für Development/Testing
- ❌ Nicht für Production/App Store
- ❌ User müssen Expo Go App installieren

#### Setup:

1. **Expo Go App installieren:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Development Server starten:**
   ```bash
   npx expo start
   ```

3. **QR-Code scannen** mit Expo Go App

4. **Push-Benachrichtigungen funktionieren automatisch!**

Die App registriert automatisch Push-Tokens und das Backend kann Benachrichtigungen senden.

---

### ✅ Option 2: Lokale Notifications verwenden (Bereits implementiert!)

Die App unterstützt bereits **lokale Notifications**, die **ohne Credentials** funktionieren.

#### Vorteile:
- ✅ Kein Apple Developer Account nötig
- ✅ Keine APNs Credentials nötig
- ✅ Funktioniert in allen Builds (Development, Production)
- ✅ Funktioniert auch wenn App geschlossen ist

#### Nachteile:
- ❌ Werden von der App selbst geplant (nicht vom Server)
- ❌ Können nicht spontan vom Backend gesendet werden

#### Wie es funktioniert:

Die App plant automatisch lokale Notifications für:
- Tägliche Kampagnen-Erinnerungen
- Geplante Benachrichtigungen

Diese funktionieren **ohne jegliche Credentials**!

#### Testen:

1. App öffnen
2. Benachrichtigungen aktivieren
3. Lokale Notifications werden automatisch geplant

---

### ⚠️ Option 3: Apple Developer Account kaufen (Für Production)

Falls du die App im **App Store** veröffentlichen möchtest und **Remote Push-Benachrichtigungen** vom Backend brauchst:

#### Kosten:
- $99/Jahr für Apple Developer Program

#### Dann:
1. Account kaufen: https://developer.apple.com/programs/
2. APNs Credentials einrichten (siehe `APNS_CREDENTIALS_SETUP.md`)
3. Production Build erstellen

---

## Empfohlener Workflow

### Für Development/Testing:
1. **Expo Go verwenden** → Push-Benachrichtigungen funktionieren sofort
2. **Lokale Notifications** für geplante Erinnerungen

### Für Production (ohne Apple Account):
1. **Nur lokale Notifications** verwenden
2. Backend kann keine spontanen Push-Benachrichtigungen senden
3. User erhalten geplante Erinnerungen von der App selbst

### Für Production (mit Apple Account):
1. Apple Developer Account kaufen
2. APNs Credentials einrichten
3. Production Build erstellen
4. Remote Push-Benachrichtigungen funktionieren vollständig

---

## Aktueller Status

Die App ist bereits so konfiguriert, dass:
- ✅ Lokale Notifications funktionieren (ohne Credentials)
- ✅ Push-Token-Registrierung funktioniert (in Expo Go)
- ⚠️ Remote Push vom Backend benötigt APNs Credentials (nur mit Apple Account)

## Code-Anpassung (Optional)

Falls du **nur lokale Notifications** verwenden möchtest und die Fehler im Backend vermeiden willst, kannst du die Push-Token-Registrierung deaktivieren:

**In `lib/notifications/notification-service.ts`:**

Die App versucht bereits, Push-Tokens zu holen, aber fällt graceful zurück wenn es nicht funktioniert. Das ist bereits optimal konfiguriert!

---

## Zusammenfassung

| Option | Apple Account nötig? | Remote Push? | Lokale Notifications? |
|--------|---------------------|--------------|----------------------|
| **Expo Go** | ❌ Nein | ✅ Ja | ✅ Ja |
| **Lokale Notifications** | ❌ Nein | ❌ Nein | ✅ Ja |
| **Production Build** | ✅ Ja ($99/Jahr) | ✅ Ja | ✅ Ja |

**Empfehlung:** Verwende **Expo Go für Development** und **lokale Notifications für Production** (falls kein Apple Account vorhanden).
