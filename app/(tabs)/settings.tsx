import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { AppHeader } from '@/components/ui/app-header';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Info, Megaphone } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, View } from 'react-native';

const BellIcon = iconWithClassName(Bell);
const BellOffIcon = iconWithClassName(BellOff);
const AdIcon = iconWithClassName(Megaphone);
const InfoIcon = iconWithClassName(Info);

export default function SettingsScreen() {
  const { user, updateUser } = useAuth();
  const { hasPermission, requestPermissions } = useNotifications();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences.notificationsEnabled || false
  );
  const [historyWidgetEnabled, setHistoryWidgetEnabled] = useState(
    user?.preferences?.widgets?.historyEnabled || false
  );

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

  useEffect(() => {
    setHistoryWidgetEnabled(user?.preferences?.widgets?.historyEnabled || false);
  }, [user?.preferences?.widgets?.historyEnabled]);

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    await updateUser({
      preferences: {
        notificationsEnabled: enabled,
        adFrequencyPreference: user?.preferences?.adFrequencyPreference,
        widgets: {
          historyEnabled: user?.preferences?.widgets?.historyEnabled || false,
        },
      },
    });

    if (enabled && !hasPermission) {
      await requestPermissions();
    }
  };

  const handleToggleHistoryWidget = async (enabled: boolean) => {
    setHistoryWidgetEnabled(enabled);
    await updateUser({
      preferences: {
        notificationsEnabled: user?.preferences?.notificationsEnabled || false,
        adFrequencyPreference: user?.preferences?.adFrequencyPreference,
        widgets: {
          historyEnabled: enabled,
        },
      },
    });
    showToast(
      enabled ? '✓ History Widget aktiviert' : 'History Widget deaktiviert',
      'success',
      2000
    );
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
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6">
            <Text variant="h1" className="mb-2 font-bold text-white">
              Einstellungen
            </Text>
            <Text variant="small" className="text-gray-400">
              Verwalten Sie Ihre App-Einstellungen
            </Text>
          </View>

        {/* Notifications Card */}
        <Card className="overflow-hidden mb-4" style={{ borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row gap-2 items-center">
                {notificationsEnabled && hasPermission !== false ? (
                  <BellIcon className="w-4 h-4 text-blue-500" />
                ) : (
                  <BellOffIcon className="w-4 h-4 text-gray-400" />
                )}
                <Text variant="h3" className="font-semibold text-blue-400">
                  Benachrichtigungen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-1 mr-4">
                <Text variant="p" className="mb-1 font-medium text-white">
                  Push-Benachrichtigungen
                </Text>
                <Text variant="small" className="leading-4 text-gray-400">
                  Erhalten Sie Erinnerungen für verfügbare Kampagnen
                </Text>
              </View>
              <Switch
                checked={notificationsEnabled && hasPermission !== false}
                onCheckedChange={handleToggleNotifications}
              />
            </View>
            {hasPermission === false && (
              <View className="p-3 mt-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <Text variant="small" className="text-red-400">
                  ⚠️ Berechtigung nicht erteilt. Bitte in den Geräteeinstellungen aktivieren.
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Ad Preferences Card */}
        <Card className="overflow-hidden mb-4" style={{ borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row gap-2 items-center">
                <AdIcon className="w-4 h-4 text-green-500" />
                <Text variant="h3" className="font-semibold text-green-400">
                  Kampagnen-Präferenzen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="py-2">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1">
                  <Text variant="p" className="mb-1 font-medium text-white">
                    Häufigkeit
                  </Text>
                  <Text variant="small" className="text-gray-400">
                    Standard: 5 Kampagnen täglich
                  </Text>
                </View>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <Text variant="small" className="font-semibold text-green-300">
                    5/Tag
                  </Text>
                </View>
              </View>
              <View className="overflow-hidden h-2 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <View className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Widget Settings Card */}
        <Card className="overflow-hidden mb-4" style={{ borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row gap-2 items-center">
                <Text className="text-lg">📱</Text>
                <Text variant="h3" className="font-semibold text-purple-400">
                  Widget-Einstellungen
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-1 mr-4">
                <Text variant="p" className="mb-1 font-medium text-white">
                  History Widget
                </Text>
                <Text variant="small" className="leading-4 text-gray-400">
                  Zeigt Ihre gesehenen Kampagnen mit 7 Tage, 1 Monat und 3 Monate Tabs
                </Text>
              </View>
              <Switch
                checked={historyWidgetEnabled}
                onCheckedChange={handleToggleHistoryWidget}
              />
            </View>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card className="overflow-hidden mb-4" style={{ borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: '#1E293B' }}>
          <CardHeader className="pb-3">
            <CardTitle>
              <View className="flex-row gap-2 items-center">
                <InfoIcon className="w-4 h-4 text-purple-500" />
                <Text variant="h3" className="font-semibold text-purple-400">
                  Über
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="py-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text variant="p" className="font-semibold text-white">
                  SpotX
                </Text>
                <View className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <Text variant="small" className="font-medium text-purple-300">
                    v1.0.0
                  </Text>
                </View>
              </View>
              <Text variant="small" className="leading-4 text-gray-400">
                Die Plattform für Kampagnen und Belohnungen. Unterstützen Sie wichtige Kampagnen und erhalten Sie Belohnungen.
              </Text>
            </View>
          </CardContent>
        </Card>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}


