import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useRewards } from '@/hooks/useRewards';
import { useAds } from '@/hooks/useAds';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { TrendingUp, Wallet, PlayCircle, Flame } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { Animated } from 'react-native';

const TrendingUpIcon = iconWithClassName(TrendingUp);
const WalletIcon = iconWithClassName(Wallet);
const PlayCircleIcon = iconWithClassName(PlayCircle);
const FlameIcon = iconWithClassName(Flame);

interface QuickStatsWidgetProps {
  className?: string;
}

export function QuickStatsWidget({ className }: QuickStatsWidgetProps) {
  const { summary, loading: rewardsLoading } = useRewards();
  const { dailyStatus, getTodayViews, loading: adsLoading } = useAds();
  const [todayViewsCount, setTodayViewsCount] = useState(0);
  const [loadingViews, setLoadingViews] = useState(true);
  const [animatedValues] = useState({
    today: new Animated.Value(0),
    total: new Animated.Value(0),
    campaigns: new Animated.Value(0),
    streak: new Animated.Value(0),
  });

  const loadTodayViews = useCallback(async () => {
    try {
      const views = await getTodayViews();
      setTodayViewsCount(views.length);
    } catch (error) {
      console.error('Error loading today views:', error);
      // Fallback: count completed slots from dailyStatus
      if (dailyStatus) {
        const completedCount = dailyStatus.slots.filter(slot => slot.completed).length;
        setTodayViewsCount(completedCount);
      }
    } finally {
      setLoadingViews(false);
    }
  }, [getTodayViews, dailyStatus]);

  useEffect(() => {
    loadTodayViews();
  }, [loadTodayViews]);

  useEffect(() => {
    // Animate numbers when data loads
    if (!rewardsLoading && !loadingViews) {
      Animated.stagger(100, [
        Animated.timing(animatedValues.today, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.total, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.campaigns, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.streak, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [rewardsLoading, loadingViews]);

  const isLoading = rewardsLoading || loadingViews || adsLoading;

  // Calculate streak (consecutive days with at least one completed slot)
  // For now, we'll use 0 as streak is not tracked in DailyAdStatus
  const streak = useMemo(() => {
    // TODO: Implement streak tracking in DailyAdStatus or separate store
    return 0;
  }, [dailyStatus]);

  const stats = useMemo(() => [
    {
      label: 'Heute verdient',
      value: summary?.today || 0,
      formatted: formatCurrency(summary?.today || 0),
      icon: TrendingUpIcon,
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      animValue: animatedValues.today,
    },
    {
      label: 'Gesamt verdient',
      value: summary?.totalEarned || 0,
      formatted: formatCurrency(summary?.totalEarned || 0),
      icon: WalletIcon,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      animValue: animatedValues.total,
    },
    {
      label: 'Kampagnen heute',
      value: todayViewsCount,
      formatted: todayViewsCount.toString(),
      icon: PlayCircleIcon,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      animValue: animatedValues.campaigns,
    },
    {
      label: 'Tage Streak',
      value: streak,
      formatted: streak.toString(),
      icon: FlameIcon,
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      animValue: animatedValues.streak,
    },
  ], [summary?.today, summary?.totalEarned, todayViewsCount, streak, animatedValues]);

  if (isLoading) {
    return (
      <Card className={className} style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <CardContent className="p-4">
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text variant="small" className="text-gray-400 mt-2">
              Lade Statistiken...
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
      <CardContent className="p-4">
        <View className="flex-row flex-wrap gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Animated.View
                key={index}
                style={{
                  flex: 1,
                  minWidth: '47%',
                  opacity: stat.animValue,
                  transform: [
                    {
                      scale: stat.animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                }}
              >
                <View
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: stat.bgColor,
                    borderWidth: 1,
                    borderColor: stat.borderColor,
                  }}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" color={stat.color} />
                    <Text variant="small" className="text-gray-400" style={{ fontSize: 11 }}>
                      {stat.label}
                    </Text>
                  </View>
                  <Text
                    variant="h3"
                    className="font-bold"
                    style={{
                      color: stat.color,
                      fontSize: 20,
                    }}
                  >
                    {stat.formatted}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}
