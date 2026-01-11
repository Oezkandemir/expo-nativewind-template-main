# 🚀 Deployment-Schritte für Vercel

## Schritt-für-Schritt Anleitung

### 1. Login zu Vercel

```bash
cd apps/merchant-portal
vercel login
```

Wähle: **Email** → `redterminal369@gmail.com`

### 2. Projekt verlinken

```bash
vercel link
```

Antworten:
- **Set up and deploy?** → `Y`
- **Which scope?** → Wähle deinen Account (Özkan)
- **Link to existing project?** → `N` (neues Projekt erstellen)
- **What's your project's name?** → `spotx-merchant-portal` (oder ein anderer Name)
- **In which directory is your code located?** → `./` (Enter drücken)

### 3. Umgebungsvariablen setzen

Nach dem Verlinken setze die Umgebungsvariablen:

```bash
# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Eingabe: https://mxdpiqnkowcxbujgrfom.supabase.co

# Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Eingabe: dein-anon-key-hier

# Service Role Key (optional)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Eingabe: dein-service-role-key-hier
```

### 4. Deployen

```bash
vercel --prod
```

## Schnell-Deployment (wenn bereits verlinkt)

```bash
cd apps/merchant-portal

# Mit Umgebungsvariablen direkt deployen
NEXT_PUBLIC_SUPABASE_URL="https://mxdpiqnkowcxbujgrfom.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key" \
SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key" \
vercel --prod
```

## Prüfen ob verlinkt

```bash
# Prüfe ob .vercel Verzeichnis existiert
ls -la .vercel/

# Zeige Projekt-Info
vercel project ls
```
