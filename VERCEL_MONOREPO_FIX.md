# 🔧 Vercel Monorepo Deployment Fix

## Problem
Das Deployment geht in weniger als 21 Sekunden durch, weil Vercel das falsche Verzeichnis deployed (Expo Root statt Next.js Merchant Portal).

## ✅ Lösung

### Schritt 1: Vercel Dashboard Einstellungen (KRITISCH!)

**WICHTIG:** Diese Einstellungen müssen im Vercel Dashboard gesetzt werden, da GitHub-Integration die `vercel.json` manchmal überschreibt!

1. Gehe zu deinem Vercel Projekt: `expo-nativewind-template-main`
2. **Settings → General**
3. Setze folgende Werte **EXAKT**:

```
Root Directory: apps/merchant-portal
Framework Preset: Other (oder Next.js wenn verfügbar)
Build Command: npm ci && npm run build
Output Directory: .next
Install Command: npm ci
Node Version: 18.x (oder 20.x)
```

4. **Speichern!**

### Schritt 2: Environment Variables prüfen

**Settings → Environment Variables**

Stelle sicher, dass für **Production**, **Preview** UND **Development** gesetzt sind:

```
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s
NEXT_PUBLIC_BASE_URL=https://expo-nativewind-template-main.vercel.app
```

**Wichtig:** Ersetze `NEXT_PUBLIC_BASE_URL` mit deiner tatsächlichen Vercel Domain!

### Schritt 3: Deployment neu starten

1. Gehe zu **Deployments**
2. Klicke auf das letzte Deployment
3. Klicke auf **⋯** (drei Punkte)
4. Wähle **Redeploy**
5. **WICHTIG:** Deaktiviere **"Use existing Build Cache"** (für den ersten Fix)
6. Klicke **Redeploy**

### Schritt 4: Build Logs prüfen

Nach dem Deployment solltest du in den **Build Logs** sehen:

```
✅ Installing dependencies...
   npm ci
   (sollte mehrere Sekunden dauern)

✅ Building...
   npm run build
   (sollte 30-60 Sekunden dauern)
   
✅ Build completed
```

**Wenn du das NICHT siehst**, dann deployed Vercel immer noch das falsche Verzeichnis!

## 🐛 Troubleshooting

### Problem: Deployment geht immer noch zu schnell (< 21 Sekunden)

**Lösung:**
1. Prüfe ob `Root Directory` im Dashboard wirklich auf `apps/merchant-portal` steht
2. Prüfe ob die Build Logs zeigen, dass `npm ci` und `npm run build` ausgeführt werden
3. Falls nicht: Die Dashboard-Einstellungen überschreiben die `vercel.json`

### Problem: "Cannot find module" oder "Dependencies not found"

**Lösung:**
1. Stelle sicher, dass `package-lock.json` im `apps/merchant-portal` Verzeichnis existiert
2. Falls nicht: Führe lokal aus:
   ```bash
   cd apps/merchant-portal
   npm install
   git add package-lock.json
   git commit -m "Add package-lock.json for Vercel"
   git push
   ```

### Problem: "404 NOT_FOUND" nach erfolgreichem Build

**Lösung:**
1. Prüfe ob `Output Directory` auf `.next` gesetzt ist (NICHT `apps/merchant-portal/.next`)
2. Prüfe ob Next.js wirklich gebaut wurde (sollte `.next` Ordner in Build Logs zeigen)
3. Prüfe ob Environment Variables gesetzt sind

### Problem: Vercel erkennt immer noch Expo statt Next.js

**Lösung:**
1. Lösche das Projekt in Vercel komplett
2. Erstelle ein NEUES Projekt
3. Beim Setup: Wähle **"Configure"** statt **"Deploy"**
4. Setze **Root Directory** auf `apps/merchant-portal`
5. Setze **Framework** auf **Next.js**
6. Verbinde mit GitHub

## 📝 Verifikation Checkliste

Nach dem Fix sollte:

- ✅ Build dauert **mindestens 30-60 Sekunden** (nicht 21 Sekunden!)
- ✅ Build Logs zeigen: `Installing dependencies` → `Building` → `Build completed`
- ✅ Output Directory `.next` wird erstellt
- ✅ Deployment Status: **Ready** (grün)
- ✅ Website lädt ohne 404 Fehler
- ✅ Merchant Portal ist erreichbar

## 🔄 Alternative: Neues Projekt erstellen

Falls nichts funktioniert:

1. Lösche das aktuelle Vercel Projekt
2. Erstelle ein **NEUES** Projekt in Vercel
3. Verbinde mit GitHub Repository
4. **WICHTIG:** Beim Setup wähle **"Configure"** (nicht "Deploy")
5. Setze:
   - **Root Directory:** `apps/merchant-portal`
   - **Framework:** Next.js
   - **Build Command:** `npm ci && npm run build`
   - **Output Directory:** `.next`
6. Setze Environment Variables
7. Deploye

## 📞 Wenn nichts funktioniert

Teile mir mit:
1. Screenshot der Vercel Dashboard Settings (General Tab)
2. Build Logs vom letzten Deployment
3. Ob `package-lock.json` im `apps/merchant-portal` Verzeichnis existiert
