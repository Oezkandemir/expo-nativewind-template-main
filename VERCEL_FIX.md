# 🔧 Vercel Deployment Fix - 404 Error Lösung

## Problem
Das Deployment geht zu schnell und zeigt immer einen 404 Fehler, weil Vercel das falsche Verzeichnis deployed.

## ✅ Lösung

### Schritt 1: Vercel Dashboard Einstellungen prüfen

Gehe zu deinem Vercel Projekt Dashboard und überprüfe folgende Einstellungen:

**Settings → General:**

1. **Root Directory:** Muss `apps/merchant-portal` sein
2. **Framework Preset:** Next.js (sollte automatisch erkannt werden)
3. **Build Command:** `npm run build` (oder leer lassen für Auto-Detection)
4. **Output Directory:** `.next` (oder leer lassen für Auto-Detection)
5. **Install Command:** `npm install` (oder leer lassen für Auto-Detection)

### Schritt 2: Environment Variables setzen

**Settings → Environment Variables:**

Stelle sicher, dass folgende Variablen für **Production**, **Preview** und **Development** gesetzt sind:

```
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s
NEXT_PUBLIC_BASE_URL=https://expo-nativewind-template-main.vercel.app
```

**Wichtig:** Ersetze `NEXT_PUBLIC_BASE_URL` mit deiner tatsächlichen Vercel Domain!

### Schritt 3: Deployment neu starten

1. Gehe zu **Deployments** Tab
2. Klicke auf die drei Punkte (⋯) beim letzten Deployment
3. Wähle **Redeploy**
4. Stelle sicher, dass **Use existing Build Cache** **NICHT** aktiviert ist (für den ersten Fix-Deployment)

### Schritt 4: Build Logs prüfen

Nach dem Deployment:

1. Öffne das Deployment
2. Gehe zu **Build Logs**
3. Prüfe ob:
   - ✅ Dependencies installiert werden (`npm install`)
   - ✅ Build läuft (`npm run build`)
   - ✅ Build erfolgreich ist (keine Fehler)
   - ✅ Output Directory `.next` erstellt wird

## 🐛 Troubleshooting

### Problem: "Build completes too fast" / "No build output"

**Lösung:**
- Prüfe ob `rootDirectory` in Vercel Dashboard auf `apps/merchant-portal` gesetzt ist
- Prüfe ob `vercel.json` im Root-Verzeichnis existiert und korrekt ist
- Stelle sicher, dass die `package.json` in `apps/merchant-portal` existiert

### Problem: "404 NOT_FOUND" nach erfolgreichem Build

**Lösung:**
- Prüfe ob `outputDirectory` auf `.next` gesetzt ist (nicht `apps/merchant-portal/.next`)
- Stelle sicher, dass Next.js richtig gebaut wurde (prüfe Build Logs)
- Prüfe ob Environment Variables gesetzt sind

### Problem: "Dependencies not found"

**Lösung:**
- Stelle sicher, dass `installCommand` auf `npm install` gesetzt ist
- Prüfe ob `package-lock.json` oder `pnpm-lock.yaml` im `apps/merchant-portal` Verzeichnis existiert
- Falls nötig, führe lokal `cd apps/merchant-portal && npm install` aus und committe die `package-lock.json`

## 📝 Verifikation

Nach dem Fix sollte:

1. ✅ Build mindestens 30-60 Sekunden dauern (nicht 5 Sekunden)
2. ✅ Build Logs zeigen: "Installing dependencies", "Building", "Build completed"
3. ✅ Deployment Status: "Ready" (grün)
4. ✅ Website lädt ohne 404 Fehler

## 🔄 Alternative: Vercel CLI Deployment

Falls das Dashboard nicht funktioniert, deploye direkt mit CLI:

```bash
cd apps/merchant-portal

# Setze Environment Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_BASE_URL production

# Deploye
vercel --prod
```

## 📞 Weitere Hilfe

Falls das Problem weiterhin besteht:
1. Teile die Build Logs aus Vercel
2. Prüfe ob `vercel.json` im Root existiert
3. Prüfe ob alle Environment Variables gesetzt sind
