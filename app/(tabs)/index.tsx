import { View, ScrollView, RefreshControl, Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { AppHeader } from '@/components/ui/app-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { useState, useEffect, useRef, useCallback } from 'react';
import { HistoryWidget } from '@/components/widgets/HistoryWidget';
import { QuickStatsWidget } from '@/components/widgets/QuickStatsWidget';
import { RewardsSummaryWidget } from '@/components/widgets/RewardsSummaryWidget';
import { getDisplayName } from '@/lib/utils/avatar';

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const { refreshDailyStatus } = useAds();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Animation values for staggered animations
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const rewardsAnim = useRef(new Animated.Value(0)).current;
  const historyAnim = useRef(new Animated.Value(0)).current;
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  // Refresh user data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      refreshUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty deps to prevent infinite loop - refreshUser is stable
  );

  useEffect(() => {
    // Staggered animations for widgets
    Animated.stagger(150, [
      Animated.timing(welcomeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rewardsAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(historyAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshDailyStatus(),
      refreshUser(), // Also refresh user to get updated widget preferences
    ]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      {/* SpotX Logo Header - Fixed at top, extends to status bar */}
      <AppHeader />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: 80 + insets.bottom, // Add safe area bottom padding to content
          paddingTop: 16 
        }}
        style={{ backgroundColor: '#0F172A' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header - Enhanced with time-based greeting */}
        <Animated.View
          style={{
            opacity: welcomeAnim,
            transform: [
              {
                translateY: welcomeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            marginBottom: 20,
          }}
        >
          <View 
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: '#1E293B',
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.2)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-4">
              <UserAvatar
                userId={user?.id || 'default'}
                name={user?.name}
                size={64}
                style="robots"
                customUrl={user?.avatarUrl}
                showBorder={true}
                borderColor="#8B5CF6"
              />
              <View className="flex-1">
                <Text 
                  variant="h1" 
                  className="mb-1 text-white font-bold"
                  style={{
                    fontSize: 24,
                  }}
                >
                  {getGreeting()}!
                </Text>
                <Text variant="p" className="text-gray-400" style={{ fontSize: 16 }}>
                  {getDisplayName(user?.name)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats Widget */}
        <Animated.View
          style={{
            opacity: statsAnim,
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginBottom: 16,
          }}
        >
          <QuickStatsWidget />
        </Animated.View>

        {/* Rewards Summary Widget */}
        <Animated.View
          style={{
            opacity: rewardsAnim,
            transform: [
              {
                translateY: rewardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginBottom: 16,
          }}
        >
          <RewardsSummaryWidget />
        </Animated.View>

        {/* History Widget (if enabled) */}
        {user?.preferences?.widgets?.historyEnabled && (
          <Animated.View
            style={{
              opacity: historyAnim,
              transform: [
                {
                  translateY: historyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              marginBottom: 16,
            }}
          >
            <HistoryWidget />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
