# Admin Dashboard - Merchant-Verwaltung

## Übersicht

Das Admin-Dashboard ermöglicht es Administratoren, alle Merchants zu verwalten, deren Status zu ändern und wichtige Statistiken einzusehen.

## Features

- ✅ **Merchant-Übersicht**: Liste aller registrierten Merchants
- ✅ **Status-Verwaltung**: Merchants genehmigen, sperren oder zurückstellen
- ✅ **Statistiken**: Übersicht über pending, approved und suspended Merchants
- ✅ **Sicherheit**: Nur Administratoren haben Zugriff

## Admin-Zugriff aktivieren

### Methode 1: Über die Web-Oberfläche

1. Melden Sie sich mit dem gewünschten Account an
2. Gehen Sie zu `/admin/make-admin`
3. Klicken Sie auf "Admin-Zugriff aktivieren"
4. Sie werden automatisch zum Admin-Dashboard weitergeleitet

### Methode 2: Über Supabase SQL

```sql
-- Admin-Zugriff für einen User aktivieren
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'admin@example.com';
```

### Methode 3: Über Umgebungsvariable

Setzen Sie `ADMIN_EMAIL` in `.env.local`:

```env
ADMIN_EMAIL=admin@example.com
```

## Verwendung

### Admin-Dashboard öffnen

1. Melden Sie sich als Admin an
2. Gehen Sie zu `/admin`
3. Sie sehen eine Übersicht aller Merchants

### Merchant-Status ändern

1. Im Admin-Dashboard finden Sie alle Merchants in einer Tabelle
2. Klicken Sie auf die entsprechenden Buttons:
   - **Genehmigen**: Setzt Status auf `approved`
   - **Sperren**: Setzt Status auf `suspended`
   - **Zurückstellen**: Setzt Status auf `pending`

### Status-Bedeutungen

- **pending**: Merchant wartet auf Genehmigung (Standard nach Registrierung)
- **approved**: Merchant wurde genehmigt und kann Kampagnen erstellen
- **suspended**: Merchant wurde gesperrt (kann keine Kampagnen erstellen)

## API-Endpunkte

### Merchant-Status aktualisieren

```http
POST /api/admin/merchants/update-status
Content-Type: application/json

{
  "merchantId": "uuid",
  "status": "approved" | "pending" | "suspended"
}
```

## Sicherheit

- Admin-Zugriff wird über `auth.users.raw_user_meta_data.is_admin` geprüft
- RLS-Policies stellen sicher, dass nur Admins alle Merchants sehen können
- Alle Admin-Routen sind durch `requireAdmin()` geschützt

## Dateien

- `/app/admin/page.tsx` - Haupt-Dashboard-Seite
- `/app/admin/layout.tsx` - Admin-Layout mit Schutz
- `/app/admin/components/MerchantActions.tsx` - Action-Buttons für Merchants
- `/lib/auth/admin-helpers.ts` - Admin-Helper-Funktionen
- `/api/admin/merchants/update-status/route.ts` - API-Route für Status-Updates

## Troubleshooting

### "Access denied" Fehler

- Stellen Sie sicher, dass der User Admin-Rechte hat
- Prüfen Sie `auth.users.raw_user_meta_data.is_admin`
- Versuchen Sie, sich neu anzumelden

### Merchants werden nicht angezeigt

- Prüfen Sie die RLS-Policies
- Verwenden Sie die Datenbankfunktion `get_all_merchants_for_admin()` als Fallback
- Prüfen Sie die Browser-Konsole für Fehler
