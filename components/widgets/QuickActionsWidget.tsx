import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAds } from '@/hooks/useAds';
import { PlayCircle, TrendingUp, Wallet, BarChart3 } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { Animated } from 'react-native';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

const PlayCircleIcon = iconWithClassName(PlayCircle);
const TrendingUpIcon = iconWithClassName(TrendingUp);
const WalletIcon = iconWithClassName(Wallet);
const BarChartIcon = iconWithClassName(BarChart3);

interface QuickActionsWidgetProps {
  className?: string;
}

export function QuickActionsWidget({ className }: QuickActionsWidgetProps) {
  const router = useRouter();
  const { currentSlot, getAdForSlot } = useAds();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartCampaign = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Get a slot ID (use current slot or first available)
      const slotId = currentSlot?.id || 'slot_1';
      
      // Try to get an ad for this slot
      const ad = await getAdForSlot(slotId);
      
      if (ad) {
        router.push({
          pathname: '/(tabs)/ad-view',
          params: {
            slotId,
            autoStart: 'true',
          },
        });
      } else {
        // Navigate anyway, ad-view will handle no ad case
        router.push({
          pathname: '/(tabs)/ad-view',
          params: {
            slotId,
            autoStart: 'false',
          },
        });
      }
    } catch (error) {
      console.error('Error starting campaign:', error);
      // Navigate anyway
      router.push({
        pathname: '/(tabs)/ad-view',
        params: {
          slotId: currentSlot?.id || 'slot_1',
          autoStart: 'false',
        },
      });
    }
  }, [currentSlot, getAdForSlot, router]);

  const handleRewards = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/rewards');
  }, [router]);

  const handleStatistics = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/statistics');
  }, [router]);

  const handleHistory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/history');
  }, [router]);

  const actions = useMemo(() => [
    {
      id: 'campaign',
      label: 'Kampagne starten',
      icon: PlayCircleIcon,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      onPress: handleStartCampaign,
    },
    {
      id: 'rewards',
      label: 'Belohnungen',
      icon: WalletIcon,
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      onPress: handleRewards,
    },
    {
      id: 'statistics',
      label: 'Statistiken',
      icon: BarChartIcon,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      onPress: handleStatistics,
    },
    {
      id: 'trending',
      label: 'Trends',
      icon: TrendingUpIcon,
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      onPress: handleHistory,
    },
  ], [handleStartCampaign, handleRewards, handleStatistics, handleHistory]);

  return (
    <Card className={className} style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
      <CardContent className="p-4">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text variant="h4" className="text-white font-semibold mb-3" style={{ fontSize: 16 }}>
            Schnellaktionen
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row gap-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Pressable
                    key={action.id}
                    onPress={action.onPress}
                    onPressIn={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}
                  >
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateX: slideAnim.interpolate({
                              inputRange: [0, 20],
                              outputRange: [0, 20],
                            }),
                          },
                        ],
                      }}
                    >
                      <View
                        className="items-center justify-center p-4 rounded-xl"
                        style={{
                          width: 100,
                          backgroundColor: action.bgColor,
                          borderWidth: 1,
                          borderColor: action.borderColor,
                        }}
                      >
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mb-2"
                          style={{
                            backgroundColor: action.color,
                            opacity: 0.2,
                          }}
                        >
                          <Icon className="w-6 h-6" color={action.color} />
                        </View>
                        <Text
                          variant="small"
                          className="text-center font-medium"
                          style={{
                            color: action.color,
                            fontSize: 12,
                          }}
                          numberOfLines={2}
                        >
                          {action.label}
                        </Text>
                      </View>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </CardContent>
    </Card>
  );
}
