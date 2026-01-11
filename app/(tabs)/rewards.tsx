import { View, ScrollView, RefreshControl, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRewards } from '@/hooks/useRewards';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { Wallet, TrendingUp, Clock, CheckCircle2, XCircle, Loader } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { AppHeader } from '@/components/ui/app-header';

const WalletIcon = iconWithClassName(Wallet);
const TrendingUpIcon = iconWithClassName(TrendingUp);
const ClockIcon = iconWithClassName(Clock);
const CheckCircleIcon = iconWithClassName(CheckCircle2);
const XCircleIcon = iconWithClassName(XCircle);
const LoaderIcon = iconWithClassName(Loader);

export default function RewardsScreen() {
  const { summary, recentRewards, payouts, refreshSummary, refreshRewards } =
    useRewards();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSummary(), refreshRewards()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      <AppHeader />
      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="mb-6">
            <Text variant="h1" className="mb-2 font-bold text-white">
              Belohnungen
            </Text>
            <Text variant="small" className="text-gray-400">
              Ihre Belohnungen und Auszahlungen
            </Text>
          </View>

        {/* Summary Cards */}
        {summary && (
          <View className="gap-4 mb-6">
            <Card className="overflow-hidden" style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              borderWidth: 2,
              borderColor: 'rgba(139, 92, 246, 0.3)',
            }}>
              <CardContent className="pt-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <WalletIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <Text variant="small" className="text-purple-400 font-semibold uppercase tracking-wide">
                    Gesamt erhalten
                  </Text>
                </View>
                <Text variant="h1" className="text-purple-300 mb-4 font-bold">
                  {formatCurrency(summary.totalEarned)}
                </Text>
                <View className="flex-row gap-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <View className="flex-1 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <Text variant="small" className="text-green-400 font-medium mb-1">
                      Heute
                    </Text>
                    <Text variant="h4" className="text-green-300 font-bold">
                      {formatCurrency(summary.today)}
                    </Text>
                  </View>
                  <View className="flex-1 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Text variant="small" className="text-blue-400 font-medium mb-1">
                      Diese Woche
                    </Text>
                    <Text variant="h4" className="text-blue-300 font-bold">
                      {formatCurrency(summary.thisWeek)}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Card className="overflow-hidden" style={{ 
              backgroundColor: 'rgba(251, 146, 60, 0.05)',
              borderWidth: 2,
              borderColor: 'rgba(251, 146, 60, 0.3)',
            }}>
              <CardContent className="pt-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-orange-400" />
                  <Text variant="small" className="text-orange-400 font-semibold uppercase tracking-wide">
                    Ausstehend
                  </Text>
                </View>
                <Text variant="h2" className="text-orange-300 mb-2 font-bold">
                  {formatCurrency(summary.totalPending)}
                </Text>
                <Text variant="small" className="text-gray-400">
                  Verfügbar für Auszahlung
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Recent Rewards */}
        <Card className="mb-4 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-green-500" />
                <Text variant="h3" className="text-green-400 font-semibold">
                  Letzte Belohnungen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRewards.length > 0 ? (
              <View className="gap-2.5">
                {recentRewards.map((reward) => (
                  <View
                    key={reward.id}
                    className="flex-row items-center gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <View className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </View>
                    <View className="flex-1">
                      <Text variant="p" className="font-semibold mb-0.5">
                        {reward.description || 'Kampagne unterstützt'}
                      </Text>
                      <Text variant="small" className="text-gray-400">
                        {new Date(reward.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text variant="h4" className="text-green-400 font-bold mb-1">
                        +{formatCurrency(reward.amount)}
                      </Text>
                      <View className="px-2 py-0.5 rounded-full" style={{
                        backgroundColor: reward.status === 'earned' 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(107, 114, 128, 0.2)',
                      }}>
                        <Text variant="small" className="font-medium" style={{
                          color: reward.status === 'earned' ? '#22C55E' : '#6B7280',
                        }}>
                          {reward.status === 'earned' ? 'Verdient' : 'Ausstehend'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-5xl mb-3">💰</Text>
                <Text variant="p" className="text-gray-400 text-center mb-1">
                  Noch keine Belohnungen erhalten
                </Text>
                <Text variant="small" className="text-muted-foreground text-center">
                  Unterstützen Sie Kampagnen, um Belohnungen zu erhalten
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Payouts */}
        {payouts.length > 0 && (
          <Card className="overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', backgroundColor: '#1E293B' }}>
            <CardHeader className="pb-3">
              <CardTitle>
                <View className="flex-row items-center gap-2">
                  <WalletIcon className="w-4 h-4 text-blue-500" />
                  <Text variant="h3" className="text-blue-400 font-semibold">
                    Auszahlungen
                  </Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View className="gap-2.5">
                {payouts.map((payout) => (
                  <View
                    key={payout.id}
                    className="flex-row items-center gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: payout.status === 'completed' 
                        ? 'rgba(34, 197, 94, 0.05)' 
                        : payout.status === 'pending'
                        ? 'rgba(251, 146, 60, 0.05)'
                        : 'rgba(239, 68, 68, 0.05)',
                      borderWidth: 1,
                      borderColor: payout.status === 'completed' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : payout.status === 'pending'
                        ? 'rgba(251, 146, 60, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <View className="w-10 h-10 rounded-lg items-center justify-center" style={{
                      backgroundColor: payout.status === 'completed' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : payout.status === 'pending'
                        ? 'rgba(251, 146, 60, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                    }}>
                      {payout.status === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      ) : payout.status === 'pending' ? (
                        <LoaderIcon className="w-5 h-5 text-orange-400" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-400" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text variant="p" className="font-semibold mb-0.5 text-white">
                        {formatCurrency(payout.amount)}
                      </Text>
                      <Text variant="small" className="text-gray-400">
                        {new Date(payout.requestedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View className="px-3 py-1 rounded-full" style={{
                      backgroundColor: payout.status === 'completed' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : payout.status === 'pending'
                        ? 'rgba(251, 146, 60, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                    }}>
                      <Text variant="small" className="font-medium" style={{
                        color: payout.status === 'completed' 
                          ? '#22C55E' 
                          : payout.status === 'pending'
                          ? '#F97316'
                          : '#EF4444',
                      }}>
                        {payout.status === 'completed' ? 'Abgeschlossen' : payout.status === 'pending' ? 'Ausstehend' : 'Fehlgeschlagen'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}


