# 🚀 Schnelles Vercel Deployment

## Schritt 1: Projekt mit Vercel verlinken

```bash
cd apps/merchant-portal
vercel link
```

Du wirst gefragt:
- **Set up and deploy?** → `Y` (Ja)
- **Which scope?** → Wähle deinen Account
- **Link to existing project?** → `N` (Nein, erstelle neues Projekt)
- **What's your project's name?** → z.B. `spotx-merchant-portal`
- **In which directory is your code located?** → `./` (aktuelles Verzeichnis)

## Schritt 2: Umgebungsvariablen setzen

Nach dem Verlinken kannst du die Umgebungsvariablen setzen:

```bash
# Setze Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Eingabe: https://mxdpiqnkowcxbujgrfom.supabase.co

# Setze Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Eingabe: dein-anon-key-hier

# Setze Service Role Key (optional)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Eingabe: dein-service-role-key-hier
```

## Schritt 3: Deployen

```bash
vercel --prod
```

## Alternative: Alles in einem Schritt

```bash
cd apps/merchant-portal

# 1. Link und erstelle Projekt
vercel link

# 2. Setze Umgebungsvariablen (wird interaktiv abgefragt)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 3. Deploye
vercel --prod
```

## Mit Umgebungsvariablen direkt deployen (ohne env add)

```bash
cd apps/merchant-portal

# Erst verlinken
vercel link

# Dann direkt deployen mit Umgebungsvariablen
NEXT_PUBLIC_SUPABASE_URL="https://mxdpiqnkowcxbujgrfom.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key" \
SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key" \
vercel --prod
```
