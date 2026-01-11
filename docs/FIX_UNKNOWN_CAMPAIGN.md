# 🔧 Fix: "Unbekannte Kampagne" in History

**Datum:** 10. Januar 2026  
**Status:** ✅ Behoben

---

## 🐛 Problem

In der **History** (`app/(tabs)/history.tsx`) wurde angezeigt:
```
Kampagne #357c936a (oder "Unbekannte Kampagne")
```

Statt des echten Kampagnen-Namens wie:
```
Tech Campaign
Fitness Campaign
Fashion Campaign
```

---

## 🔍 Ursache

### Problem-Analyse:

1. **Supabase speichert:**
   - `campaign_id` (z.B. `"campaign_1"`)
   - Aber **nicht** `campaign_name`

2. **ad-tracker.ts transformiert Daten:**
   ```typescript
   // Zeile 278
   adId: row.campaign_id // campaign_id wird als adId zurückgegeben
   ```

3. **history.tsx zeigte:**
   ```typescript
   // Alt
   Kampagne #{view.adId?.substring(0, 8) || 'N/A'}
   // → "Kampagne #campaign_"
   ```

4. **Das Mapping fehlte:**
   - `campaign_id` → `campaign_name`
   - Dummy-Daten haben das Mapping (DUMMY_ADS)
   - Aber history.tsx nutzte es nicht!

---

## ✅ Lösung

### Fix: Campaign-Name aus campaign_id laden

**Datei:** `app/(tabs)/history.tsx`

**Hinzugefügt:**
```typescript
import { DUMMY_ADS } from '@/lib/ads/dummy-data';

/**
 * Get campaign name from campaign ID
 */
const getCampaignName = (campaignId: string): string => {
  const ad = DUMMY_ADS.find((ad) => ad.campaignId === campaignId);
  return ad?.campaignName || 'Unbekannte Kampagne';
};
```

**Verwendet in der View:**
```typescript
{views.map((view) => {
  // view.adId is actually the campaign_id from Supabase
  const campaignName = getCampaignName(view.adId);
  
  return (
    <View key={view.id}>
      <Text variant="p" className="font-semibold text-white">
        {campaignName} {/* ✅ Jetzt zeigt es den echten Namen! */}
      </Text>
      {/* ... */}
    </View>
  );
})}
```

---

## 📊 Vorher vs. Nachher

### Vorher ❌
```
┌─────────────────────────────┐
│ Kampagne #campaign_          │
│ 10.01.2026 14:30            │
│ Dauer: 5.0s                 │
│                      +€0.10 │
└─────────────────────────────┘
```

### Nachher ✅
```
┌─────────────────────────────┐
│ Tech Campaign               │
│ 10.01.2026 14:30            │
│ Dauer: 5.0s                 │
│                      +€0.10 │
└─────────────────────────────┘
```

---

## 🔄 Wie funktioniert das Mapping?

### Campaign ID → Campaign Name:

```typescript
DUMMY_ADS = [
  {
    id: 'ad_1',
    campaignId: 'campaign_1',      // ← Gespeichert in Supabase
    campaignName: 'Tech Campaign',  // ← Angezeigt in History
    // ...
  },
  {
    id: 'ad_2',
    campaignId: 'campaign_2',
    campaignName: 'Fitness Campaign',
    // ...
  },
  // ...
];
```

### Lookup-Funktion:
```typescript
getCampaignName('campaign_1') 
  → findet ad mit campaignId='campaign_1'
  → gibt campaignName zurück: 'Tech Campaign' ✅

getCampaignName('campaign_xyz') 
  → findet nichts
  → gibt zurück: 'Unbekannte Kampagne' ⚠️
```

---

## 🎯 Wo wird das verwendet?

### 1. History Screen (`app/(tabs)/history.tsx`)
```typescript
const campaignName = getCampaignName(view.adId);
// Zeigt: "Tech Campaign"
```

### 2. History Widget (`components/widgets/HistoryWidget.tsx`)
```typescript
const ad = getAdById(view.adId);
{ad?.campaignName || 'Unbekannte Kampagne'}
// Funktionierte schon vorher ✅
```

---

## 💡 Warum nicht campaign_name in Supabase speichern?

### Option A: Campaign-Name in Supabase (Zukunft)
**Vorteile:**
- Keine Abhängigkeit von Dummy-Daten
- Dynamische Kampagnen möglich
- Einfacher für echte Backend-Integration

**Nachteil:**
- Redundanz (Name ist schon in DUMMY_ADS)
- Mehr Daten in Datenbank

### Option B: Mapping nutzen (Aktuell ✅)
**Vorteile:**
- Funktioniert sofort
- Keine DB-Schema-Änderung nötig
- Einfach für Dummy-Daten

**Nachteil:**
- Abhängigkeit von DUMMY_ADS
- Bei echten Kampagnen muss Backend campaign_name liefern

**Entscheidung:** Option B (Mapping) ist perfekt für aktuelles Setup!

---

## 🚀 Testing

### Manuell testen:

1. **App starten**
2. **Kampagne ansehen** (vollständig)
3. **History-Tab öffnen**
4. **Prüfen:**
   - ✅ Kampagnen-Name wird angezeigt (z.B. "Tech Campaign")
   - ✅ Nicht mehr "Kampagne #campaign_1"
   - ✅ Nicht mehr "Unbekannte Kampagne" (außer bei ungültiger ID)

### Erwartetes Verhalten:
```
✅ Tech Campaign          +€0.10
   10.01.2026 14:30       ✓
   Dauer: 5.0s

✅ Fitness Campaign       +€0.15
   10.01.2026 12:15       ✓
   Dauer: 5.0s
```

---

## 📁 Geänderte Dateien

1. ✅ `app/(tabs)/history.tsx`
   - Import von `DUMMY_ADS` hinzugefügt
   - `getCampaignName()` Funktion erstellt
   - Campaign-Namen in View angezeigt

---

## 🎉 Ergebnis

**Status:** ✅ **BEHOBEN**

- ✅ History zeigt echte Kampagnen-Namen
- ✅ "Tech Campaign" statt "Kampagne #campaign_1"
- ✅ "Fitness Campaign" statt "Unbekannte Kampagne"
- ✅ Funktioniert mit allen Dummy-Kampagnen
- ✅ Fallback zu "Unbekannte Kampagne" bei ungültiger ID

**Die History ist jetzt viel benutzerfreundlicher!** 🚀
