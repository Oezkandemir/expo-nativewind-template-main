# 📊 Datenbank-Analyse - Kampagnen & Profil Features

**Datum:** 10. Januar 2026  
**Analyse:** Überprüfung der Datenbankstruktur für Kampagnen-History und Profil-Statistiken

---

## ✅ Vorhandene Tabellen (Supabase)

### 1. **users**
- ✅ Speichert Benutzerprofile
- ✅ Enthält: `id`, `email`, `name`, `interests`, `demographics`, `preferences`
- ✅ RLS aktiviert

### 2. **ad_views** 
- ✅ Trackt alle Kampagnen-Views
- ✅ Enthält: `user_id`, `campaign_id`, `ad_slot_id`, `video_url`
- ✅ Enthält: `watched_duration`, `completed`, `reward_earned`
- ✅ Enthält: `viewed_at`, `created_at`
- ✅ RLS aktiviert
- **✅ PERFEKT FÜR KAMPAGNEN-HISTORY!**

### 3. **rewards**
- ✅ Trackt alle Rewards/Guthaben
- ✅ Enthält: `user_id`, `amount`, `type`, `source`, `description`
- ✅ Enthält: `ad_view_id` (Referenz zu ad_views)
- ✅ Enthält: `status` (earned, pending, paid)
- ✅ Enthält: `created_at`
- ✅ RLS aktiviert
- **✅ PERFEKT FÜR GUTHABEN-TRACKING!**

### 4. **user_stats**
- ✅ Tägliche Statistiken pro User
- ✅ Enthält: `user_id`, `date`, `ads_watched`, `ads_completed`
- ✅ Enthält: `rewards_earned`
- ✅ RLS aktiviert
- **✅ PERFEKT FÜR STATISTIKEN!**

### 5. **user_total_rewards** (View)
- ✅ Aggregierte View für Gesamtguthaben
- ✅ Enthält: `user_id`, `total_earned`, `total_rewards`, `last_reward_at`
- **✅ PERFEKT FÜR PROFIL-ANZEIGE!**

---

## 🔍 Aktuelle Implementierung

### ✅ Was bereits funktioniert:

1. **Kampagnen-History** (`app/(tabs)/history.tsx`)
   - ✅ Zeigt Ad-Views aus `ad_views` Tabelle
   - ✅ Filter: 7, 30, 90 Tage
   - ✅ Zeigt: Kampagne, Datum, Dauer, Reward
   - ✅ Verified-Status wird angezeigt
   - ✅ Nutzt `AdContext.getViewsByDateRange()`

2. **Ad Tracking** (`lib/ads/ad-tracker.ts`)
   - ✅ `recordAdView()` - Speichert View in lokalen Storage
   - ✅ `getTodayAdViews()` - Holt heutige Views
   - ✅ `getAdViewsByDateRange()` - Holt Views für Zeitraum
   - ✅ `getUserAdViews()` - Holt alle Views eines Users
   - ⚠️ **PROBLEM: Nutzt AsyncStorage statt Supabase!**

3. **Rewards Tracking** (`lib/rewards/reward-service.ts`)
   - ✅ `createRewardFromAdView()` - Erstellt Reward nach View
   - ✅ `getUserRewards()` - Holt alle Rewards
   - ✅ `getRewardHistory()` - Holt Reward-Historie
   - ⚠️ **PROBLEM: Nutzt AsyncStorage statt Supabase!**

4. **Ad Context** (`contexts/AdContext.tsx`)
   - ✅ `completeAdView()` - Erstellt AdView + Reward
   - ✅ `getTodayViews()` - Delegiert an ad-tracker
   - ✅ `getViewsByDateRange()` - Delegiert an ad-tracker
   - ✅ Integriert Reward-Service
   - ⚠️ **PROBLEM: Nutzt lokale Services statt Supabase!**

---

## ⚠️ Kritische Probleme

### 1. **Doppelte Datenhaltung**
- ❌ Ad-Views werden in **AsyncStorage** gespeichert
- ❌ Rewards werden in **AsyncStorage** gespeichert
- ✅ Supabase-Tabellen existieren, werden aber **nicht genutzt**
- **Risiko:** Datenverlust, Inkonsistenz, keine Multi-Device-Sync

### 2. **Profil zeigt keine Statistiken**
- ❌ `app/(tabs)/profile.tsx` zeigt **kein Guthaben**
- ❌ `app/(tabs)/profile.tsx` zeigt **keine Kampagnen-Anzahl**
- ✅ Daten sind in Supabase vorhanden (`user_total_rewards` View)
- ✅ Queries können einfach hinzugefügt werden

### 3. **History nutzt lokale Daten**
- ❌ `app/(tabs)/history.tsx` zeigt nur AsyncStorage-Daten
- ✅ Supabase `ad_views` Tabelle hat alle Daten
- ✅ Kann leicht auf Supabase umgestellt werden

---

## 🎯 Empfohlene Maßnahmen

### PHASE 1: Services auf Supabase umstellen (KRITISCH)

#### 1.1 `lib/ads/ad-tracker.ts` erweitern
```typescript
// NEU: Supabase-Methoden hinzufügen
async recordAdViewToSupabase(view: AdViewData): Promise<void> {
  const { data, error } = await supabase
    .from('ad_views')
    .insert({
      user_id: view.userId,
      ad_slot_id: view.slotId,
      campaign_id: view.campaignId,
      video_url: view.videoUrl,
      watched_duration: view.duration,
      completed: view.verified,
      reward_earned: view.rewardEarned,
    });
  
  if (error) throw error;
}

async getAdViewsFromSupabase(userId: string, days?: number): Promise<AdView[]> {
  let query = supabase
    .from('ad_views')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });
  
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    query = query.gte('viewed_at', cutoff.toISOString());
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data;
}
```

#### 1.2 `lib/rewards/reward-service.ts` erweitern
```typescript
// NEU: Supabase-Methoden hinzufügen
async createRewardInSupabase(
  userId: string,
  amount: number,
  adViewId: string
): Promise<void> {
  const { error } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      amount,
      type: 'ad_view',
      description: 'Kampagne unterstützt',
      ad_view_id: adViewId,
    });
  
  if (error) throw error;
}

async getUserTotalRewards(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_total_rewards')
    .select('total_earned')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data?.total_earned || 0;
}

async getUserRewardsFromSupabase(userId: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

#### 1.3 `contexts/AdContext.tsx` aktualisieren
```typescript
// In completeAdView():
// ALT: await adTrackerService.recordAdView(...)
// NEU: await adTrackerService.recordAdViewToSupabase(...)

// ALT: await rewardService.createRewardFromAdView(...)
// NEU: await rewardService.createRewardInSupabase(...)
```

### PHASE 2: Profil-Statistiken hinzufügen

#### 2.1 Neuen Hook erstellen: `hooks/useProfile.ts`
```typescript
export function useProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalCampaigns: 0,
    completedCampaigns: 0,
    loading: true,
  });

  useEffect(() => {
    loadProfileStats();
  }, [user]);

  const loadProfileStats = async () => {
    if (!user) return;

    // Get total balance from view
    const { data: rewardData } = await supabase
      .from('user_total_rewards')
      .select('total_earned')
      .eq('user_id', user.id)
      .single();

    // Get campaign count
    const { count: totalCount } = await supabase
      .from('ad_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get completed campaign count
    const { count: completedCount } = await supabase
      .from('ad_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    setStats({
      totalBalance: rewardData?.total_earned || 0,
      totalCampaigns: totalCount || 0,
      completedCampaigns: completedCount || 0,
      loading: false,
    });
  };

  return { stats, refreshStats: loadProfileStats };
}
```

#### 2.2 Profil-Screen erweitern: `app/(tabs)/profile.tsx`
```typescript
// Importieren
import { useProfile } from '@/hooks/useProfile';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { TrendingUp, Award } from 'lucide-react-native';

// Im Component
const { stats } = useProfile();

// Neue Card hinzufügen (nach Personal Information Card):
<Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: '#1E293B' }}>
  <CardHeader className="pb-3">
    <CardTitle>
      <View className="flex-row items-center gap-2">
        <TrendingUpIcon className="w-4 h-4 text-purple-500" />
        <Text variant="h3" className="text-purple-400 font-semibold">
          Statistiken
        </Text>
      </View>
    </CardTitle>
  </CardHeader>
  <CardContent className="gap-4">
    {/* Guthaben */}
    <View className="flex-row items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
      <View>
        <Text variant="small" className="text-gray-400 mb-1">
          Aktuelles Guthaben
        </Text>
        <Text variant="h2" className="text-purple-400 font-bold">
          {formatCurrency(stats.totalBalance)}
        </Text>
      </View>
      <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
        <TrendingUpIcon className="w-6 h-6 text-purple-400" />
      </View>
    </View>

    {/* Kampagnen */}
    <View className="flex-row gap-3">
      <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
        <Text variant="small" className="text-gray-400 mb-1">
          Gesehen
        </Text>
        <Text variant="h3" className="text-white font-bold">
          {stats.totalCampaigns}
        </Text>
      </View>
      <View className="flex-1 p-3 rounded-lg border" style={{ borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
        <Text variant="small" className="text-gray-400 mb-1">
          Abgeschlossen
        </Text>
        <Text variant="h3" className="text-green-400 font-bold">
          {stats.completedCampaigns}
        </Text>
      </View>
    </View>
  </CardContent>
</Card>
```

### PHASE 3: History auf Supabase umstellen

#### 3.1 `app/(tabs)/history.tsx` aktualisieren
```typescript
// ALT: const { getViewsByDateRange } = useAds();
// NEU: Direkt Supabase nutzen

const loadHistory = async () => {
  if (!user) return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - selectedRange);
  
  const { data, error } = await supabase
    .from('ad_views')
    .select('*')
    .eq('user_id', user.id)
    .gte('viewed_at', cutoffDate.toISOString())
    .order('viewed_at', { ascending: false });
  
  if (!error && data) {
    setViews(data);
  }
};
```

---

## 📋 Implementierungs-Checkliste

### Sofort (KRITISCH):
- [ ] `lib/ads/ad-tracker.ts` - Supabase-Methoden hinzufügen
- [ ] `lib/rewards/reward-service.ts` - Supabase-Methoden hinzufügen
- [ ] `contexts/AdContext.tsx` - Auf Supabase umstellen
- [ ] Migration: Bestehende AsyncStorage-Daten nach Supabase übertragen

### Hoch (Features):
- [ ] `hooks/useProfile.ts` - Neuen Hook erstellen
- [ ] `app/(tabs)/profile.tsx` - Statistiken-Card hinzufügen
- [ ] `app/(tabs)/history.tsx` - Auf Supabase umstellen

### Mittel (Optimierung):
- [ ] AsyncStorage-Code als Fallback behalten (offline-first)
- [ ] Sync-Mechanismus für offline → online
- [ ] Error-Handling für Supabase-Queries verbessern

### Niedrig (Nice-to-have):
- [ ] Real-time Updates via Supabase Subscriptions
- [ ] Caching-Layer für bessere Performance
- [ ] Pagination für große History-Listen

---

## 🎉 Zusammenfassung

### ✅ Gute Nachrichten:
1. **Alle benötigten Tabellen existieren bereits!**
2. Die Datenbankstruktur ist gut durchdacht
3. RLS ist aktiviert und sicher konfiguriert
4. Views für Aggregationen sind vorhanden

### ⚠️ Probleme:
1. **Services nutzen AsyncStorage statt Supabase**
2. Daten werden lokal statt zentral gespeichert
3. Profil zeigt keine Statistiken

### 🚀 Lösung:
1. Services auf Supabase umstellen (2-3 Stunden Arbeit)
2. Profil-Statistiken hinzufügen (1 Stunde)
3. History auf Supabase umstellen (30 Minuten)

**Gesamtaufwand: ~4 Stunden**  
**Resultat: Vollständig funktionsfähiges System mit Cloud-Sync!**

---

## 📞 Nächste Schritte

1. **Entscheidung:** Sofort umstellen oder AsyncStorage als Fallback behalten?
2. **Migration:** Bestehende Daten migrieren?
3. **Testing:** Testplan für Supabase-Integration?

**Empfehlung:** Sofort mit Phase 1 starten, dann Phase 2 & 3.
