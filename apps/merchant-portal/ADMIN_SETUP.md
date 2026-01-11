# Admin Dashboard Setup

## Problem: Admin kann keine Kampagnen sehen

Wenn Sie als Admin eingeloggt sind, aber keine Kampagnen im Admin Dashboard sehen, liegt das wahrscheinlich daran, dass Ihr Admin-User nicht die richtigen Metadata hat.

## Lösung: Admin-User konfigurieren

### Schritt 1: Admin-User erstellen oder bestehenden User als Admin markieren

#### Option A: Über Supabase Dashboard

1. Öffnen Sie das Supabase Dashboard
2. Gehen Sie zu **Authentication** → **Users**
3. Finden Sie Ihren Admin-User (oder erstellen Sie einen neuen)
4. Klicken Sie auf den User, um die Details zu öffnen
5. Scrollen Sie zu **User Metadata**
6. Fügen Sie folgende Metadata hinzu:

```json
{
  "is_admin": true,
  "role": "admin"
}
```

Oder klicken Sie auf **Raw User Meta Data** und fügen Sie hinzu:
```json
{
  "is_admin": true
}
```

#### Option B: Über SQL (für bestehende User)

```sql
-- Setzen Sie die Email Ihres Admin-Users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'ihre-admin-email@example.com';

-- Oder setzen Sie die role:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'ihre-admin-email@example.com';
```

### Schritt 2: RLS Policies prüfen

Die RLS Policies sollten bereits vorhanden sein. Sie können sie mit folgendem SQL prüfen:

```sql
-- Prüfe alle Admin-Policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
```

Sie sollten folgende Policies sehen:
- `Admins can view all campaigns` (SELECT auf campaigns)
- `Admins can update all campaigns` (UPDATE auf campaigns)
- `Admins can delete all campaigns` (DELETE auf campaigns)
- `Admins can view all merchants` (SELECT auf merchants)
- `Admins can update all merchants` (UPDATE auf merchants)

### Schritt 3: Admin-Funktion prüfen

Die Admin-Check-Funktion sollte vorhanden sein:

```sql
-- Prüfe ob die Funktion existiert
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'is_admin_user';
```

### Schritt 4: Testen

1. Loggen Sie sich im Merchant Portal als Admin ein
2. Gehen Sie zu `/admin/campaigns`
3. Sie sollten jetzt alle Kampagnen sehen können

## Troubleshooting

### Problem: Admin sieht immer noch keine Kampagnen

**Lösung 1: Prüfen Sie die User Metadata**
```sql
-- Prüfen Sie Ihre User Metadata
SELECT 
  email,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users
WHERE email = 'ihre-admin-email@example.com';
```

Stellen Sie sicher, dass `raw_user_meta_data->>'is_admin'` = `'true'` ist.

**Lösung 2: Verwenden Sie Service Role Key**

Falls die RLS-Policies nicht funktionieren, können Sie das Admin-Dashboard so anpassen, dass es den Service Role Key verwendet:

1. Fügen Sie `SUPABASE_SERVICE_ROLE_KEY` zu Ihrer `.env.local` hinzu
2. Verwenden Sie `createServiceRoleClient()` statt `createClient()` im Admin-Dashboard

**Lösung 3: Prüfen Sie die Browser-Konsole**

Öffnen Sie die Browser-Konsole (F12) und prüfen Sie auf Fehler. Möglicherweise gibt es einen RLS-Fehler, der Ihnen mehr Informationen gibt.

### Problem: "Zugriff verweigert" Fehler

Wenn Sie einen "Zugriff verweigert" Fehler sehen, bedeutet das, dass `isAdmin()` false zurückgibt.

**Lösung:**
1. Prüfen Sie, ob Ihre Email in `NEXT_PUBLIC_ADMIN_EMAIL` oder `ADMIN_EMAIL` gesetzt ist
2. Oder stellen Sie sicher, dass Ihre User Metadata `is_admin: true` enthält

### Problem: Admin kann Merchants sehen, aber keine Kampagnen

**Lösung:**
Dies könnte bedeuten, dass die Admin-Policy für campaigns nicht richtig funktioniert. Prüfen Sie:

```sql
-- Prüfe ob die Policy existiert
SELECT * FROM pg_policies 
WHERE tablename = 'campaigns' 
AND policyname = 'Admins can view all campaigns';
```

Falls die Policy fehlt, führen Sie die Migration erneut aus:

```sql
-- Erstelle die Admin-Policy für campaigns
CREATE POLICY "Admins can view all campaigns" ON campaigns
  FOR SELECT
  USING (is_admin_user());
```

## Admin-Email Alternative

Falls Sie keine User Metadata setzen können, können Sie auch die Admin-Email in der Umgebungsvariable setzen:

```env
# In .env.local
NEXT_PUBLIC_ADMIN_EMAIL=ihre-admin-email@example.com
ADMIN_EMAIL=ihre-admin-email@example.com
```

Die `isAdmin()` Funktion prüft auch diese Umgebungsvariablen, aber die RLS-Policies können sie nicht direkt verwenden. Daher ist es besser, die User Metadata zu verwenden.

## Zusammenfassung

1. ✅ Setzen Sie `is_admin: true` in den User Metadata Ihres Admin-Users
2. ✅ Stellen Sie sicher, dass die RLS-Policies vorhanden sind
3. ✅ Testen Sie den Zugriff im Admin Dashboard
4. ✅ Falls es nicht funktioniert, verwenden Sie den Service Role Key als Fallback

## Nächste Schritte

Nachdem Sie den Admin-User konfiguriert haben, sollten Sie:
- Alle Kampagnen im Admin Dashboard sehen können
- Alle Merchants sehen können
- Merchant-Status ändern können
- Kampagnen verwalten können
