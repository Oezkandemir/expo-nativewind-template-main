import { AD_SLOTS } from '@/lib/ads/ad-scheduler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { ErrorBoundary } from '@/components/error-boundary';
import { SplashScreen as CustomSplashScreen } from '@/components/ui/splash-screen';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';
import { ToastProvider } from '@/components/ui/toast';
import { AdProvider } from '@/contexts/AdContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RewardProvider } from '@/contexts/RewardContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeNotifications } from '@/lib/notifications/scheduler';
import { supabase } from '@/lib/supabase/client';
import { setNormal } from '@/lib/utils/status-bar';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);
  const hasCheckedNotification = useRef(false);
  const hasHandledDeepLink = useRef(false);
  const notificationCheckInProgress = useRef(false);

  // Handle email confirmation deep link
  useEffect(() => {
    if (authLoading || hasHandledDeepLink.current) {
      return;
    }

    const handleDeepLink = async (url: string) => {
      try {
        // Check if this is an email confirmation callback (spotx://auth/callback)
        if (url.includes('auth/callback')) {
          hasHandledDeepLink.current = true;
          
          // Supabase email confirmation URLs contain hash fragments
          // Format: myapp://auth/callback#access_token=...&type=signup&refresh_token=...
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hashString = url.substring(hashIndex + 1);
            const hashParams = new URLSearchParams(hashString);
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');
            
            if (accessToken && refreshToken && type === 'signup') {
              // Set session with Supabase to confirm email
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (!sessionError) {
                // Email confirmed successfully, navigate to login screen
                router.replace('/(auth)/login');
                return true; // Indicate we handled the deep link
              } else {
                console.error('Error setting session from deep link:', sessionError);
                // Still navigate to login even if session setting failed
                router.replace('/(auth)/login');
                return true;
              }
            } else {
              // Hash present but missing required tokens, navigate to login anyway
              router.replace('/(auth)/login');
              return true;
            }
          } else {
            // No hash fragments, just navigate to login
            router.replace('/(auth)/login');
            return true;
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        // On error, navigate to login screen anyway
        if (url.includes('auth/callback')) {
          router.replace('/(auth)/login');
          return true;
        }
      }
      return false;
    };

    // Check for initial URL (app opened from deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [authLoading, router]);

  // Handle notification navigation - FIXED: Wait for auth and prevent race condition
  useEffect(() => {
    // Wait for auth to be ready before checking notification
    if (authLoading || hasCheckedNotification.current || hasHandledDeepLink.current || notificationCheckInProgress.current) {
      return;
    }

    // Mark that we're checking notification to prevent race condition
    notificationCheckInProgress.current = true;

    const checkNotification = async () => {
      try {
        console.log('[RootLayoutNav] Checking for notification, isAuthenticated:', isAuthenticated);
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data as {
            type?: string;
            slotId?: string;
            campaignId?: string;
            autoStart?: boolean;
          };

          const isAdNotification =
            data?.autoStart === true ||
            (data?.type === 'ad_reminder' && data?.slotId) ||
            data?.type === 'admin_notification' ||
            !data?.type;

          console.log('[RootLayoutNav] Notification found, isAdNotification:', isAdNotification, 'isAuthenticated:', isAuthenticated);

          // Wait a bit if auth is still loading (shouldn't happen due to check above, but safety)
          if (!isAuthenticated) {
            console.log('[RootLayoutNav] Auth not ready, waiting...');
            // Wait for auth to be ready - check again after a short delay
            setTimeout(() => {
              if (isAuthenticated && isAdNotification) {
                const slotId = data.slotId || AD_SLOTS[0]?.id || 'slot_1';
                console.log('[RootLayoutNav] Navigating to campaign screen from notification');
                router.replace({
                  pathname: '/(tabs)/ad-view',
                  params: {
                    slotId,
                    autoStart: data?.autoStart === true || data?.type === 'admin_notification' ? 'true' : 'false',
                    fromNotification: 'true',
                    ...(data.campaignId && { campaignId: data.campaignId }),
                  },
                });
                hasNavigated.current = true;
                hasCheckedNotification.current = true;
                notificationCheckInProgress.current = false;
              } else {
                // Auth still not ready or not an ad notification, proceed with normal navigation
                hasCheckedNotification.current = true;
                notificationCheckInProgress.current = false;
                if (!hasNavigated.current && !hasHandledDeepLink.current) {
                  hasNavigated.current = true;
                  if (!isAuthenticated) {
                    router.replace('/(onboarding)/welcome');
                  } else {
                    router.replace('/(tabs)');
                  }
                }
              }
            }, 500);
            return;
          }

          if (isAdNotification && isAuthenticated) {
            const slotId = data.slotId || AD_SLOTS[0]?.id || 'slot_1';
            console.log('[RootLayoutNav] Navigating to campaign screen from notification');
            router.replace({
              pathname: '/(tabs)/ad-view',
              params: {
                slotId,
                autoStart: data?.autoStart === true || data?.type === 'admin_notification' ? 'true' : 'false',
                fromNotification: 'true',
                ...(data.campaignId && { campaignId: data.campaignId }),
              },
            });
            hasNavigated.current = true;
            hasCheckedNotification.current = true;
            notificationCheckInProgress.current = false;
            return;
          }
        }
      } catch (error) {
        console.error('[RootLayoutNav] Error checking notification:', error);
      }

      // Mark notification check as complete
      hasCheckedNotification.current = true;
      notificationCheckInProgress.current = false;

      // Normal navigation if no notification
      if (!hasNavigated.current && !hasHandledDeepLink.current) {
        hasNavigated.current = true;
        if (!isAuthenticated) {
          router.replace('/(onboarding)/welcome');
        } else {
          router.replace('/(tabs)');
        }
      }
    };

    checkNotification();
  }, [authLoading, isAuthenticated, router]);

  // Normal navigation fallback - FIXED: Wait for notification check to complete
  useEffect(() => {
    // Wait for auth, notification check, and deep link handling to complete
    if (authLoading || hasNavigated.current || hasHandledDeepLink.current || notificationCheckInProgress.current) {
      return;
    }

    // Only proceed if notification check has completed
    if (!hasCheckedNotification.current) {
      return;
    }

    hasNavigated.current = true;
    if (!isAuthenticated) {
      router.replace('/(onboarding)/welcome');
    } else {
      router.replace('/(tabs)');
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function AppContent({ onLayoutRootView }: { onLayoutRootView: () => void }) {
  const { loading: authLoading } = useAuth();
  const [navigationReady, setNavigationReady] = useState(false);

  // Mark navigation as ready after auth loads
  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        setNavigationReady(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Call onLayoutRootView when everything is ready
  useEffect(() => {
    if (navigationReady && !authLoading) {
      onLayoutRootView();
    }
  }, [navigationReady, authLoading, onLayoutRootView]);

  return (
    <View style={{ flex: 1 }} onLayout={navigationReady ? onLayoutRootView : undefined}>
      <RootLayoutNav />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const appStartTime = useRef(Date.now());
  const MIN_SPLASH_DURATION = 2000; // Minimum 2 seconds splash screen display

  // Track app start time
  useEffect(() => {
    appStartTime.current = Date.now();
  }, []);

  // Prepare app - wait for fonts
  useEffect(() => {
    if (loaded) {
      setAppIsReady(true);
    }
  }, [loaded]);

  // Hide splash screen only after layout is complete AND minimum duration has passed
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !splashHidden) {
      // Calculate elapsed time since app start
      const elapsed = Date.now() - appStartTime.current;
      const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed);
      
      // Wait for minimum splash duration + small delay to ensure navigation is rendered
      await new Promise((resolve) => setTimeout(resolve, remainingTime + 300));
      await SplashScreen.hideAsync();
      setSplashHidden(true);
      setNormal().catch(() => {});
      initializeNotifications().catch((error) => {
        console.error('Failed to initialize notifications:', error);
      });
    }
  }, [appIsReady, splashHidden]);

  // Show splash screen only until app is ready (fonts loaded)
  // AppContent will be rendered and call onLayoutRootView to hide splash after delay
  if (!appIsReady) {
    return <CustomSplashScreen isLoading={true} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <BottomSheetModalProvider>
          <UIThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <ToastProvider>
                <AuthProvider>
                  <AdProvider>
                    <RewardProvider>
                      <AppContent onLayoutRootView={onLayoutRootView} />
                      {/* Show splash overlay until it's hidden */}
                      {!splashHidden && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                          <CustomSplashScreen isLoading={true} />
                        </View>
                      )}
                      <StatusBar style="light" translucent backgroundColor="transparent" />
                    </RewardProvider>
                  </AdProvider>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </UIThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
