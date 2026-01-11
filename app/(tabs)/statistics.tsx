import { View, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRewards } from '@/hooks/useRewards';
import { adTrackerService } from '@/lib/ads/ad-tracker';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { AppHeader } from '@/components/ui/app-header';

export default function StatisticsScreen() {
  const { user } = useAuth();
  const { summary } = useRewards();
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    averageReward: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const totalViews = await adTrackerService.getTotalAdViewsCount(user.id);
    const todayViews = await adTrackerService.getTodayAdViewsCount(user.id);
    const allViews = await adTrackerService.getUserAdViews(user.id);
    const averageReward =
      allViews.length > 0
        ? allViews.reduce((sum, view) => sum + view.rewardEarned, 0) / allViews.length
        : 0;

    setStats({
      totalViews,
      todayViews,
      averageReward,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="h1" className="mb-6 text-white">
          Statistiken
        </Text>

        <View className="gap-4">
          <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <CardHeader>
              <CardTitle>
                <Text variant="h3" className="text-white">Gesamt</Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <View className="flex-row items-baseline gap-2 mb-4">
                <Text variant="h1" className="text-purple-400">
                  {stats.totalViews}
                </Text>
                <Text variant="p" className="text-gray-400">
                  Kampagnen unterstützt
                </Text>
              </View>
              {summary && (
                <Text variant="h3" className="text-purple-400">
                  {formatCurrency(summary.totalEarned)} erhalten
                </Text>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <CardHeader>
              <CardTitle>
                <Text variant="h3" className="text-white">Heute</Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <View className="flex-row items-baseline gap-2 mb-4">
                <Text variant="h1" className="text-purple-400">
                  {stats.todayViews}
                </Text>
                <Text variant="p" className="text-gray-400">
                  Kampagnen
                </Text>
              </View>
              {summary && (
                <Text variant="h3" className="text-purple-400">
                  {formatCurrency(summary.today)} erhalten
                </Text>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <CardHeader>
              <CardTitle>
                <Text variant="h3" className="text-white">Durchschnitt</Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Text variant="h2" className="text-purple-400 mb-2">
                {formatCurrency(stats.averageReward)}
              </Text>
              <Text variant="p" className="text-gray-400">
                Pro Kampagne
              </Text>
            </CardContent>
          </Card>

          {summary && (
            <>
              <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <CardHeader>
                  <CardTitle>
                    <Text variant="h3" className="text-white">Diese Woche</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Text variant="h2" className="text-purple-400">
                    {formatCurrency(summary.thisWeek)}
                  </Text>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <CardHeader>
                  <CardTitle>
                    <Text variant="h3" className="text-white">Dieser Monat</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Text variant="h2" className="text-purple-400">
                    {formatCurrency(summary.thisMonth)}
                  </Text>
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


