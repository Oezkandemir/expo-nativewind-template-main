# Testdaten-Generierung

Dieses Script generiert verschiedene Merchant-User und Kampagnen für Tests.

## Voraussetzungen

1. **Supabase Service Role Key** (empfohlen, aber nicht zwingend erforderlich)
   - Ohne Service Role Key können Auth-User nicht erstellt werden
   - Merchant-Profile können trotzdem erstellt werden

2. **Umgebungsvariablen setzen** (optional, aber empfohlen):
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```
   
   Oder in einer `.env` Datei im Root-Verzeichnis:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Verwendung

### Mit ts-node:
```bash
npx ts-node scripts/generate-test-data.ts
```

### Mit tsx (schneller):
```bash
npx tsx scripts/generate-test-data.ts
```

### Mit Node.js (wenn kompiliert):
```bash
tsc scripts/generate-test-data.ts
node scripts/generate-test-data.js
```

## Was wird erstellt?

### Merchants (7 Stück)

1. **TechCorp GmbH** (approved)
   - Email: `techcorp@test.com`
   - Password: `TestPassword123!`
   - 3 Kampagnen (2 active, 1 draft)

2. **Fitness Plus** (approved)
   - Email: `fitnessplus@test.com`
   - Password: `TestPassword123!`
   - 3 Kampagnen (2 active, 1 paused)

3. **Fashion Boutique** (approved)
   - Email: `fashionboutique@test.com`
   - Password: `TestPassword123!`
   - 3 Kampagnen (2 active, 1 draft)

4. **Food Delivery Express** (approved)
   - Email: `fooddelivery@test.com`
   - Password: `TestPassword123!`
   - 3 Kampagnen (2 active, 1 completed)

5. **Travel Agency Premium** (approved)
   - Email: `travelagency@test.com`
   - Password: `TestPassword123!`
   - 3 Kampagnen (2 active, 1 draft)

6. **Pending Merchant Co.** (pending)
   - Email: `pendingmerchant@test.com`
   - Password: `TestPassword123!`
   - 1 Kampagne (draft)

7. **Suspended Merchant Ltd.** (suspended)
   - Email: `suspendedmerchant@test.com`
   - Password: `TestPassword123!`
   - 1 Kampagne (cancelled)

### Kampagnen-Übersicht

- **Total**: ~19 Kampagnen
- **Status-Verteilung**:
  - `active`: ~10 Kampagnen
  - `draft`: ~5 Kampagnen
  - `paused`: ~1 Kampagne
  - `completed`: ~1 Kampagne
  - `cancelled`: ~1 Kampagne

- **Content Types**:
  - `image`: Die meisten Kampagnen
  - `video`: Einige Kampagnen
  - `interactive`: Einige Kampagnen

- **Targeting**:
  - Verschiedene Interessen-Kombinationen
  - Altersgruppen-Targeting (optional)
  - Geschlecht-Targeting (optional)

## Test-Szenarien

Mit diesen Testdaten können Sie folgende Szenarien testen:

1. **Approved Merchants**:
   - Login im Merchant Portal
   - Kampagnen erstellen/bearbeiten
   - Dashboard-Funktionalität
   - Kampagnen-Statistiken

2. **Pending Merchants**:
   - Login-Verhalten (sollte eingeschränkt sein)
   - Admin-Freigabe-Prozess

3. **Suspended Merchants**:
   - Login-Verhalten (sollte blockiert sein)
   - Admin-Reaktivierung

4. **Mobile App**:
   - Aktive Kampagnen anzeigen
   - Ad-Views erstellen
   - Rewards vergeben
   - Targeting-Funktionalität

## Wichtige Hinweise

1. **Email-Bestätigung**: 
   - Wenn Auth-User erstellt werden, werden diese automatisch bestätigt (wenn Service Role Key verwendet wird)
   - Ohne Service Role Key müssen Sie die Emails manuell bestätigen

2. **Duplikate**:
   - Das Script prüft auf bestehende Merchants/Kampagnen
   - Bereits existierende Einträge werden übersprungen

3. **RLS (Row Level Security)**:
   - Mit Service Role Key werden RLS-Policies umgangen
   - Ohne Service Role Key können RLS-Fehler auftreten

4. **Passwörter**:
   - Alle Test-User haben das gleiche Passwort: `TestPassword123!`
   - **WICHTIG**: Ändern Sie diese in Produktion!

## Troubleshooting

### Fehler: "RLS policy violation"
- **Lösung**: Setzen Sie `SUPABASE_SERVICE_ROLE_KEY` als Umgebungsvariable

### Fehler: "User already exists"
- **Lösung**: Das ist normal - bestehende User werden übersprungen

### Fehler: "Auth user creation failed"
- **Lösung**: Stellen Sie sicher, dass der Service Role Key korrekt ist
- Merchant-Profile werden trotzdem erstellt (ohne Auth User)

### Fehler: "Column auth_user_id does not exist"
- **Lösung**: Das ist normal - das Script funktioniert auch ohne diese Spalte

## Anpassen der Testdaten

Sie können die Testdaten im Script anpassen:

1. **Neue Merchants hinzufügen**: Bearbeiten Sie `TEST_MERCHANTS` Array
2. **Neue Kampagnen hinzufügen**: Bearbeiten Sie `CAMPAIGN_TEMPLATES` Object
3. **Interessen ändern**: Bearbeiten Sie `INTERESTS` Array

## Nächste Schritte

Nach dem Ausführen des Scripts:

1. **Merchant Portal testen**:
   - Öffnen Sie `http://localhost:3000/login`
   - Loggen Sie sich mit einem der Test-Accounts ein

2. **Mobile App testen**:
   - Starten Sie die App
   - Aktive Kampagnen sollten angezeigt werden

3. **Admin Panel testen**:
   - Merchant-Status ändern
   - Kampagnen freigeben/pausieren

## Support

Bei Problemen:
1. Prüfen Sie die Console-Ausgabe
2. Stellen Sie sicher, dass Supabase erreichbar ist
3. Überprüfen Sie die Umgebungsvariablen
4. Prüfen Sie die Supabase-Logs im Dashboard
