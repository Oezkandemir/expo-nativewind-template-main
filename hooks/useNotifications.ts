import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { notificationService } from '@/lib/notifications/notification-service';
import { initializeNotifications } from '@/lib/notifications/scheduler';
import { AD_SLOTS } from '@/lib/ads/ad-scheduler';
import { useNotificationStore } from '@/store/notification-store';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { addReceivedNotification } = useNotificationStore();

  useEffect(() => {
    checkPermissions();
    setupListeners();
    initializeNotificationSystem();
  }, []);

  // Track app state to detect if app was in foreground when notification was clicked
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App state changed - we can use this to track if app is active
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const setupListeners = () => {
    // Track processed notification identifiers to prevent duplicates
    const processedIds = new Set<string>();
    // Track notifications received while app is active (foreground)
    const notificationsReceivedInForeground = new Set<string>();
    
    // Listen for received notifications (foreground and background)
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Verwende den gleichen Identifier wie beim responseListener
        const identifier = notification.request.identifier || `notif_${Date.now()}_${Math.random()}`;
        
        // Skip if already processed
        if (processedIds.has(identifier)) {
          return;
        }
        
        processedIds.add(identifier);
        
        // Wenn Notification empfangen wurde während App aktiv ist, merke das
        // WICHTIG: receivedListener wird nur aufgerufen wenn App aktiv ist (Foreground)
        // Wenn App im Hintergrund ist, wird receivedListener NICHT aufgerufen
        const appState = AppState.currentState;
        if (appState === 'active') {
          notificationsReceivedInForeground.add(identifier);
          console.log('[Notification] Received in foreground, identifier:', identifier);
        }
        
        // Save received notification to store
        addReceivedNotification({
          id: identifier,
          title: notification.request.content.title || 'Benachrichtigung',
          body: notification.request.content.body || '',
          receivedAt: new Date().toISOString(),
          data: {
            ...(notification.request.content.data as Record<string, any>),
            identifier, // Store identifier for duplicate detection
          },
        });
      }
    );

    // Handle notification tap
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const notification = response.notification;
        // Verwende den gleichen Identifier wie beim receivedListener
        const identifier = notification.request.identifier || `notif_${Date.now()}_${Math.random()}`;
        
        // Only save if not already processed (to avoid duplicates)
        if (!processedIds.has(identifier)) {
          processedIds.add(identifier);
          
          addReceivedNotification({
            id: identifier,
            title: notification.request.content.title || 'Benachrichtigung',
            body: notification.request.content.body || '',
            receivedAt: new Date().toISOString(),
            data: {
              ...(notification.request.content.data as Record<string, any>),
              identifier, // Store identifier for duplicate detection
            },
          });
        }

        const data = notification.request.content.data as { 
          type?: string; 
          slotId?: string;
          campaignId?: string;
          autoStart?: boolean;
          appWasActive?: boolean; // Flag: true wenn App aktiv war beim Senden
        };
        
        // Prüfe ob Notification im Foreground empfangen wurde
        // WICHTIG: receivedListener wird NUR aufgerufen wenn App aktiv ist (Foreground)
        // Wenn App im Hintergrund/killed war, wird receivedListener NICHT aufgerufen
        const wasReceivedInForeground = notificationsReceivedInForeground.has(identifier);
        
        // Prüfe aktuellen App State beim Klick
        const currentAppState = AppState.currentState;
        const isCurrentlyActive = currentAppState === 'active';
        
        // Berechne Zeit seit Notification
        const notificationDate = notification.date;
        const now = Date.now();
        let notificationTime = now;
        if (notificationDate) {
          if (typeof notificationDate === 'number') {
            notificationTime = notificationDate;
          } else {
            // Type guard for Date objects
            const dateObj = notificationDate as unknown;
            if (dateObj && typeof dateObj === 'object' && 'getTime' in dateObj && typeof (dateObj as Date).getTime === 'function') {
              notificationTime = (dateObj as Date).getTime();
            }
          }
        }
        const timeSinceNotification = now - notificationTime;
        const isVeryRecent = timeSinceNotification < 1000; // Increased to 1 second for better detection
        
        // Bestimme ob User bereits aktiv in der App war:
        // 1. Wenn Notification im Foreground empfangen wurde → User war definitiv aktiv in der App
        // 2. Wenn appWasActive Flag gesetzt ist (von lokaler sendPushNotification) → App war aktiv beim Senden
        // 3. Fallback: Wenn Notification sehr frisch ist (< 1s) und App jetzt aktiv → wahrscheinlich war App aktiv
        // 
        // WICHTIG: Wenn receivedListener NICHT aufgerufen wurde, bedeutet das:
        // - App war geschlossen (killed) ODER
        // - App war im Hintergrund (background)
        // In beiden Fällen sollte fromNotification = true sein, damit App am Ende geschlossen wird
        const wasInForeground = wasReceivedInForeground || 
                                 data.appWasActive === true || 
                                 (isVeryRecent && isCurrentlyActive && wasReceivedInForeground !== false);
        
        // Zusätzliche Prüfung: Wenn App gerade gestartet wurde (sehr frisch) und Notification auch sehr frisch ist,
        // ist es wahrscheinlich, dass die App durch die Notification geöffnet wurde
        // Prüfe ob App sehr frisch gestartet wurde (innerhalb der letzten 3 Sekunden)
        const appStartTime = (global as any).__APP_START_TIME__;
        const timeSinceAppStart = appStartTime ? Date.now() - appStartTime : Infinity;
        const isAppVeryFresh = timeSinceAppStart < 3000; // App wurde innerhalb der letzten 3 Sekunden gestartet
        
        // Wenn App sehr frisch ist UND Notification sehr frisch ist UND receivedListener nicht aufgerufen wurde,
        // dann wurde die App wahrscheinlich durch die Notification geöffnet
        const likelyOpenedFromNotification = !wasReceivedInForeground && 
                                             isAppVeryFresh && 
                                             isVeryRecent;
        
        // Finale Entscheidung: fromNotification sollte true sein wenn:
        // 1. App NICHT im Foreground war (wasInForeground = false) ODER
        // 2. App wahrscheinlich durch Notification geöffnet wurde (likelyOpenedFromNotification = true)
        const shouldSetFromNotification = !wasInForeground || likelyOpenedFromNotification;
        
        // Debug Log für Android
        console.log('[Notification] Identifier:', identifier);
        console.log('[Notification] Was received in foreground:', wasReceivedInForeground);
        console.log('[Notification] appWasActive flag:', data.appWasActive);
        console.log('[Notification] Current app state:', currentAppState);
        console.log('[Notification] Time since notification:', timeSinceNotification, 'ms');
        console.log('[Notification] Time since app start:', timeSinceAppStart, 'ms');
        console.log('[Notification] Is app very fresh:', isAppVeryFresh);
        console.log('[Notification] Likely opened from notification:', likelyOpenedFromNotification);
        console.log('[Notification] Final wasInForeground:', wasInForeground);
        console.log('[Notification] fromNotification will be:', shouldSetFromNotification);
        
        // Handle campaign notifications (from sendPushNotification or admin panel)
        // Also handle test notifications (admin_notification type)
        const isAdNotification = data?.autoStart === true || 
                                (data?.type === 'ad_reminder' && data?.slotId) ||
                                data?.type === 'admin_notification' ||
                                !data?.type; // Default: open campaign for any notification
        
        if (isAdNotification) {
          // Get a random slot if no slotId provided
          const slotId = data.slotId || getRandomSlotId();
          
          console.log('[useNotifications] Opening campaign from notification tap, slotId:', slotId, 'autoStart:', data?.autoStart === true || data?.type === 'admin_notification');
          
          // Navigate to ad view as modal with auto-start flag
          // Set fromNotification based on app state: true if app was closed/background, false if app was active
          router.push({
            pathname: '/(tabs)/ad-view',
            params: { 
              slotId, 
              autoStart: (data?.autoStart === true || data?.type === 'admin_notification') ? 'true' : 'false',
              fromNotification: shouldSetFromNotification ? 'true' : 'false',
              ...(data.campaignId && { campaignId: data.campaignId }),
            },
          });
          return;
        }
      }
    );

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  };

  // Helper function to get random slot ID
  const getRandomSlotId = (): string => {
    const randomIndex = Math.floor(Math.random() * AD_SLOTS.length);
    return AD_SLOTS[randomIndex]?.id || AD_SLOTS[0]?.id || 'slot_1';
  };

  const initializeNotificationSystem = async () => {
    if (!isInitialized) {
      const success = await initializeNotifications();
      setIsInitialized(success);
    }
  };

  const requestPermissions = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    if (granted) {
      await initializeNotificationSystem();
    }
    return granted;
  }, []);

  const rescheduleNotifications = useCallback(async () => {
    await notificationService.scheduleDailyNotifications();
  }, []);

  return {
    hasPermission,
    isInitialized,
    requestPermissions,
    rescheduleNotifications,
  };
}


