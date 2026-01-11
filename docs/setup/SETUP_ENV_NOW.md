# ⚡ Schnell-Setup: EXPO_PUBLIC_API_URL konfigurieren

## Problem

Die Android-App verwendet `localhost:3000`, aber Android-Emulatoren/Geräte können nicht auf `localhost` des Entwicklungsrechners zugreifen.

**Fehler:**
```
WARN  ⚠️  localhost detected in API_URL. Mobile devices need network IP.
WARN     Current API_URL: http://localhost:3000
WARN  Error registering push token: [TypeError: Network request failed]
```

## Lösung (2 Minuten)

### Schritt 1: .env Datei erstellen/aktualisieren

**Im Root-Verzeichnis** (nicht in `apps/merchant-portal`):

```bash
cd /Users/dmr/Desktop/expo-nativewind-template-main
```

Erstelle oder bearbeite die `.env` Datei:

```bash
# Öffne die .env Datei im Editor
nano .env
# oder
code .env
```

Füge diese Zeile hinzu (oder aktualisiere, falls bereits vorhanden):

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.163:3000
```

**Wichtig:**
- Ersetze `192.168.0.163` mit deiner tatsächlichen Netzwerk-IP
- Die IP findest du im Expo Terminal: `Network: http://192.168.0.163:3000`
- Die Variable muss `EXPO_PUBLIC_API_URL` heißen (mit `EXPO_PUBLIC_` Präfix!)

### Schritt 2: App komplett neu starten

**WICHTIG:** Die App muss komplett neu gestartet werden, damit die Umgebungsvariable geladen wird!

```bash
# 1. Stoppe die laufende App (Ctrl+C im Expo Terminal)

# 2. Lösche den Cache
npx expo start --clear

# 3. Oder noch besser - komplett neu starten:
#    - Stoppe Expo (Ctrl+C)
#    - Warte 2 Sekunden
#    - Starte neu: npx expo start --clear
```

### Schritt 3: Android App neu laden

1. Öffne die Android-App im Emulator/Gerät
2. Die App sollte jetzt die Netzwerk-IP verwenden
3. Prüfe die Logs - du solltest sehen:
   ```
   LOG  Registering push token at: http://192.168.0.163:3000/api/users/push-token
   ```

## Überprüfung

Nach dem Setup solltest du sehen:

✅ **Vorher:**
```
WARN  ⚠️  localhost detected in API_URL
WARN     Current API_URL: http://localhost:3000
WARN  Error registering push token: [TypeError: Network request failed]
```

✅ **Nachher:**
```
LOG  Registering push token at: http://192.168.0.163:3000/api/users/push-token
LOG  Push token registered successfully
```

## Automatisches Script

Falls du es automatisch machen möchtest:

```bash
# Setze die Umgebungsvariable automatisch
echo "EXPO_PUBLIC_API_URL=http://192.168.0.163:3000" >> .env

# Prüfe ob es gesetzt wurde
grep EXPO_PUBLIC_API_URL .env
```

## Troubleshooting

### "localhost wird immer noch verwendet"

1. **Prüfe ob die Variable gesetzt ist:**
   ```bash
   grep EXPO_PUBLIC_API_URL .env
   ```

2. **Stelle sicher, dass die App komplett neu gestartet wurde:**
   - Stoppe Expo komplett (Ctrl+C)
   - Warte 2-3 Sekunden
   - Starte neu mit `npx expo start --clear`

3. **Prüfe ob die Variable korrekt heißt:**
   - Muss `EXPO_PUBLIC_API_URL` sein (nicht `EXPO_API_URL` oder ähnlich)
   - Muss im **Root-Verzeichnis** sein (nicht in `apps/merchant-portal`)

### "Network request failed" bleibt bestehen

1. **Prüfe ob Merchant Portal läuft:**
   ```bash
   cd apps/merchant-portal
   pnpm run dev
   ```
   Du solltest sehen: `Network: http://192.168.0.163:3000`

2. **Prüfe ob die IP korrekt ist:**
   - Verwende genau die IP, die im Expo Terminal angezeigt wird
   - Prüfe, ob kein `/` am Ende steht

3. **Prüfe Firewall:**
   - Stelle sicher, dass Port 3000 nicht blockiert ist
   - Prüfe, ob Android-Emulator/Gerät im gleichen Netzwerk ist

## Für Production

Für Production-Builds setze:

```bash
EXPO_PUBLIC_API_URL=https://deine-merchant-portal-domain.com
```

## Zusammenfassung

1. ✅ `.env` Datei im Root erstellen/bearbeiten
2. ✅ `EXPO_PUBLIC_API_URL=http://192.168.0.163:3000` hinzufügen
3. ✅ App komplett neu starten: `npx expo start --clear`
4. ✅ Android App neu laden
5. ✅ Logs prüfen - sollte jetzt Netzwerk-IP verwenden
