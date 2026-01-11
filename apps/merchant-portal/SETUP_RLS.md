# RLS Setup für Campaigns

## Problem

Wenn Sie einen 500-Fehler beim Erstellen von Kampagnen erhalten, liegt das wahrscheinlich daran, dass die Row Level Security (RLS) Policies für die `campaigns` Tabelle nicht richtig konfiguriert sind.

## Lösung

Führen Sie das SQL-Script aus, um die RLS-Policies einzurichten:

```bash
# In Supabase Dashboard: SQL Editor
# Oder mit psql:
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f scripts/setup-campaigns-rls.sql
```

## Was das Script macht

1. Aktiviert RLS auf der `campaigns` Tabelle
2. Erstellt Policies für INSERT, SELECT, UPDATE, DELETE
3. Erlaubt Merchants, nur ihre eigenen Kampagnen zu verwalten
4. Erlaubt App-Usern, aktive Kampagnen zu sehen

## Alternative: Service Role Key

Falls Sie die RLS-Policies nicht einrichten können, können Sie einen Service Role Key verwenden:

1. Holen Sie sich den Service Role Key aus dem Supabase Dashboard (Settings → API)
2. Fügen Sie ihn zu Ihrer `.env.local` hinzu:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**WICHTIG:** Der Service Role Key umgeht RLS komplett. Verwenden Sie ihn nur für Server-seitige Operationen und stellen Sie sicher, dass er niemals im Client-Code landet!

## Überprüfung

Nach dem Ausführen des Scripts sollten Sie in der Lage sein, Kampagnen zu erstellen. Die API-Route versucht zuerst, die Kampagne mit RLS zu erstellen, und fällt auf den Service Role Key zurück, falls RLS blockiert.
