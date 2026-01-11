# SpotX Merchant Portal - Environment Setup

## 📝 Erstellen der .env.local Datei

Die `.env.local` Datei ist erforderlich, damit das Merchant Portal mit Supabase kommunizieren kann.

### Automatisch erstellen

```bash
cd apps/merchant-portal
cp .env.local.template .env.local
```

### Manuell erstellen

1. Navigieren Sie zum Merchant Portal Verzeichnis:
```bash
cd apps/merchant-portal
```

2. Erstellen Sie die `.env.local` Datei:
```bash
touch .env.local
```

3. Fügen Sie folgende Zeilen hinzu:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s

# Base URL for email redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## ⚠️ Wichtige Hinweise

- **Die `.env.local` Datei wird NICHT ins Git-Repository hochgeladen** (ist in `.gitignore`)
- **Ändern Sie die `NEXT_PUBLIC_BASE_URL` für Production** zu Ihrer echten Domain
- **Teilen Sie diese Credentials NICHT öffentlich**

## 🚀 Für Production (Vercel)

Wenn Sie das Merchant Portal auf Vercel deployen:

1. Gehen Sie zu Ihrem Vercel Project Dashboard
2. Navigieren Sie zu **Settings** → **Environment Variables**
3. Fügen Sie folgende Variablen hinzu:

```
NEXT_PUBLIC_SUPABASE_URL = https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BASE_URL = https://ihre-domain.vercel.app
```

4. Deploy neu starten

## ✅ Testen

Nach dem Erstellen der `.env.local` Datei:

```bash
npm run dev
```

Öffnen Sie http://localhost:3000 - das Portal sollte jetzt funktionieren!
