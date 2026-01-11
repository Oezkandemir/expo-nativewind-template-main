import { View, ScrollView, Animated, Easing, RefreshControl } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { sendPushNotification } from '@/lib/notifications/notification-service';
import { AD_SLOTS } from '@/lib/ads/ad-scheduler';
import { useToast } from '@/components/ui/toast';
import { Bell, BellOff, Send } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ui/app-header';
import { useNotificationStore, ReceivedNotification } from '@/store/notification-store';

const BellIcon = iconWithClassName(Bell);
const BellOffIcon = iconWithClassName(BellOff);
const SendIcon = iconWithClassName(Send);

export default function NotificationsScreen() {
  const { hasPermission, requestPermissions, rescheduleNotifications } = useNotifications();
  const { showToast } = useToast();
  const { receivedNotifications, getRecentNotifications, clearReceivedNotifications, removeDuplicates } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Get recent notifications (last 30 days)
  const recentNotifications = getRecentNotifications(30);

  // Remove duplicates on mount
  useEffect(() => {
    removeDuplicates();
  }, []);

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
    // Refresh notifications list
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Gerade eben';
    } else if (diffMins < 60) {
      return `Vor ${diffMins} Min.`;
    } else if (diffHours < 24) {
      return `Vor ${diffHours} Std.`;
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleRequestPermissions = async () => {
    await requestPermissions();
    await rescheduleNotifications();
  };

  const handleTestNotification = async () => {
    try {
      // Check permissions first
      if (!hasPermission) {
        showToast('Bitte erteilen Sie zuerst die Berechtigung für Benachrichtigungen', 'warning', 4000);
        // Auto-request permissions and retry
        const granted = await requestPermissions();
        if (granted) {
          setTimeout(() => handleTestNotification(), 500);
        }
        return;
      }

      // Get random slot for campaign
      const randomSlot = AD_SLOTS[Math.floor(Math.random() * AD_SLOTS.length)];
      
      console.log('Sending test notification...');
      const notificationId = await sendPushNotification(
        'SpotX - Neue Kampagne verfügbar',
        'Entdecken Sie aktuelle Angebote und interessante Neuigkeiten. Erfahren Sie mehr über diese Kampagne.',
        { 
          type: 'campaign',
          slotId: randomSlot.id,
          timestamp: Date.now() 
        }
      );
      
      console.log('Notification ID:', notificationId);
      showToast('✓ Kampagnen-Benachrichtigung wurde gesendet!', 'success', 3000);
    } catch (error: any) {
      console.error('Test notification error:', error);
      const errorMessage = error?.message || 'Unbekannter Fehler';
      showToast(
        `Benachrichtigung konnte nicht gesendet werden: ${errorMessage}`,
        'error',
        4000
      );
    }
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
              Benachrichtigungen
            </Text>
            <Text variant="small" className="text-gray-400">
              Empfangene Push-Benachrichtigungen
            </Text>
          </View>

          {/* Status Card */}
          <Card className="mb-4 overflow-hidden" style={{ 
            backgroundColor: hasPermission ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            borderWidth: 2,
            borderColor: hasPermission ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          }}>
            <CardHeader className="pb-3">
              <CardTitle>
                <View className="flex-row items-center gap-2">
                  {hasPermission ? (
                    <BellIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <BellOffIcon className="w-4 h-4 text-red-500" />
                  )}
                  <Text variant="h3" className={`font-semibold ${hasPermission ? 'text-green-400' : 'text-red-400'}`}>
                    Status
                  </Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center justify-between mb-4 p-3 rounded-lg" style={{
                backgroundColor: hasPermission ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              }}>
                <View className="flex-1 mr-4">
                  <Text variant="p" className="font-semibold mb-1 text-white">
                    Push-Benachrichtigungen
                  </Text>
                  <Text variant="small" className="text-gray-400 leading-4">
                    Erinnerungen für verfügbare Kampagnen
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full" style={{
                  backgroundColor: hasPermission ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                }}>
                  <Text variant="small" className="font-semibold" style={{
                    color: hasPermission ? '#22C55E' : '#EF4444',
                  }}>
                    {hasPermission ? 'Aktiviert' : 'Deaktiviert'}
                  </Text>
                </View>
              </View>
              {!hasPermission && (
                <Button 
                  onPress={handleRequestPermissions}
                  className="w-full"
                  style={{
                    backgroundColor: '#EF4444',
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <BellIcon className="w-4 h-4 text-white" />
                    <Text className="font-semibold text-white">Berechtigung erteilen</Text>
                  </View>
                </Button>
              )}
              {hasPermission && (
                <Button 
                  variant="outline" 
                  onPress={handleTestNotification} 
                  className="w-full"
                  style={{
                    borderColor: '#22C55E',
                    borderWidth: 2,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <SendIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <Text className="font-semibold text-green-600 dark:text-green-400">Test-Benachrichtigung senden</Text>
                  </View>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Received Notifications Card */}
          <Card className="overflow-hidden mb-4" style={{ borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: '#1E293B' }}>
            <CardHeader className="pb-3">
              <CardTitle>
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center gap-2 flex-1">
                    <BellIcon className="w-4 h-4 text-purple-500" />
                    <Text variant="h3" className="text-purple-400 font-semibold">
                      Empfangene Benachrichtigungen
                      {recentNotifications.length > 0 && (
                        <Text variant="small" className="text-gray-500 ml-2">
                          ({recentNotifications.length})
                        </Text>
                      )}
                    </Text>
                  </View>
                  {recentNotifications.length > 0 && (
                    <Button
                      variant="outline"
                      onPress={() => {
                        clearReceivedNotifications();
                        showToast('Alle Benachrichtigungen gelöscht', 'success', 2000);
                      }}
                      className="px-4 py-2"
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        borderWidth: 1,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <Text variant="small" className="text-red-400 font-semibold">
                        Alle löschen
                      </Text>
                    </Button>
                  )}
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotifications.length > 0 ? (
                <View className="gap-2.5">
                  {recentNotifications.map((notification) => (
                    <View
                      key={notification.id}
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1 mr-2">
                          <Text variant="p" className="font-semibold mb-1 text-white" numberOfLines={2}>
                            {notification.title}
                          </Text>
                          <Text variant="small" className="text-gray-400 mb-2" numberOfLines={2}>
                            {notification.body}
                          </Text>
                        </View>
                        <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                          <BellIcon className="w-4 h-4 text-purple-400" />
                        </View>
                      </View>
                      <Text variant="small" className="text-gray-500">
                        {formatDateTime(notification.receivedAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center justify-center">
                  <Text className="text-4xl mb-3">📭</Text>
                  <Text variant="p" className="text-gray-400 text-center mb-1">
                    Noch keine Benachrichtigungen erhalten
                  </Text>
                  <Text variant="small" className="text-gray-500 text-center">
                    Empfangene Push-Benachrichtigungen werden hier angezeigt
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}


