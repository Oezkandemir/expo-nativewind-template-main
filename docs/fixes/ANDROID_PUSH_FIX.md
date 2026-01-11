# Android Push Token Registrierung - Fix

## Problem

Die Android-App versucht, Push-Tokens zu registrieren, aber bekommt einen Netzwerkfehler:

```
LOG  Registering push token at: http://localhost:3000/api/users/push-token
WARN  Error registering push token: [TypeError: Network request failed]
```

**Ursache:** Die App verwendet `localhost:3000`, aber Android-Emulatoren/Geräte können nicht auf `localhost` des Entwicklungsrechners zugreifen.

## Lösung

### Schritt 1: Netzwerk-IP statt localhost verwenden

Die App muss die **Netzwerk-IP** deines Entwicklungsrechners verwenden, nicht `localhost`.

**In der Root `.env` Datei** (nicht in `apps/merchant-portal/.env.local`):

```bash
# Für lokale Entwicklung - verwende deine Netzwerk-IP
EXPO_PUBLIC_API_URL=http://192.168.0.163:3000
```

**Wichtig:**
- Ersetze `192.168.0.163` mit deiner tatsächlichen Netzwerk-IP
- Die IP findest du im Terminal, wenn du `npx expo start` ausführst (siehe "Network: http://192.168.0.163:3000")
- Die Variable muss `EXPO_PUBLIC_API_URL` heißen

### Schritt 2: App neu starten

Nach dem Setzen der Umgebungsvariable:

```bash
# Stoppe die App (Ctrl+C)
# Starte neu mit Cache-Clear
npx expo start --clear
```

### Schritt 3: Android App neu laden

1. Öffne die Android-App
2. Die App sollte jetzt `http://192.168.0.163:3000/api/users/push-token` verwenden
3. Prüfe die Logs - du solltest sehen:
   ```
   LOG  Registering push token at: http://192.168.0.163:3000/api/users/push-token
   ```

## Alternative: Automatische IP-Erkennung

Falls du die IP häufig wechselst, kannst du auch einen Code-Fix verwenden:

Der Code wurde bereits aktualisiert, um Warnungen zu zeigen, wenn `localhost` erkannt wird. Für eine vollständige Lösung setze `EXPO_PUBLIC_API_URL` auf deine Netzwerk-IP.

## Überprüfung

Nach dem Fix solltest du sehen:

✅ **Vorher:**
```
LOG  Registering push token at: http://localhost:3000/api/users/push-token
WARN  Error registering push token: [TypeError: Network request failed]
```

✅ **Nachher:**
```
LOG  Registering push token at: http://192.168.0.163:3000/api/users/push-token
LOG  Push token registered successfully
```

## Für Production

Für Production-Builds setze:

```bash
EXPO_PUBLIC_API_URL=https://deine-merchant-portal-domain.com
```

## Troubleshooting

### "Network request failed" bleibt bestehen

1. Prüfe, ob der Merchant-Portal Server läuft:
   ```bash
   cd apps/merchant-portal
   pnpm run dev
   ```

2. Prüfe, ob die IP korrekt ist:
   - Im Expo Terminal siehst du: `Network: http://192.168.0.163:3000`
   - Verwende genau diese IP in `EXPO_PUBLIC_API_URL`

3. Prüfe Firewall:
   - Stelle sicher, dass Port 3000 nicht blockiert ist
   - Prüfe, ob Android-Emulator/Gerät im gleichen Netzwerk ist

### "Cannot connect to server"

- Stelle sicher, dass der Merchant-Portal Server läuft
- Prüfe, ob die URL korrekt ist (mit `http://` am Anfang)
- Prüfe, ob kein `/` am Ende der URL steht

## Zusammenfassung

1. ✅ Setze `EXPO_PUBLIC_API_URL=http://192.168.0.163:3000` in `.env`
2. ✅ Starte App neu: `npx expo start --clear`
3. ✅ Teste Push-Token-Registrierung
4. ✅ Prüfe Logs für Erfolg
