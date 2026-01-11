# Service Role Key Setup

## Problem

Wenn Sie den Fehler "RLS-Fehler: Service Role Key funktioniert nicht korrekt" erhalten, bedeutet das, dass der `SUPABASE_SERVICE_ROLE_KEY` nicht gesetzt ist.

## Lösung

### Schritt 1: Service Role Key abrufen

1. Öffnen Sie das [Supabase Dashboard](https://supabase.com/dashboard)
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **Settings** → **API**
4. Scrollen Sie zu **Project API keys**
5. Kopieren Sie den **`service_role`** Key (⚠️ NICHT den `anon` Key!)

### Schritt 2: Service Role Key setzen

1. Erstellen Sie eine `.env.local` Datei im `apps/merchant-portal/` Verzeichnis (falls nicht vorhanden)
2. Fügen Sie folgende Zeile hinzu:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Wichtig:** Ersetzen Sie `your-service-role-key-here` mit dem tatsächlichen Service Role Key aus Schritt 1.

### Schritt 3: Beispiel `.env.local` Datei

Ihre `.env.local` Datei sollte so aussehen:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (für Server-seitige Operationen, die RLS umgehen)
# ⚠️ WICHTIG: Niemals an den Client weitergeben!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Base URL für Email-Redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Schritt 4: Dev-Server neu starten

Nach dem Hinzufügen des Service Role Keys müssen Sie den Dev-Server neu starten:

```bash
# Stoppen Sie den aktuellen Server (Ctrl+C)
# Dann starten Sie ihn neu:
npm run dev
```

## Sicherheitshinweise

⚠️ **WICHTIG:**
- Der Service Role Key umgeht alle RLS-Policies
- Verwenden Sie ihn **NUR** für Server-seitige Operationen
- **NIEMALS** den Service Role Key im Client-Code verwenden
- Fügen Sie `.env.local` zu `.gitignore` hinzu (sollte bereits vorhanden sein)
- Teilen Sie den Service Role Key **NIEMALS** öffentlich

## Überprüfung

Nach dem Setzen des Service Role Keys sollten Sie in den Server-Logs sehen:

```
✅ Using service role client (RLS bypassed)
```

Wenn Sie weiterhin Fehler erhalten, überprüfen Sie:
1. Ist der Service Role Key korrekt kopiert? (keine Leerzeichen am Anfang/Ende)
2. Haben Sie den Dev-Server neu gestartet?
3. Ist die `.env.local` Datei im richtigen Verzeichnis? (`apps/merchant-portal/.env.local`)

## Alternative: Ohne Service Role Key

Falls Sie den Service Role Key nicht verwenden möchten, müssen Sie sicherstellen, dass die RLS-Policies so konfiguriert sind, dass sie INSERT-Operationen während der Registrierung erlauben. Dies ist jedoch weniger sicher und wird nicht empfohlen.
