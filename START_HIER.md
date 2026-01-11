
# 🎯 MERCHANT PORTAL - QUICK START

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🚨 PROBLEME BEIM MERCHANT LOGIN?                          │
│                                                             │
│  → Lies diese Datei für die schnelle Lösung! ⚡            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 SOFORT-LÖSUNG (2 Minuten)

### 1️⃣ SQL AUSFÜHREN

**Klick:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new

**Code:**
```sql
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON public.merchants(auth_user_id);
UPDATE public.merchants m SET auth_user_id = (SELECT au.id FROM auth.users au WHERE au.email = m.business_email) WHERE auth_user_id IS NULL;
SELECT company_name, business_email, CASE WHEN auth_user_id IS NOT NULL THEN '✅' ELSE '❌' END FROM public.merchants;
```

**Klick:** RUN ▶️

**Prüfe:** Alle Merchants = ✅

---

### 2️⃣ E-MAIL AKTIVIEREN

**Klick:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/settings/auth

**Aktiviere:** ☑️ Enable Email Confirmations

---

### 3️⃣ URLs HINZUFÜGEN

**Klick:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/url-configuration

**Add Redirect URLs:**
```
http://localhost:3000/login
http://localhost:3000/login?confirmed=true
```

---

### 4️⃣ PORTAL STARTEN

```bash
cd apps/merchant-portal
npm run dev
```

---

### 5️⃣ TESTEN

**Open:** http://localhost:3000/login

```
┌─────────────────────────────────┐
│  SpotX Merchant Portal          │
├─────────────────────────────────┤
│  Email:    [deine@email.de]     │
│  Password: [••••••••]            │
│                                 │
│  [Anmelden] ← Klick             │
└─────────────────────────────────┘

✅ Dashboard erscheint!
```

---

## 🎯 SCHNELL-LINKS

```
┌──────────────────────────┬─────────────────────────────────────┐
│ Was brauchst du?         │ Welche Datei?                       │
├──────────────────────────┼─────────────────────────────────────┤
│ 🔥 Schnellste Lösung    │ FIX_JETZT.md                        │
│ 📖 Ausführliche Hilfe   │ MERCHANT_LOGIN_FIX_ANLEITUNG.md     │
│ 🔧 Technische Details   │ QUICK_FIX_MERCHANT_LOGIN.md         │
│ ✅ Vollständige Liste   │ ALLE_FIXES_KOMPLETT.md              │
│ 📧 E-Mail Setup         │ MERCHANT_EMAIL_FIX_ANLEITUNG.md     │
└──────────────────────────┴─────────────────────────────────────┘
```

---

## 🐛 HÄUFIGE FEHLER

### ❌ "Failed to fetch merchant"
**Lösung:** Schritt 1 (SQL) ausführen ⬆️

### ❌ "Email not confirmed"
**Lösung:** E-Mail-Postfach prüfen (auch Spam!)

### ❌ "Merchant-Profil nicht gefunden"
**Lösung:** Neu registrieren unter `/register`

### ❌ "Invalid login credentials"
**Lösung:** Passwort falsch - nochmal versuchen

---

## 📊 STATUS-CHECK

```bash
# Prüfe ob SQL funktioniert hat
# Öffne: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/editor
# Wähle: merchants Tabelle
# Prüfe: auth_user_id Spalte sollte existieren
```

```sql
-- Oder mit SQL:
SELECT 
  company_name,
  business_email,
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ READY'
    ELSE '❌ NOT READY'
  END as status
FROM public.merchants;
```

**Alle Merchants sollten:** ✅ READY

---

## 🎉 SUCCESS!

```
Nach allen Schritten:

┌─────────────────────────────────────────┐
│  ✅ E-Mail Bestätigung funktioniert     │
│  ✅ Login funktioniert                  │
│  ✅ Dashboard wird angezeigt            │
│  ✅ Kampagnen können verwaltet werden   │
└─────────────────────────────────────────┘

🎊 FERTIG! Das Merchant Portal läuft! 🎊
```

---

## 🆘 IMMER NOCH PROBLEME?

1. **Browser Console öffnen:** F12 → Console
2. **Fehler kopieren**
3. **Terminal-Logs prüfen**
4. **Mir senden mit Screenshot**

---

## 📞 SUPPORT-LINKS

- 🔐 **SQL Editor:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new
- 👥 **Users:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
- 📊 **Tables:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/editor
- ⚙️ **Settings:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/settings/auth

---

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  WICHTIG: Schritt 1 (SQL) ist PFLICHT!              ║
║  Ohne SQL funktioniert der Login nicht!              ║
║                                                       ║
║  → Siehe oben für das SQL-Script ⬆️                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**LOS GEHT'S! 🚀**
