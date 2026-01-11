import { View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeNotifications } from '@/lib/notifications/scheduler';

export default function CompleteScreen() {
  useEffect(() => {
    // Initialize notifications when onboarding is complete
    // This ensures notifications work even when app is closed
    initializeNotifications().catch((error) => {
      console.error('Failed to initialize notifications after onboarding:', error);
    });
  }, []);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <View className="items-center mb-4">
                <Text className="text-6xl mb-4">🎉</Text>
                <Text variant="h1" className="text-center">
                  Willkommen bei SpotX!
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text variant="p" className="text-center text-muted-foreground">
              Ihr Account wurde erfolgreich erstellt. Sie können jetzt beginnen, Kampagnen zu
              unterstützen und Belohnungen zu erhalten!
            </Text>

            <View className="gap-3 mt-4">
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">✅</Text>
                <Text variant="p">Account erstellt</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">📺</Text>
                <Text variant="p">5 Kampagnen täglich verfügbar</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">💰</Text>
                <Text variant="p">Erhalten Sie Belohnungen für jede Kampagne</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View className="gap-3">
          <Button onPress={handleGetStarted} className="w-full">
            <Text>Los geht&apos;s</Text>
          </Button>
          <Button variant="outline" onPress={handleBackToHome} className="w-full">
            <Text>Zurück zum Home</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

