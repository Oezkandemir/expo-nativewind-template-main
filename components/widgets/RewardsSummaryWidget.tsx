import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRewards } from '@/hooks/useRewards';
import { formatCurrency } from '@/lib/rewards/reward-calculator';
import { Wallet, ArrowRight, Clock } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { Animated } from 'react-native';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

const WalletIcon = iconWithClassName(Wallet);
const ArrowRightIcon = iconWithClassName(ArrowRight);
const ClockIcon = iconWithClassName(Clock);

interface RewardsSummaryWidgetProps {
  className?: string;
}

export function RewardsSummaryWidget({ className }: RewardsSummaryWidgetProps) {
  const router = useRouter();
  const { summary, loading } = useRewards();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // All hooks must be called before any early returns
  const pendingAmount = useMemo(() => summary?.totalPending || 0, [summary?.totalPending]);
  const thisWeek = useMemo(() => summary?.thisWeek || 0, [summary?.thisWeek]);
  const canRequestPayout = useMemo(() => pendingAmount >= 10, [pendingAmount]); // Minimum payout threshold

  const handleViewRewards = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/rewards');
  }, [router]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, fadeAnim, slideAnim]);

  if (loading) {
    return (
      <Card className={className} style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        <CardContent className="p-4">
          <View className="py-6 items-center justify-center">
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text variant="small" className="text-gray-400 mt-2">
              Lade Belohnungen...
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Pressable
      onPress={handleViewRewards}
      onPressIn={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Card
        className={className}
        style={{
          backgroundColor: '#1E293B',
          borderWidth: 2,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          overflow: 'hidden',
        }}
      >
        <CardContent className="p-5">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                >
                  <WalletIcon className="w-5 h-5 text-purple-400" />
                </View>
                <Text variant="h4" className="text-white font-semibold" style={{ fontSize: 18 }}>
                  Belohnungen
                </Text>
              </View>
              <ArrowRightIcon className="w-5 h-5 text-purple-400" />
            </View>

            {/* Stats Grid */}
            <View className="flex-row gap-3 mb-4">
              {/* Pending Amount */}
              <View
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor: canRequestPayout
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(251, 146, 60, 0.1)',
                  borderWidth: 1,
                  borderColor: canRequestPayout
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(251, 146, 60, 0.3)',
                }}
              >
                <View className="flex-row items-center gap-1.5 mb-1">
                  <ClockIcon className="w-3 h-3" color={canRequestPayout ? '#22C55E' : '#F97316'} />
                  <Text variant="small" className="text-gray-400" style={{ fontSize: 10 }}>
                    Ausstehend
                  </Text>
                </View>
                <Text
                  variant="h3"
                  className="font-bold"
                  style={{
                    color: canRequestPayout ? '#22C55E' : '#F97316',
                    fontSize: 18,
                  }}
                >
                  {formatCurrency(pendingAmount)}
                </Text>
                {canRequestPayout && (
                  <Text variant="small" className="text-green-400 mt-1" style={{ fontSize: 10 }}>
                    Auszahlbar
                  </Text>
                )}
              </View>

              {/* This Week */}
              <View
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                }}
              >
                <Text variant="small" className="text-gray-400 mb-1" style={{ fontSize: 10 }}>
                  Diese Woche
                </Text>
                <Text variant="h3" className="font-bold text-blue-400" style={{ fontSize: 18 }}>
                  {formatCurrency(thisWeek)}
                </Text>
              </View>
            </View>

            {/* Call to Action */}
            <View
              className="p-3 rounded-lg flex-row items-center justify-between"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.2)',
              }}
            >
              <Text variant="small" className="text-purple-300" style={{ fontSize: 12 }}>
                {canRequestPayout
                  ? 'Auszahlung verfügbar'
                  : `Noch ${formatCurrency(10 - pendingAmount)} bis zur Auszahlung`}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
              >
                <Text variant="small" className="text-white font-semibold" style={{ fontSize: 11 }}>
                  Ansehen
                </Text>
              </View>
            </View>
          </Animated.View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
