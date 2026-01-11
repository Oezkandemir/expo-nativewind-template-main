import { View, ScrollView, RefreshControl, Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { AppHeader } from '@/components/ui/app-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { useState, useEffect, useRef, useCallback } from 'react';
import { HistoryWidget } from '@/components/widgets/HistoryWidget';
import { getDisplayName } from '@/lib/utils/avatar';

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const { refreshDailyStatus } = useAds();
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Refresh user data when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      refreshUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty deps to prevent infinite loop - refreshUser is stable
  );

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDailyStatus();
    await refreshUser(); // Also refresh user to get updated widget preferences
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      {/* SpotX Logo Header - Fixed at top */}
      <AppHeader />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header - Styled to match bottom tab navigation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          <View 
            className="p-5 rounded-2xl mb-4"
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
                size={56}
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
                    fontSize: 28,
                  }}
                >
                  Willkommen zurück!
                </Text>
                <Text variant="p" className="text-gray-400" style={{ fontSize: 16 }}>
                  {getDisplayName(user?.name)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Widget Area */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {user?.preferences?.widgets?.historyEnabled && (
            <HistoryWidget />
          )}
          
          {(!user?.preferences?.widgets?.historyEnabled) && (
            <View 
              className="mb-4 p-6 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: '#1E293B',
                borderWidth: 2,
                borderColor: 'rgba(139, 92, 246, 0.2)',
                borderStyle: 'dashed',
              }}
            >
              <Text className="text-3xl mb-2">📱</Text>
              <Text variant="h4" className="text-white font-semibold mb-1 text-center">
                Widget-Bereich
              </Text>
              <Text variant="small" className="text-gray-400 text-center">
                Aktiviere Widgets in den Einstellungen, um Informationen hier anzuzeigen
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
