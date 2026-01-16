# ⚡ Schnell-Checkliste: EU-Geoblocking-Compliance

**Für Google Play Console - Schritt für Schritt**

---

## 🎯 In 5 Minuten erledigt

### 1️⃣ Länderverfügbarkeit aktivieren (2 Minuten)

1. Öffnen Sie: https://play.google.com/console
2. Wählen Sie Ihre App: **spotx**
3. Gehen Sie zu: **"Produktion"** → **"Länder/Regionen"**
4. **Aktivieren Sie alle 27 EU-Länder:**
   - ✅ Österreich (AT)
   - ✅ Belgien (BE)
   - ✅ Bulgarien (BG)
   - ✅ Kroatien (HR)
   - ✅ Zypern (CY)
   - ✅ Tschechien (CZ)
   - ✅ Dänemark (DK)
   - ✅ Estland (EE)
   - ✅ Finnland (FI)
   - ✅ Frankreich (FR)
   - ✅ Deutschland (DE)
   - ✅ Griechenland (GR)
   - ✅ Ungarn (HU)
   - ✅ Irland (IE)
   - ✅ Italien (IT)
   - ✅ Lettland (LV)
   - ✅ Litauen (LT)
   - ✅ Luxemburg (LU)
   - ✅ Malta (MT)
   - ✅ Niederlande (NL)
   - ✅ Polen (PL)
   - ✅ Portugal (PT)
   - ✅ Rumänien (RO)
   - ✅ Slowakei (SK)
   - ✅ Slowenien (SI)
   - ✅ Spanien (ES)
   - ✅ Schweden (SE)

5. Klicken Sie auf **"Speichern"**

### 2️⃣ Zahlungsmethoden prüfen (1 Minute)

1. Gehen Sie zu: **"Monetarisierung"** → **"Zahlungsmethoden"**
2. Stellen Sie sicher, dass Zahlungen aus allen EU-Ländern akzeptiert werden
3. Falls In-App-Käufe vorhanden: Gleiche Preise für alle EU-Länder (außer Steuern)

### 3️⃣ Store-Listing prüfen (1 Minute)

1. Gehen Sie zu: **"Store-Präsenz"** → **"Hauptliste"**
2. Prüfen Sie die Beschreibung auf geografische Beschränkungen
3. Falls Beschränkungen erwähnt werden: Sind sie rechtlich gerechtfertigt?

### 4️⃣ Code-Quick-Check (1 Minute)

Suchen Sie in Ihrem Code nach:

```bash
# Suche nach möglichem Geoblocking-Code
grep -r "country.*block\|block.*country\|geoblock" --include="*.ts" --include="*.tsx" --include="*.js"
```

Falls gefunden: Prüfen Sie, ob es rechtlich gerechtfertigt ist.

---

## ✅ Fertig!

Nach diesen Schritten sollten Sie die grundlegenden Anforderungen erfüllen.

**Für detaillierte Informationen:** Siehe `docs/EU_GEOBLOCKING_COMPLIANCE.md`

---

## 🚨 Was Google Play Console anzeigt

Wenn Sie in der Play Console eine Warnung oder Anforderung zur Geoblocking-Verordnung sehen:

1. **"App muss in allen EU-Ländern verfügbar sein"**
   → Lösung: Aktivieren Sie alle EU-Länder in "Länder/Regionen"

2. **"Zahlungsmethoden müssen für alle EU-Länder verfügbar sein"**
   → Lösung: Prüfen Sie "Zahlungsmethoden" und aktivieren Sie alle EU-Länder

3. **"Geografische Beschränkungen müssen gerechtfertigt sein"**
   → Lösung: Prüfen Sie Ihren Code und Store-Listing auf ungerechtfertigte Beschränkungen

---

**📅 Letzte Aktualisierung:** $(date)
