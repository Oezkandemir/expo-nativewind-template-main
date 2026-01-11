# EAS Access Token Setup für APNs Credentials

## Schnell-Setup mit Access Token

Du hast einen EAS Access Token: `KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d`

### Schritt 1: Token als Umgebungsvariable setzen

```bash
export EXPO_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"
export EAS_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"
```

### Schritt 2: EAS CLI installieren (falls nicht vorhanden)

```bash
npm install -g eas-cli
```

### Schritt 3: Authentifizierung prüfen

```bash
eas whoami
```

Du solltest deinen Account sehen. Falls nicht, versuche:

```bash
echo "KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d" | eas login
```

### Schritt 4: APNs Credentials automatisch einrichten

```bash
eas credentials
```

**Wähle in den Prompts:**

1. **Platform:** `iOS` (drücke `i`)
2. **Build Profile:** 
   - `production` (drücke `p`) - für Production Builds
   - ODER `preview` (für Tests auf echten Geräten)
   - ⚠️ **NICHT** `development` wählen - das funktioniert nicht für Push Notifications!
3. **Action:** `Push Notifications: Set up`
4. **Option:** `Generate new APNs Key` (empfohlen) - EAS generiert dann automatisch alles

### Schritt 5: Neuen Build erstellen

Nach erfolgreichem Setup der Credentials:

```bash
# Für Production
eas build --platform ios --profile production

# ODER für Preview (Test auf echten Geräten)
eas build --platform ios --profile preview
```

### Schritt 6: Build installieren und testen

1. Warte bis der Build fertig ist
2. Installiere den Build auf deinem iOS-Gerät
3. Öffne die App und melde dich an
4. Aktiviere Benachrichtigungen
5. Teste Push-Benachrichtigungen über `/admin/notifications`

## Alternative: Ein-Zeilen-Befehl

Du kannst auch alles in einem Befehl machen:

```bash
EXPO_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d" EAS_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d" eas credentials
```

Dann wähle:
- iOS → production/preview → Push Notifications: Set up → Generate new APNs Key

## Troubleshooting

### Token wird nicht akzeptiert

Falls der Token nicht funktioniert:

1. Prüfe ob der Token korrekt ist
2. Versuche manuell einzuloggen:
   ```bash
   eas login
   ```
   (Dann den Token eingeben wenn gefragt)

### Credentials werden nicht gespeichert

- Stelle sicher, dass du den richtigen Build Profile wählst (production oder preview, NICHT development)
- Prüfe dass du im richtigen Projekt bist (Project ID: `8ddfb1eb-b6c2-44dc-ad88-00e4652e956c`)

### Build schlägt fehl

- Stelle sicher, dass die Credentials erfolgreich hochgeladen wurden
- Prüfe mit: `eas credentials` → iOS → production → Push Notifications: View

## Nach erfolgreichem Setup

✅ Push-Benachrichtigungen sollten jetzt funktionieren!
✅ Die Fehlermeldung "APNs Credentials fehlen" sollte verschwinden
✅ Benachrichtigungen werden erfolgreich an iOS-Geräte gesendet
