# 🚀 Vercel Deployment Setup für Monorepo

## Problem
Vercel deployed standardmäßig das Root-Verzeichnis (Expo App) statt des Next.js Apps in `apps/merchant-portal`.

## ✅ Lösung: Zwei Optionen

### Option 1: Vercel Dashboard Konfiguration (Empfohlen)

1. **Gehe zu deinem Vercel Projekt Dashboard**
   - Öffne https://vercel.com/dashboard
   - Wähle dein Projekt aus

2. **Settings → General**
   - **Root Directory:** Setze auf `apps/merchant-portal` ⚠️ **KRITISCH!**
   - **Framework Preset:** Next.js (sollte automatisch erkannt werden)
   - **Build Command:** Leer lassen (wird automatisch erkannt) oder `npm run build`
   - **Output Directory:** Leer lassen (wird automatisch erkannt) oder `.next`
   - **Install Command:** Leer lassen (wird automatisch erkannt) oder `npm ci`
   - **Node Version:** 20.x

3. **Settings → Environment Variables**
   Stelle sicher, dass für **Production**, **Preview** UND **Development** gesetzt sind:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
   NEXT_PUBLIC_BASE_URL=https://deine-domain.vercel.app
   ```

4. **Deployment neu starten**
   - Gehe zu **Deployments**
   - Klicke auf **⋯** beim letzten Deployment
   - Wähle **Redeploy**
   - **WICHTIG:** Deaktiviere **"Use existing Build Cache"** für den ersten Fix

### Option 2: vercel.json im Root (Fallback)

Falls die Dashboard-Einstellungen nicht funktionieren, verwendet Vercel die `vercel.json` im Root-Verzeichnis.

Die Datei `vercel.json` ist bereits erstellt und konfiguriert:
- Build-Befehle wechseln in `apps/merchant-portal`
- Output Directory ist `apps/merchant-portal/.next`
- Framework ist auf Next.js gesetzt

**Wichtig:** Wenn du Option 1 verwendest (Dashboard Root Directory), wird die `vercel.json` im Root ignoriert. Das ist normal und korrekt.

## 🔍 Verifikation

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

**Wenn der Build weniger als 20 Sekunden dauert**, deployed Vercel immer noch das falsche Verzeichnis!

## 🐛 Troubleshooting

### Problem: Build dauert weniger als 20 Sekunden

**Lösung:**
1. Prüfe ob `Root Directory` im Dashboard wirklich auf `apps/merchant-portal` steht
2. Prüfe ob die Build Logs zeigen, dass `npm ci` und `npm run build` ausgeführt werden
3. Falls nicht: Die Dashboard-Einstellungen werden möglicherweise von der GitHub Integration überschrieben

### Problem: "Cannot find module" oder "Dependencies not found"

**Lösung:**
1. Stelle sicher, dass `package-lock.json` im `apps/merchant-portal` Verzeichnis existiert ✅ (ist vorhanden)
2. Prüfe ob `npm ci` im richtigen Verzeichnis ausgeführt wird

### Problem: "404 NOT_FOUND" nach erfolgreichem Build

**Lösung:**
1. Prüfe ob `Output Directory` auf `.next` gesetzt ist (NICHT `apps/merchant-portal/.next` wenn Root Directory gesetzt ist)
2. Prüfe ob Next.js wirklich gebaut wurde (sollte `.next` Ordner in Build Logs zeigen)
3. Prüfe ob Environment Variables gesetzt sind

### Problem: Vercel erkennt immer noch Expo statt Next.js

**Lösung:**
1. Lösche das Projekt in Vercel komplett
2. Erstelle ein **NEUES** Projekt
3. Beim Setup: Wähle **"Configure"** statt **"Deploy"**
4. Setze **Root Directory** auf `apps/merchant-portal`
5. Setze **Framework** auf **Next.js**
6. Verbinde mit GitHub

## 📝 GitHub Actions Workflow (Optional)

Falls du manuell über GitHub Actions deployen möchtest, wurde ein Workflow erstellt:
- `.github/workflows/vercel-deploy.yml`

**Wichtig:** Dieser Workflow benötigt Vercel Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Diese kannst du in GitHub Repository Settings → Secrets and variables → Actions hinzufügen.

**Aber:** Normalerweise sollte die GitHub Integration in Vercel automatisch deployen, wenn du Code pusht. Der Workflow ist nur für manuelle Deployments nötig.

## ✅ Checkliste

- [ ] Root Directory im Vercel Dashboard auf `apps/merchant-portal` gesetzt
- [ ] Framework Preset auf Next.js gesetzt
- [ ] Environment Variables für Production, Preview und Development gesetzt
- [ ] `package-lock.json` existiert in `apps/merchant-portal` ✅
- [ ] `vercel.json` existiert im Root (als Fallback) ✅
- [ ] Build dauert mindestens 30-60 Sekunden
- [ ] Build Logs zeigen `npm ci` und `npm run build`
- [ ] Deployment Status ist "Ready" (grün)
- [ ] Website lädt ohne 404 Fehler
