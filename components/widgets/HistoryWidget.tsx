import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { cn } from '@/components/ui/utils/cn';
import { useAds } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { campaignService } from '@/lib/ads/campaign-service';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { supabase } from '@/lib/supabase/client';
import { AdView } from '@/types/ad';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

type TimeRange = 7 | 30 | 90;

interface HistoryWidgetProps {
  className?: string;
}

export function HistoryWidget({ className }: HistoryWidgetProps) {
  const { user } = useAuth();
  const { getViewsByDateRange } = useAds();
  const [views, setViews] = useState<AdView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(7);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedRange]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load directly from Supabase to avoid cache issues
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange);

      const { data, error } = await supabase
        .from('ad_views')
        .select('id, campaign_id_uuid, campaign_id, viewed_at, watched_duration, reward_earned, completed')
        .eq('user_id', user.id)
        .gte('viewed_at', cutoffDate.toISOString())
        .order('viewed_at', { ascending: false })
        .limit(5); // Only need 5 for widget

      if (error) {
        console.error('Error loading history widget:', error);
        // Fallback to useAds hook
        const rangeViews = await getViewsByDateRange(selectedRange);
        rangeViews.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
        setViews(rangeViews.slice(0, 5));
      } else if (data) {
        // Transform to AdView format
        const transformedViews = data.map((view: any) => ({
          id: view.id,
          userId: user.id,
          adId: view.campaign_id_uuid || view.campaign_id,
          campaignId: view.campaign_id_uuid || view.campaign_id,
          slotId: '',
          watchedAt: view.viewed_at,
          duration: view.watched_duration || 0,
          rewardEarned: Number(view.reward_earned) || 0,
          verified: view.completed || false,
          date: view.viewed_at.split('T')[0],
        }));
        setViews(transformedViews);
      }
      
      // Load campaign names for all unique campaign IDs
      const uniqueCampaignIds = [...new Set((data || []).map((v: any) => v.campaign_id_uuid || v.campaign_id).filter(Boolean))];
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueCampaignIds.map(async (campaignId) => {
          try {
            // Try direct Supabase query first for fresh data
            const { data: campaignData, error: campaignError } = await supabase
              .from('campaigns')
              .select('name, title')
              .eq('id', campaignId)
              .maybeSingle();
            
            if (!campaignError && campaignData) {
              names[campaignId] = (campaignData as any).name || (campaignData as any).title || 'Unbekannte Kampagne';
            } else {
              // Fallback: try campaign service
              const campaign = await campaignService.getCampaignById(campaignId);
              if (campaign) {
                names[campaignId] = campaign.campaignName || campaign.title || 'Unbekannte Kampagne';
              } else {
                const name = await campaignService.getCampaignName(campaignId);
                names[campaignId] = name && name !== 'Unbekannte Kampagne' ? name : 'Unbekannte Kampagne';
              }
            }
          } catch (error) {
            console.error(`Error loading campaign name for ${campaignId}:`, error);
            names[campaignId] = 'Unbekannte Kampagne';
          }
        })
      );
      setCampaignNames(names);
    } catch (error) {
      console.error('Load history error:', error);
      setViews([]);
    } finally {
      setLoading(false);
    }
  };

  const getRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case 7:
        return '7 Tage';
      case 30:
        return '1 Monat';
      case 90:
        return '3 Monate';
      default:
        return '7 Tage';
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn('mb-4', className)} style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
      <CardHeader className="pb-3">
        <CardTitle>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📜</Text>
            <Text variant="h3" className="font-semibold text-purple-400">
              Kampagnen-Historie
            </Text>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          {([7, 30, 90] as TimeRange[]).map((range) => (
              <Pressable
                key={range}
                onPress={() => setSelectedRange(range)}
                style={[
                  {
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                  },
                  selectedRange === range
                    ? {
                        backgroundColor: '#8B5CF6',
                        borderColor: '#8B5CF6',
                      }
                    : {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                      },
                ]}
              >
                <Text
                  variant="small"
                  style={[
                    {
                      textAlign: 'center',
                      fontWeight: '600',
                    },
                    selectedRange === range
                      ? { color: '#FFFFFF' }
                      : { color: '#A78BFA' },
                  ]}
                >
                  {getRangeLabel(range)}
                </Text>
              </Pressable>
          ))}
        </View>

        {/* History List */}
        {loading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text variant="small" className="text-gray-400 mt-2">
              Lade Historie...
            </Text>
          </View>
        ) : views.length > 0 ? (
          <View className="gap-2">
            {views.map((view) => {
              const campaignName = (view as any).adId ? campaignNames[(view as any).adId] || 'Unbekannte Kampagne' : 'Unbekannte Kampagne';
              return (
                <View
                  key={view.id}
                  className="flex-row items-center justify-between p-2.5 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(139, 92, 246, 0.1)',
                  }}
                >
                  <View className="flex-1 mr-2">
                    <Text variant="p" className="font-semibold text-sm text-white" numberOfLines={1}>
                      {campaignName}
                    </Text>
                    <Text variant="small" className="text-gray-400 text-xs" numberOfLines={1}>
                      {view.adId.substring(0, 8)}
                    </Text>
                    <Text variant="small" className="text-gray-400 text-xs mt-0.5">
                      {formatDateTime(view.watchedAt)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text variant="small" className="font-bold text-purple-400">
                      {formatCurrency(view.rewardEarned)}
                    </Text>
                    {view.verified && (
                      <View
                        className="mt-1 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                      >
                        <Text variant="small" className="text-green-400 text-xs">
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="py-6 items-center justify-center">
            <Text className="text-2xl mb-2">📭</Text>
            <Text variant="small" className="text-gray-400 text-center">
              Keine Kampagnen in diesem Zeitraum
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
