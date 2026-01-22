import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';
import { useAds } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { cn } from '@/components/ui/utils/cn';
import { AppHeader } from '@/components/ui/app-header';
import { supabase } from '@/lib/supabase/client';
import { campaignService } from '@/lib/ads/campaign-service';

type TimeRange = 7 | 30 | 90;

interface AdViewWithCampaign {
  id: string;
  adId: string;
  watchedAt: string;
  duration: number;
  rewardEarned: number;
  verified: boolean;
  campaignName?: string;
  campaignTitle?: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const { getViewsByDateRange } = useAds();
  const insets = useSafeAreaInsets();
  const [views, setViews] = useState<AdViewWithCampaign[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(7);

  // Reload when screen comes into focus to ensure fresh data
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user, selectedRange])
  );

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedRange]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      // Get views from ad_views table with campaign data via JOIN
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange);

      // First, get all ad_views without JOIN to avoid RLS issues
      // Add cache-busting by using a timestamp parameter
      const cacheBuster = Date.now();
      const { data, error } = await supabase
        .from('ad_views')
        .select(`
          id,
          campaign_id,
          campaign_id_uuid,
          viewed_at,
          watched_duration,
          reward_earned,
          completed
        `)
        .eq('user_id', user.id)
        .gte('viewed_at', cutoffDate.toISOString())
        .order('viewed_at', { ascending: false })
        .limit(1000); // Add limit to avoid caching issues

      if (error) {
        console.error('Error loading history:', error);
        // Fallback to local data if Supabase fails
        const rangeViews = await getViewsByDateRange(selectedRange);
        rangeViews.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
        setViews(rangeViews);
        return;
      }

      // Map to AdViewWithCampaign format and load campaign names directly
      const mappedViews: AdViewWithCampaign[] = await Promise.all((data || []).map(async (view: any) => {
        // Get campaign ID (prefer UUID, fallback to campaign_id)
        const campaignId = view.campaign_id_uuid || view.campaign_id;
        
        let campaignName = 'Unbekannte Kampagne';
        let campaignTitle: string | undefined;
        
        // Always fetch campaign directly to ensure we get the name
        if (campaignId) {
          try {
            // Try direct Supabase query first (bypasses service layer for better error handling)
            // Query campaigns directly to avoid cache issues
            const { data: campaignData, error: campaignError } = await supabase
              .from('campaigns')
              .select('name, title')
              .eq('id', campaignId)
              .maybeSingle();
            
            if (!campaignError && campaignData) {
              // Use name if available, otherwise use title
              const data = campaignData as { name?: string; title?: string };
              campaignName = data.name || data.title || 'Unbekannte Kampagne';
              campaignTitle = data.title;
            } else {
              // Fallback: try campaign service methods
              // Try getCampaignName first (simpler, faster)
              const fetchedName = await campaignService.getCampaignName(campaignId);
              if (fetchedName && fetchedName !== 'Unbekannte Kampagne') {
                campaignName = fetchedName;
              } else {
                // Last resort: try getCampaignById
                const fetchedCampaign = await campaignService.getCampaignById(campaignId);
                if (fetchedCampaign) {
                  campaignName = fetchedCampaign.campaignName || fetchedCampaign.title || 'Unbekannte Kampagne';
                  campaignTitle = fetchedCampaign.title;
                }
              }
            }
          } catch (error) {
            console.error('Error fetching campaign name for', campaignId, ':', error);
            // Keep default "Unbekannte Kampagne"
          }
        }
        
        return {
          id: view.id,
          adId: campaignId,
          watchedAt: view.viewed_at,
          duration: view.watched_duration || 0,
          rewardEarned: Number(view.reward_earned) || 0,
          verified: view.completed || false,
          campaignName: campaignName,
          campaignTitle: campaignTitle,
        };
      }));

      setViews(mappedViews);
    } catch (error) {
      console.error('Error in loadHistory:', error);
      // Fallback to original method
      const rangeViews = await getViewsByDateRange(selectedRange);
      rangeViews.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
      setViews(rangeViews);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case 7:
        return '7 Tage';
      case 30:
        return '30 Tage';
      case 90:
        return '3 Monate';
      default:
        return '7 Tage';
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom }}
        style={{ backgroundColor: '#0F172A' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="h1" className="mb-6 text-white">
          Verlauf
        </Text>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          {([7, 30, 90] as TimeRange[]).map((range) => (
            <Pressable
              key={range}
              onPress={() => setSelectedRange(range)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md border',
                selectedRange === range
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
              )}
            >
              <Text
                variant="small"
                className={cn(
                  'text-center font-semibold',
                  selectedRange === range ? 'text-primary-foreground' : 'text-foreground'
                )}
              >
                {getRangeLabel(range)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <CardHeader>
            <CardTitle>
              <Text variant="h3">Kampagnen - {getRangeLabel(selectedRange)}</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {views.length > 0 ? (
              <View className="gap-3">
                {views.map((view) => {
                  return (
                    <View
                      key={view.id}
                      className="flex-row items-center justify-between p-3 border rounded-lg border-border"
                    >
                      <View className="flex-1">
                        <Text variant="p" className="font-semibold text-white">
                          {view.campaignName || 'Unbekannte Kampagne'}
                        </Text>
                        <Text variant="small" className="text-gray-400">
                          {new Date(view.watchedAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}{' '}
                          {new Date(view.watchedAt).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text variant="small" className="text-muted-foreground">
                          Dauer: {view.duration.toFixed(1)}s
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text variant="h4" className="text-purple-400">
                          +{formatCurrency(view.rewardEarned)}
                        </Text>
                        <Badge variant={view.verified ? 'default' : 'secondary'}>
                          <Text variant="small">{view.verified ? 'Verifiziert' : 'Unvollständig'}</Text>
                        </Badge>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text variant="p" className="text-gray-400 text-center py-4">
                Keine Kampagnen in diesem Zeitraum unterstützt
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}


