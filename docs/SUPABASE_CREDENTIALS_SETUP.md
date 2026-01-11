# 🔧 Supabase Credentials konfigurieren

## Schnellstart

### 1. Credentials-Datei erstellen

Erstellen Sie eine neue Datei:
```
lib/supabase/config.local.ts
```

### 2. Inhalt kopieren

Kopieren Sie den Inhalt von `lib/supabase/config.example.ts` und fügen Sie Ihre echten Supabase-Credentials ein:

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://mxdpiqnkowcxbujgrfom.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s',
};
```

### 3. App neu starten

```bash
# Metro Bundler stoppen (Ctrl+C)
# Dann neu starten:
npm start

# oder mit Cache löschen:
npm run dev
```

## 📍 Wo finde ich meine Supabase Credentials?

1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt: `mxdpiqnkowcxbujgrfom`
3. Gehe zu: **Settings** → **API**
4. Kopiere:
   - **Project URL** → `url`
   - **anon public** Key → `anonKey`

## 🔒 Sicherheit

- ✅ `config.local.ts` ist in `.gitignore` und wird **nicht** ins Repository hochgeladen
- ✅ Nur `config.example.ts` (ohne echte Credentials) ist im Repository
- ✅ Jeder Entwickler erstellt seine eigene `config.local.ts`

## ⚠️ Troubleshooting

### Fehler: "Supabase credentials are not configured"

**Lösung:**
1. Prüfen Sie, ob `lib/supabase/config.local.ts` existiert
2. Prüfen Sie, ob die Datei die echten Credentials enthält (nicht "YOUR_SUPABASE_URL_HERE")
3. Starten Sie die App neu

### Fehler: "Cannot find module './config.local'"

**Lösung:**
1. Die Datei `lib/supabase/config.local.ts` existiert noch nicht
2. Erstellen Sie die Datei wie oben beschrieben
3. Starten Sie die App neu

## 🎯 Fertig!

Nach dem Erstellen von `config.local.ts` sollte die App ohne Fehler starten und Sie können sich registrieren/anmelden.
