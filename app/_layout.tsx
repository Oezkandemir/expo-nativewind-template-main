import { AD_SLOTS } from '@/lib/ads/ad-scheduler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
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

// Prevent the splash screen from auto-hiding
// We'll hide it immediately and show our custom splash instead
SplashScreen.preventAutoHideAsync();

// Global flag to prevent splash from showing multiple times
// This persists across component re-mounts (important for Android)
let hasShownSplash = false;
let nativeSplashHidden = false;

function RootLayoutNav() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hasCheckedInitialRoute = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Only check and redirect on initial mount, not on subsequent navigations
    if (!hasCheckedInitialRoute.current) {
      const checkAuthAndRedirect = async () => {
        if (!isAuthenticated) {
          // Not authenticated - always show onboarding (regardless of onboarding complete flag)
          if (segments[0] !== '(onboarding)') {
            router.replace('/(onboarding)/welcome');
          }
        } else {
          // Authenticated - show main app
          if (segments[0] === '(onboarding)') {
            // Redirect from onboarding screens to main app
            const currentScreen = segments[1] as string | undefined;
            // Allow navigation through onboarding flow, but redirect from complete screen
            if (currentScreen === 'complete') {
              router.replace('/(tabs)');
            }
            // Otherwise allow manual navigation (welcome, auth, interests)
          } else if (segments[0] !== '(tabs)' && segments[0] !== '(auth)') {
            router.replace('/(tabs)');
          }
        }
        
        hasCheckedInitialRoute.current = true;
        setIsNavigationReady(true);
      };

      checkAuthAndRedirect();
    } else {
      // After initial check, continuously monitor auth state and redirect if needed
      if (!isAuthenticated) {
        // If user logs out or becomes unauthenticated, redirect to onboarding
        if (segments[0] !== '(onboarding)') {
          router.replace('/(onboarding)/welcome');
        }
      } else {
        // If user becomes authenticated, redirect to main app (unless already in onboarding flow)
        if (segments[0] === '(onboarding)') {
          const currentScreen = segments[1] as string | undefined;
          // Only redirect from complete screen, allow navigation through onboarding
          if (currentScreen === 'complete') {
            router.replace('/(tabs)');
          }
        } else if (segments[0] !== '(tabs)' && segments[0] !== '(auth)') {
          router.replace('/(tabs)');
        }
      }
      setIsNavigationReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Show loading state while auth is loading or navigation isn't ready
  // This prevents the splash from reappearing
  if (authLoading || !isNavigationReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(!hasShownSplash);
  const [openedFromNotification, setOpenedFromNotification] = useState(false);
  const hasCheckedNotification = useRef(false);

  // Hide native splash immediately on mount and show custom splash
  // Use global flag to prevent this from running multiple times on Android
  useEffect(() => {
    const hideNativeSplash = async () => {
      if (!nativeSplashHidden) {
        try {
          await SplashScreen.hideAsync();
          nativeSplashHidden = true;
        } catch (e) {
          // Splash already hidden
          nativeSplashHidden = true;
        }
      }
    };
    hideNativeSplash();
  }, []);

  // Check if app was opened from notification on startup
  useEffect(() => {
    const checkNotificationResponse = async () => {
      if (hasCheckedNotification.current) return;
      hasCheckedNotification.current = true;

      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const notificationTime = lastResponse.notification.date;
          
          // If no date available, treat as recent notification
          if (!notificationTime) {
            const data = lastResponse.notification.request.content.data as {
              type?: string;
              slotId?: string;
              autoStart?: boolean;
            };
            
            // Check if this is an ad notification (autoStart or ad_reminder)
            if (data?.autoStart || (data?.type === 'ad_reminder' && data?.slotId)) {
              hasShownSplash = true; // Set global flag immediately
              setOpenedFromNotification(true);
              setShowSplash(false);

              const slotId = data.slotId || (() => {
                const randomIndex = Math.floor(Math.random() * AD_SLOTS.length);
                return AD_SLOTS[randomIndex]?.id || AD_SLOTS[0]?.id || 'slot_1';
              })();

              if (loaded) {
                router.replace({
                  pathname: '/(tabs)/ad-view',
                  params: {
                    slotId,
                    autoStart: data?.autoStart ? 'true' : 'false',
                    fromNotification: 'true',
                  },
                });
              }
              return;
            }
            return;
          }
          
          // notificationTime is defined here, calculate time difference
          const now = Date.now();
          const notificationTimeValue: number = (() => {
            const time = notificationTime as Date | number | null | undefined;
            if (time && typeof time === 'object' && time.constructor === Date) {
              return (time as Date).getTime();
            }
            if (typeof time === 'number') {
              return time;
            }
            return now;
          })();
          const timeDiff = now - notificationTimeValue;
          
          // Only treat as "opened from notification" if notification was clicked within last 5 seconds
          if (timeDiff < 5000) {
            const data = lastResponse.notification.request.content.data as {
              type?: string;
              slotId?: string;
              autoStart?: boolean;
            };

            // Check if this is an ad notification (autoStart or ad_reminder)
            if (data?.autoStart || (data?.type === 'ad_reminder' && data?.slotId)) {
              hasShownSplash = true; // Set global flag immediately
              setOpenedFromNotification(true);
              setShowSplash(false);

              const slotId = data.slotId || (() => {
                const randomIndex = Math.floor(Math.random() * AD_SLOTS.length);
                return AD_SLOTS[randomIndex]?.id || AD_SLOTS[0]?.id || 'slot_1';
              })();

              if (loaded) {
                router.replace({
                  pathname: '/(tabs)/ad-view',
                  params: {
                    slotId,
                    autoStart: data?.autoStart ? 'true' : 'false',
                    fromNotification: 'true',
                  },
                });
              }
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking notification response:', error);
      }
    };

    checkNotificationResponse();
  }, [router, loaded]);

  // Handle custom splash screen finish
  const handleSplashFinish = () => {
    if (loaded) {
      hasShownSplash = true; // Set global flag
      setShowSplash(false);
      
      // Initialize notifications after splash
      if (!openedFromNotification) {
        initializeNotifications().catch((error) => {
          console.error('Failed to initialize notifications:', error);
        });
      }
    }
  };

  // If splash was already shown (e.g., on Android remount), don't show it again
  // If fonts are loaded but splash animation is still running, keep showing splash
  // If opened from notification, skip splash entirely
  if (showSplash && !openedFromNotification && !hasShownSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  // If fonts haven't loaded yet and not showing splash, show nothing (brief moment)
  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <UIThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <ToastProvider>
                <AuthProvider>
                  <AdProvider>
                    <RewardProvider>
                      <RootLayoutNav />
                      <StatusBar style="light" />
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
