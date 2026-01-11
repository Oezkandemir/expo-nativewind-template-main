# 🚨 QUICK FIX: Merchant Login Problem

## Problem
Nach der Registrierung und E-Mail-Bestätigung erscheint beim Login der Fehler:
```
Failed to fetch merchant: {}
```

## ✅ Schnelle Lösung (2 Schritte)

### Schritt 1: SQL in Supabase ausführen

1. **Öffne Supabase SQL Editor:**
   👉 https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new

2. **Kopiere diesen SQL-Code und führe ihn aus:**

```sql
-- Füge auth_user_id Spalte hinzu
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Erstelle Index
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id 
ON public.merchants(auth_user_id);

-- Verknüpfe existierende Merchants mit auth.users
UPDATE public.merchants m
SET auth_user_id = (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = m.business_email
)
WHERE auth_user_id IS NULL 
  AND business_email IS NOT NULL;

-- Prüfe Ergebnis
SELECT 
    id,
    auth_user_id,
    company_name,
    business_email,
    status,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Linked'
        ELSE '⚠️ Not linked'
    END as link_status
FROM public.merchants
ORDER BY created_at DESC;
```

3. **Klicke auf "RUN" (oder Cmd/Ctrl + Enter)**

4. **Prüfe das Ergebnis:**
   - Alle Merchants sollten jetzt "✅ Linked" zeigen

### Schritt 2: Merchant Portal neu starten

```bash
cd apps/merchant-portal
npm run dev
```

### Schritt 3: Erneut anmelden

1. Öffne http://localhost:3000/login
2. Melde dich mit deinen Merchant-Credentials an
3. ✅ **Es sollte jetzt funktionieren!**

---

## 🔍 Was war das Problem?

Die `merchants` Tabelle hatte keine Verbindung zur `auth.users` Tabelle. Der Code suchte nach dem Merchant, konnte ihn aber nicht finden, weil:

1. **Alte Registrierung:** Merchants wurden nur mit `business_email` gespeichert
2. **Neue Verbesserung:** Wir haben `auth_user_id` hinzugefügt zur direkten Verknüpfung
3. **Lookup-Strategie:** Der Code sucht jetzt zuerst nach `auth_user_id`, dann als Fallback nach `business_email`

---

## 📝 Was wurde geändert?

### 1. Register-Code (`apps/merchant-portal/app/(auth)/register/page.tsx`)

**Vorher:**
```typescript
.insert({
  company_name: companyName,
  business_email: email,
  phone: phone || null,
  status: 'pending',
  verified: false,
})
```

**Nachher:**
```typescript
.insert({
  auth_user_id: authData.user.id, // ✅ NEU
  company_name: companyName,
  business_email: email,
  phone: phone || null,
  status: 'pending',
  verified: false,
})
```

### 2. Merchant-Lookup (`apps/merchant-portal/lib/auth/merchant-helpers.ts`)

**Vorher:**
```typescript
// Nur nach email suchen
const { data: merchant } = await supabase
  .from('merchants')
  .select('*')
  .eq('business_email', user.email)
  .single()
```

**Nachher:**
```typescript
// Zuerst nach auth_user_id suchen (schneller & sicherer)
let { data: merchant } = await supabase
  .from('merchants')
  .select('*')
  .eq('auth_user_id', user.id)
  .single()

// Fallback: Nach email suchen (für alte Merchants)
if (merchantError && merchantError.code === 'PGRST116') {
  const { data: merchantByEmail } = await supabase
    .from('merchants')
    .select('*')
    .eq('business_email', user.email)
    .single()
  
  merchant = merchantByEmail
  
  // Update mit auth_user_id für zukünftige Lookups
  if (merchant) {
    await supabase
      .from('merchants')
      .update({ auth_user_id: user.id })
      .eq('id', merchant.id)
  }
}
```

---

## 🧪 Testen

### Test 1: Bestehender Merchant
1. Melde dich als bestehender Merchant an
2. ✅ Sollte funktionieren (durch Fallback-Logik)
3. ✅ `auth_user_id` wird automatisch gesetzt

### Test 2: Neuer Merchant
1. Registriere neuen Merchant
2. Bestätige E-Mail
3. Melde dich an
4. ✅ Sollte sofort funktionieren (hat bereits `auth_user_id`)

---

## 🎯 Vorteile der neuen Lösung

1. **✅ Schneller:** Lookup nach UUID statt nach Email
2. **✅ Sicherer:** Direkte Verknüpfung zur auth.users
3. **✅ Abwärtskompatibel:** Funktioniert auch für alte Merchants
4. **✅ Selbst-heilend:** Alte Merchants werden automatisch aktualisiert

---

## 🚨 Troubleshooting

### Problem: SQL-Error "relation does not exist"
**Lösung:** Stelle sicher, dass du im richtigen Projekt bist
👉 https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom

### Problem: "No merchants found"
**Lösung:** Prüfe ob Merchant in der Datenbank existiert:
```sql
SELECT * FROM public.merchants WHERE business_email = 'deine@email.de';
```

### Problem: "auth_user_id is still NULL"
**Lösung:** Prüfe ob auth.users Eintrag existiert:
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'deine@email.de';
```

Falls nicht vorhanden: E-Mail noch nicht bestätigt!

---

## 📞 Nächste Schritte

Falls es immer noch nicht funktioniert:

1. **Prüfe die Browser Console** (F12) für Fehler
2. **Prüfe die Terminal-Logs** des Merchant Portals
3. **Schicke mir die Fehler-Logs**

---

## ✅ Checkliste

- [ ] SQL-Script in Supabase ausgeführt
- [ ] `auth_user_id` Spalte existiert
- [ ] Alle Merchants haben `auth_user_id` gesetzt
- [ ] Merchant Portal neu gestartet
- [ ] Login erfolgreich
- [ ] Dashboard wird angezeigt

**Sobald alle Punkte ✅ sind, ist das Problem gelöst!** 🎉
