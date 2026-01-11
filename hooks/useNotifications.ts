import { useEffect, useState, useCallback } from 'react';
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

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const setupListeners = () => {
    // Track processed notification identifiers to prevent duplicates
    const processedIds = new Set<string>();
    
    // Listen for received notifications (foreground and background)
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const identifier = notification.request.identifier || `notif_${Date.now()}_${Math.random()}`;
        
        // Skip if already processed
        if (processedIds.has(identifier)) {
          return;
        }
        
        processedIds.add(identifier);
        
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
          autoStart?: boolean;
        };
        
        // Handle campaign notifications (from sendPushNotification)
        if (data?.autoStart) {
          // Get a random slot if no slotId provided
          const slotId = data.slotId || getRandomSlotId();
          
          // Navigate to ad view as modal with auto-start flag
          router.push({
            pathname: '/(tabs)/ad-view',
            params: { slotId, autoStart: 'true' },
          });
          return;
        }
        
        // Handle scheduled ad reminders
        if (data?.type === 'ad_reminder' && data?.slotId) {
          // Navigate to ad view screen as modal
          router.push({
            pathname: '/(tabs)/ad-view',
            params: { slotId: data.slotId },
          });
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


