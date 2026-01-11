# Scripts

## create-demo-users.ts

Erstellt 15 Demo-User für Testing und Entwicklung.

### Verwendung

```bash
cd apps/merchant-portal
npx tsx scripts/create-demo-users.ts
```

### Umgebungsvariablen

Das Script benötigt folgende Umgebungsvariablen (können auch in `.env.local` gesetzt werden):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase Projekt URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key (für Admin-Operationen)

### Erstellte User

Das Script erstellt 15 Demo-User mit folgenden Daten:
- Namen: Max Mustermann, Anna Schmidt, Tom Weber, etc.
- E-Mails: `{name}@demo.com` Format
- Passwort: `Demo123!@#` (für alle User gleich)

### Features

- Erstellt Auth-User in Supabase Auth
- Erstellt User-Profile in der `users` Tabelle
- Setzt alle notwendigen Felder (Interessen, Demografie, etc.)
- Auto-bestätigt E-Mail-Adressen
- Zeigt Zusammenfassung der erstellten User

### Beispiel-Output

```
🚀 Starting demo user creation...

Creating user: max.mustermann@demo.com...
  ✅ Created: Max Mustermann (max.mustermann@demo.com)
...

==================================================
📊 Summary:
✅ Successfully created: 15 users
❌ Errors: 0

🔑 Default password for all users: Demo123!@#
==================================================
```
