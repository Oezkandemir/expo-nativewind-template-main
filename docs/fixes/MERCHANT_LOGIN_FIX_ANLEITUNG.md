# Schritt-für-Schritt: Merchant Login Fix

## 📋 Was du tun musst

### 1️⃣ Öffne Supabase Dashboard

Klicke hier: 👉 [Supabase SQL Editor öffnen](https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new)

Oder manuell:
1. Gehe zu https://supabase.com/dashboard
2. Melde dich an (falls noch nicht angemeldet)
3. Wähle dein Projekt: `mxdpiqnkowcxbujgrfom`
4. Klicke links im Menü auf **"SQL Editor"**
5. Klicke auf **"New Query"**

---

### 2️⃣ Kopiere diesen SQL-Code

Markiere den gesamten Code unten und kopiere ihn (Cmd/Ctrl + C):

```sql
-- MERCHANT LOGIN FIX
-- Fügt auth_user_id Spalte hinzu und verknüpft Merchants mit auth.users

-- 1. Spalte hinzufügen
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Index erstellen
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id 
ON public.merchants(auth_user_id);

-- 3. Existierende Merchants verknüpfen
UPDATE public.merchants m
SET auth_user_id = (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = m.business_email
)
WHERE auth_user_id IS NULL 
  AND business_email IS NOT NULL;

-- 4. Ergebnis anzeigen
SELECT 
    company_name,
    business_email,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Verknüpft'
        ELSE '⚠️ Nicht verknüpft'
    END as status
FROM public.merchants
ORDER BY created_at DESC;
```

---

### 3️⃣ Code einfügen und ausführen

1. **Füge den Code ein** in das SQL Editor Fenster (Cmd/Ctrl + V)
2. **Klicke auf den "RUN" Button** (grüner Play-Button oben rechts)
   - Oder drücke **Cmd/Ctrl + Enter**
3. **Warte** bis die Ausführung fertig ist (1-2 Sekunden)

---

### 4️⃣ Prüfe das Ergebnis

Du solltest eine Tabelle sehen mit:
- **Firmenname**
- **E-Mail**
- **Status:** "✅ Verknüpft"

**Wichtig:** Alle Merchants sollten "✅ Verknüpft" zeigen!

Falls ein Merchant "⚠️ Nicht verknüpft" zeigt:
- Bedeutet: E-Mail wurde noch nicht bestätigt
- Lösung: Bestätigungs-E-Mail prüfen und Link klicken

---

### 5️⃣ Merchant Portal neu starten

Öffne dein Terminal und führe aus:

```bash
# Navigation zum Merchant Portal
cd /Users/dmr/Desktop/expo-nativewind-template-main/apps/merchant-portal

# Dev Server neu starten
npm run dev
```

---

### 6️⃣ Login testen

1. **Öffne:** http://localhost:3000/login
2. **Gib deine Credentials ein:**
   - E-Mail: (deine Merchant-E-Mail)
   - Passwort: (dein Passwort)
3. **Klicke "Anmelden"**

**✅ Es sollte jetzt funktionieren!**

Du solltest jetzt das Kampagnen-Dashboard sehen mit:
- Firmennamen oben rechts
- Status-Banner (pending/approved)
- Kampagnen-Liste (wenn vorhanden)

---

## 🎉 Geschafft!

Falls es funktioniert:
- ✅ Problem gelöst!
- ✅ Du kannst jetzt das Merchant Portal nutzen
- ✅ Neue Registrierungen werden automatisch korrekt verknüpft

---

## ❌ Falls es NICHT funktioniert

### A) Fehler beim SQL ausführen

**"permission denied for table merchants"**
- Lösung: Stelle sicher, dass du als Owner eingeloggt bist

**"column auth_user_id already exists"**
- Das ist OK! Bedeutet: Spalte existiert schon
- Führe trotzdem den Rest aus (Update & Select)

### B) Login funktioniert nicht

1. **Prüfe Browser Console (F12):**
   - Öffne Developer Tools
   - Gehe zu "Console" Tab
   - Kopiere Fehlermeldungen und sende sie mir

2. **Prüfe Terminal-Logs:**
   - Schaue in das Terminal wo `npm run dev` läuft
   - Kopiere Fehlermeldungen

3. **Prüfe Supabase Auth:**
   - Gehe zu https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
   - Suche deine E-Mail
   - Prüfe: `email_confirmed_at` sollte NICHT null sein
   - Falls null: E-Mail noch nicht bestätigt!

### C) "Merchant-Profil nicht gefunden"

Das bedeutet:
- SQL wurde nicht ausgeführt, ODER
- Merchant existiert nicht in der Datenbank

**Lösung:**

1. Prüfe ob Merchant existiert:
```sql
SELECT * FROM public.merchants 
WHERE business_email = 'deine@email.de';
```

2. Falls leer: Registriere dich nochmal
3. Falls vorhanden: Führe das Update SQL nochmal aus

---

## 💡 Was wurde genau gefixt?

**Das Problem:**
```
Code suchte Merchant → Nicht gefunden → Fehler
```

**Die Lösung:**
```
1. Neue Spalte: auth_user_id
2. Verknüpfung: merchant.auth_user_id = auth.users.id
3. Code findet Merchant jetzt sofort
```

---

## 📸 Screenshots zur Hilfe

### Supabase SQL Editor sollte so aussehen:
```
+-----------------------------------+
| SQL Editor                        |
+-----------------------------------+
| [SQL Code hier einfügen]          |
|                                   |
| ALTER TABLE ...                   |
| CREATE INDEX ...                  |
| UPDATE ...                        |
|                                   |
| [RUN Button] ← Hier klicken       |
+-----------------------------------+
```

### Nach dem RUN solltest du sehen:
```
Results:
┌──────────────────┬───────────────────────┬──────────────┐
│ company_name     │ business_email        │ status       │
├──────────────────┼───────────────────────┼──────────────┤
│ Test Company     │ test@example.com      │ ✅ Verknüpft │
│ Deine Firma      │ deine@email.de        │ ✅ Verknüpft │
└──────────────────┴───────────────────────┴──────────────┘
```

---

## 🤝 Brauchst du Hilfe?

Sende mir:
1. Screenshot vom Supabase SQL Editor (nach RUN)
2. Browser Console Fehler (F12 → Console)
3. Terminal Logs

Ich helfe dir dann weiter! 💪
