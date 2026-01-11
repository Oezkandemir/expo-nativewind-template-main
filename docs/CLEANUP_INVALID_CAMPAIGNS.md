# 🧹 Cleanup: Ungültige Kampagnen für User "demir"

**Datum:** 10. Januar 2026  
**Problem:** User "demir" hat ungültige Kampagnen-Einträge in der History

---

## 🎯 Ziel

**Ungültige `campaign_id` Einträge** für User "demir" entweder:
1. ✅ **Löschen** (empfohlen)
2. 🔧 **Anpassen** auf gültige Campaign-ID

---

## 🔍 Was ist das Problem?

### Gültige Campaign-IDs:
```
campaign_1  - Tech Campaign
campaign_2  - Fitness Campaign
campaign_3  - Fashion Campaign
campaign_4  - Food Campaign
campaign_5  - Travel Campaign
campaign_6  - Audio Campaign
campaign_7  - Wellness Campaign
campaign_8  - Automotive Campaign
campaign_9  - Beverage Campaign
campaign_10 - Luxury Campaign
```

### Ungültige Campaign-IDs:
- Alles andere (z.B. `campaign_xyz`, `unknown`, `test123`, etc.)

---

## 🛠️ Lösung: SQL Script ausführen

### Option 1: Supabase SQL Editor (EMPFOHLEN)

**Datei:** `scripts/cleanup-campaigns.sql`

**Schritt 1: User finden**
```sql
SELECT id, email, name 
FROM users 
WHERE email ILIKE '%demir%';
```

**Erwartetes Ergebnis:**
```
id                                    | email            | name
--------------------------------------|------------------|------
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | demir@email.com  | Demir
```

→ **User-ID kopieren!**

---

**Schritt 2: Ungültige Kampagnen anzeigen**
```sql
SELECT 
  av.id,
  av.campaign_id,
  av.viewed_at,
  av.completed,
  av.reward_earned
FROM ad_views av
WHERE av.user_id = 'HIER_USER_ID_EINFÜGEN'
  AND av.campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  )
ORDER BY av.viewed_at DESC;
```

**Beispiel-Ergebnis:**
```
id          | campaign_id  | viewed_at           | completed | reward_earned
------------|--------------|---------------------|-----------|---------------
abc123...   | campaign_xyz | 2026-01-10 14:30:00 | true      | 0.10
def456...   | test123      | 2026-01-10 12:15:00 | false     | 0.00
```

→ **Das sind die ungültigen Einträge!**

---

**Schritt 3A: Ungültige Kampagnen LÖSCHEN (empfohlen)**

```sql
-- Erst die Rewards löschen
DELETE FROM rewards
WHERE ad_view_id IN (
  SELECT av.id
  FROM ad_views av
  WHERE av.user_id = 'HIER_USER_ID_EINFÜGEN'
    AND av.campaign_id NOT IN (
      'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
      'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
    )
);

-- Dann die ad_views löschen
DELETE FROM ad_views
WHERE user_id = 'HIER_USER_ID_EINFÜGEN'
  AND campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  );
```

**Erwartete Ausgabe:**
```
DELETE 2  (Beispiel: 2 Rewards gelöscht)
DELETE 2  (Beispiel: 2 ad_views gelöscht)
```

---

**Schritt 3B: Campaign-ID ANPASSEN (Alternative)**

Wenn Sie die Einträge behalten möchten, können Sie die ungültige Campaign-ID auf eine gültige ändern:

```sql
-- Ändere alle ungültigen zu 'campaign_1' (Tech Campaign)
UPDATE ad_views
SET campaign_id = 'campaign_1'
WHERE user_id = 'HIER_USER_ID_EINFÜGEN'
  AND campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  );
```

**Erwartete Ausgabe:**
```
UPDATE 2  (Beispiel: 2 Einträge aktualisiert)
```

---

**Schritt 4: Verifizieren**
```sql
SELECT 
  av.campaign_id,
  COUNT(*) as count,
  SUM(av.reward_earned) as total_rewards
FROM ad_views av
WHERE av.user_id = 'HIER_USER_ID_EINFÜGEN'
GROUP BY av.campaign_id
ORDER BY av.campaign_id;
```

**Erwartetes Ergebnis (nach Cleanup):**
```
campaign_id  | count | total_rewards
-------------|-------|---------------
campaign_1   | 3     | 0.30
campaign_2   | 2     | 0.30
campaign_5   | 1     | 0.20
```

→ **Nur noch gültige Campaign-IDs!** ✅

---

## 🎯 Empfehlung

### ✅ LÖSCHEN (Schritt 3A)
**Wenn:**
- Die ungültigen Einträge sind Testdaten
- Sie keine echten User-Aktivitäten darstellen
- Sie einfach aufräumen möchten

### 🔧 ANPASSEN (Schritt 3B)
**Wenn:**
- Die Einträge wichtig sind (echte User-Aktivität)
- Sie nur die Campaign-ID korrigieren möchten
- Sie die History behalten möchten

**Unsere Empfehlung:** ✅ **LÖSCHEN** (Schritt 3A)

---

## 🧪 Testing nach Cleanup

### 1. In der App:
```
1. Als User "demir" einloggen
2. History-Tab öffnen
3. Prüfen: Alle Kampagnen haben jetzt echte Namen
   ✅ "Tech Campaign"
   ✅ "Fitness Campaign"
   ❌ KEINE "Unbekannte Kampagne" mehr!
```

### 2. Im Profil:
```
1. Profil-Tab öffnen
2. Statistiken-Card prüfen:
   - Guthaben sollte aktualisiert sein
   - Kampagnen-Anzahl sollte korrekt sein
```

---

## 📊 Beispiel-Ablauf

### Vorher:
```
📊 User "demir" - 5 Kampagnen:
   ✅ campaign_1 (Tech Campaign)
   ✅ campaign_2 (Fitness Campaign)
   ❌ campaign_xyz (UNGÜLTIG!)
   ❌ test123 (UNGÜLTIG!)
   ✅ campaign_5 (Travel Campaign)
```

### SQL ausführen:
```sql
-- Ungültige finden
SELECT ... → 2 ungültige gefunden

-- Löschen
DELETE FROM rewards WHERE ... → 2 gelöscht
DELETE FROM ad_views WHERE ... → 2 gelöscht
```

### Nachher:
```
📊 User "demir" - 3 Kampagnen:
   ✅ campaign_1 (Tech Campaign)
   ✅ campaign_2 (Fitness Campaign)
   ✅ campaign_5 (Travel Campaign)
```

---

## 📁 Dateien

1. ✅ `scripts/cleanup-campaigns.sql` - SQL Script für Supabase
2. ✅ `scripts/cleanup-invalid-campaigns.ts` - TypeScript Script (optional)
3. ✅ `docs/CLEANUP_INVALID_CAMPAIGNS.md` - Diese Dokumentation

---

## ⚠️ Wichtige Hinweise

### Vor dem Löschen:
1. ✅ **Backup machen!** (optional, aber empfohlen)
2. ✅ **Erst Schritt 2 ausführen** (ungültige anzeigen)
3. ✅ **User-ID prüfen** (richtige Person?)
4. ✅ **Anzahl prüfen** (wie viele werden gelöscht?)

### Nach dem Löschen:
1. ✅ **Schritt 4 ausführen** (verifizieren)
2. ✅ **App testen** (History prüfen)
3. ✅ **Profil prüfen** (Statistiken korrekt?)

---

## 🎉 Ergebnis

Nach dem Cleanup sollte:

✅ User "demir" nur noch **gültige Kampagnen** haben  
✅ History zeigt **echte Kampagnen-Namen**  
✅ Keine **"Unbekannte Kampagne"** mehr  
✅ Statistiken sind **korrekt**  
✅ Datenbank ist **sauber**  

**Fertig!** 🚀

---

## 🆘 Hilfe

### Fehler: "User not found"
→ E-Mail prüfen: Ist "demir" die richtige E-Mail?

### Fehler: "Permission denied"
→ RLS Policies prüfen oder als Service Role ausführen

### Frage: "Welche Campaign-ID soll ich verwenden?"
→ Empfehlung: `campaign_1` (Tech Campaign) - am häufigsten

### Problem: "Statistiken stimmen nicht"
→ App neu starten oder Cache leeren
