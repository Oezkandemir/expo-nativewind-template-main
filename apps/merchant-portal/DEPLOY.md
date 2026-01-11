# 🚀 Vercel Deployment Guide

## Schnelles Deployment mit Umgebungsvariablen

### Option 1: Automatisches Script (Empfohlen)

```bash
# Vom Root-Verzeichnis aus:
cd apps/merchant-portal

# Stelle sicher, dass .env.local existiert mit deinen Werten
# Dann führe aus:
./deploy.sh production
```

### Option 2: Manuell mit Vercel CLI

#### 1. Vercel CLI installieren

```bash
npm install -g vercel
```

#### 2. Login zu Vercel

```bash
vercel login
```

#### 3. Umgebungsvariablen setzen

```bash
cd apps/merchant-portal

# Setze Umgebungsvariablen für Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Füge dann den Wert ein: https://mxdpiqnkowcxbujgrfom.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Füge dann deinen Anon Key ein

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Füge dann deinen Service Role Key ein (optional, für Admin-Funktionen)
```

#### 4. Deployen

```bash
# Production Deployment
vercel --prod

# Oder Preview Deployment
vercel
```

### Option 3: Mit Umgebungsvariablen direkt im Terminal

```bash
cd apps/merchant-portal

# Setze Umgebungsvariablen als Environment Variables
export NEXT_PUBLIC_SUPABASE_URL="https://mxdpiqnkowcxbujgrfom.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key-hier"
export SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key-hier"

# Deploye mit Vercel CLI
vercel --prod \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
```

### Option 4: Einzeiliger Befehl mit Inline-Variablen

```bash
cd apps/merchant-portal && \
NEXT_PUBLIC_SUPABASE_URL="https://mxdpiqnkowcxbujgrfom.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key" \
SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key" \
vercel --prod
```

## 📝 Benötigte Umgebungsvariablen

| Variable | Beschreibung | Erforderlich |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt URL | ✅ Ja |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | ✅ Ja |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key für Admin-Funktionen | ⚠️ Optional |
| `NEXT_PUBLIC_BASE_URL` | Production URL (wird nach Deployment gesetzt) | ⚠️ Optional |

## 🔍 Umgebungsvariablen prüfen

```bash
# Zeige alle gesetzten Umgebungsvariablen
vercel env ls

# Zeige eine spezifische Variable
vercel env ls NEXT_PUBLIC_SUPABASE_URL
```

## 🐛 Troubleshooting

### "404: NOT_FOUND" Fehler

1. Stelle sicher, dass das Root-Verzeichnis in Vercel auf `apps/merchant-portal` gesetzt ist
2. Oder verwende die Root `vercel.json` die das automatisch konfiguriert

### Umgebungsvariablen werden nicht geladen

1. Prüfe ob die Variablen in Vercel gesetzt sind: `vercel env ls`
2. Stelle sicher, dass sie für `production` gesetzt sind
3. Starte einen neuen Deployment nach dem Setzen der Variablen

### Build schlägt fehl

1. Prüfe die Build-Logs in Vercel
2. Stelle sicher, dass alle Dependencies installiert werden können
3. Prüfe ob `package.json` korrekt ist

## 📚 Weitere Ressourcen

- [Vercel CLI Dokumentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
