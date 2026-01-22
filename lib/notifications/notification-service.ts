import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';
import Constants from 'expo-constants';
import { AD_SLOTS } from '@/lib/ads/ad-scheduler';
import { supabase } from '@/lib/supabase/client';

const { SchedulableTriggerInputTypes } = Notifications;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification service for campaign reminders
 * Uses legally compliant language without references to advertising or monetary rewards
 */
class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Ensure runtime is ready before accessing native modules
      if (typeof Notifications === 'undefined' || !Notifications.getPermissionsAsync) {
        console.warn('Notifications module not ready');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('ad-reminders', {
          name: 'Kampagnen-Benachrichtigungen',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          showBadge: true,
          enableVibrate: true,
          enableLights: true,
        });
      }

      // Register for push notifications and send token to backend
      // Only register if user is authenticated (to avoid 401 errors)
      // On Android, skip if Firebase is not initialized (common in development)
      // On iOS, try to get token (works without Firebase)
      if (Platform.OS === 'ios' || Platform.OS === 'web') {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: '8ddfb1eb-b6c2-44dc-ad88-00e4652e956c',
          });
          console.log('Push notification token:', token.data);
          
          // Only send token to backend if user is authenticated
          const authHeaders = await this.getAuthHeaders();
          if (authHeaders['Authorization']) {
            await this.registerPushToken(token.data, Platform.OS);
          } else {
            console.log('User not authenticated, skipping push token registration. Will retry after login.');
          }
        } catch (error: any) {
          // Only log if it's not a Firebase initialization error
          if (!error?.message?.includes('FirebaseApp') && !error?.message?.includes('Firebase')) {
            console.warn('Could not get push token:', error);
          }
          // Continue - local notifications will still work
        }
      } else if (Platform.OS === 'android') {
        // On Android, try to get token but don't fail if Firebase is not set up
        // This is common in development builds without Firebase configuration
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: '8ddfb1eb-b6c2-44dc-ad88-00e4652e956c',
          });
          console.log('Push notification token:', token.data);
          
          // Only send token to backend if user is authenticated
          const authHeaders = await this.getAuthHeaders();
          if (authHeaders['Authorization']) {
            await this.registerPushToken(token.data, Platform.OS);
          } else {
            console.log('User not authenticated, skipping push token registration. Will retry after login.');
          }
        } catch (error: any) {
          // Silently ignore Firebase errors on Android (expected in dev without Firebase)
          // Only log other errors
          if (!error?.message?.includes('FirebaseApp') && !error?.message?.includes('Firebase')) {
            console.warn('Could not get push token on Android:', error);
          }
          // Continue - local notifications will still work
        }
      }

      return true;
    } catch (error) {
      console.error('Request notification permissions error:', error);
      return false;
    }
  }

  /**
   * Register push token with backend (only if authenticated)
   * This should be called after user logs in
   */
  async registerPushTokenIfAuthenticated(): Promise<void> {
    try {
      // Check if user is authenticated first
      const authHeaders = await this.getAuthHeaders();
      if (!authHeaders['Authorization']) {
        console.log('User not authenticated, skipping push token registration.');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '8ddfb1eb-b6c2-44dc-ad88-00e4652e956c',
      });
      
      console.log('Push notification token:', token.data);
      
      // Register token with backend
      await this.registerPushToken(token.data, Platform.OS);
    } catch (error: any) {
      // Only log if it's not a Firebase initialization error
      if (!error?.message?.includes('FirebaseApp') && !error?.message?.includes('Firebase')) {
        console.warn('Could not register push token:', error);
      }
      // Don't throw - app should continue working
    }
  }

  /**
   * Register push token with backend
   */
  async registerPushToken(token: string, platform: string): Promise<void> {
    try {
      // Get backend API URL from environment
      // EXPO_PUBLIC_API_URL should be set to your merchant portal URL (e.g., https://your-app.vercel.app)
      let API_URL = process.env.EXPO_PUBLIC_API_URL || 
                     process.env.NEXT_PUBLIC_BASE_URL;
      
      // Fix: Replace localhost with network IP for mobile devices/emulators
      // Mobile devices can't reach localhost on the development machine
      if (API_URL && (API_URL.includes('localhost') || API_URL.includes('127.0.0.1'))) {
        // Try to get network IP from Expo Constants
        // For Android, we MUST use network IP, not localhost
        try {
          const manifest = Constants.expoConfig || Constants.manifest;
          
          // Try to extract IP from Expo's dev server info
          // Common pattern: Expo shows "Network: http://192.168.0.163:3000"
          // We'll try to use a common development IP or detect platform
          
          if (Platform.OS === 'android') {
            // Android MUST use network IP - try common development IPs
            // User should set EXPO_PUBLIC_API_URL, but we'll try to help
            const port = API_URL.match(/:(\d+)/)?.[1] || '3000';
            
            // Try Android emulator host first (10.0.2.2 maps to host's localhost)
            // This works for Android Emulator, but NOT for real Android devices
            const androidEmulatorURL = `http://10.0.2.2:${port}`;
            console.warn('⚠️  localhost detected on Android.');
            console.warn(`   Using Android emulator host: ${androidEmulatorURL}`);
            console.warn('   ⚠️  For REAL Android devices, you MUST set:');
            console.warn('      EXPO_PUBLIC_API_URL=http://192.168.0.163:3000');
            console.warn('      (Replace 192.168.0.163 with your actual network IP)');
            
            // Use Android emulator host as fallback
            API_URL = androidEmulatorURL;
          } else {
            // iOS might work with localhost in some cases (Expo Go), but warn anyway
            console.warn('⚠️  localhost detected in API_URL. Mobile devices need network IP.');
            console.warn('   Please set EXPO_PUBLIC_API_URL to your network IP (e.g., http://192.168.0.163:3000)');
            console.warn('   Current API_URL:', API_URL);
            // Don't change for iOS - might work with Expo Go
          }
        } catch (e) {
          // If we can't detect platform, just warn
          console.warn('⚠️  localhost detected in API_URL. Mobile devices need network IP.');
          console.warn('   Please set EXPO_PUBLIC_API_URL to your network IP (e.g., http://192.168.0.163:3000)');
          console.warn('   Current API_URL:', API_URL);
        }
      }
      
      if (!API_URL) {
        console.warn('EXPO_PUBLIC_API_URL or NEXT_PUBLIC_BASE_URL not set. Cannot register push token.');
        console.warn('Please set EXPO_PUBLIC_API_URL in your .env file to your merchant portal URL.');
        console.warn('For local development, use your network IP: http://192.168.0.163:3000');
        return;
      }
      
      // Construct API endpoint for push token registration
      const apiEndpoint = `${API_URL}/api/users/push-token`;
      
      // Get device ID if available (optional - expo-device may not be installed)
      // Note: Device ID is optional and not required for push notifications to work
      // Removed dynamic import to avoid bundling issues - device ID is not critical
      let deviceId: string | undefined;
      
      console.log('Registering push token at:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if available
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({
          token,
          platform: platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'web',
          deviceId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.error || response.statusText || `HTTP ${response.status}`;
        console.error('Failed to register push token:', errorText);
        console.error('Response status:', response.status);
        console.error('API Endpoint:', apiEndpoint);
        return;
      }
      
      const result = await response.json().catch(() => ({}));
      console.log('Push token registered successfully:', result.message || 'OK');
    } catch (error) {
      console.warn('Error registering push token:', error);
      // Don't throw - app should continue working even if token registration fails
    }
  }

  /**
   * Get auth headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Ensure supabase is available before accessing
      if (!supabase || !supabase.auth) {
        return {};
      }

      // Try to get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        return {
          'Authorization': `Bearer ${session.access_token}`,
        };
      }
    } catch (error) {
      // Auth not available, continue without headers
      // Silently fail - app should work without auth headers
    }
    return {};
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Schedule daily ad slot notifications
   * @param campaignInfo - Optional campaign information to include in notifications
   */
  async scheduleDailyNotifications(campaignInfo?: { title?: string; campaignName?: string }): Promise<void> {
    // Cancel existing notifications first
    await this.cancelAllNotifications();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Schedule notifications for each ad slot
    for (const slot of AD_SLOTS) {
      const notificationDate = new Date(today);
      notificationDate.setHours(slot.hour, slot.minute, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (notificationDate.getTime() <= now.getTime()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      // Build notification text with campaign info if available
      let title = `SpotX - Neue Kampagne um ${slot.time} Uhr`;
      let body = `Eine interessante Kampagne wartet auf Sie. Erfahren Sie mehr über aktuelle Angebote und Neuigkeiten.`;

      if (campaignInfo?.title && campaignInfo?.campaignName) {
        title = `SpotX - ${campaignInfo.title}`;
        body = `${campaignInfo.campaignName}: Entdecken Sie aktuelle Informationen und interessante Details zu dieser Kampagne.`;
      } else if (campaignInfo?.campaignName) {
        title = `SpotX - ${campaignInfo.campaignName} um ${slot.time} Uhr`;
        body = `Erfahren Sie mehr über diese Kampagne und aktuelle Angebote.`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'ad_reminder',
            slotId: slot.id,
            time: slot.time,
            ...(campaignInfo?.title && { campaignTitle: campaignInfo.title }),
            ...(campaignInfo?.campaignName && { campaignName: campaignInfo.campaignName }),
          },
          sound: true,
          badge: 1,
          ...(Platform.OS === 'android' && { channelId: 'ad-reminders' }),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
        },
      });
    }
  }

  /**
   * Schedule a single notification for a specific slot
   * @param slotId - The slot ID
   * @param time - The time string (HH:mm format)
   * @param date - The date to schedule the notification
   * @param campaignInfo - Optional campaign information to include
   */
  async scheduleSlotNotification(
    slotId: string, 
    time: string, 
    date: Date,
    campaignInfo?: { title?: string; campaignName?: string }
  ): Promise<void> {
      // Build notification text with campaign info if available
      let title = `SpotX - Kampagne um ${time} Uhr verfügbar`;
      let body = `Eine neue Kampagne ist jetzt für Sie verfügbar. Entdecken Sie aktuelle Informationen und Angebote.`;

      if (campaignInfo?.title && campaignInfo?.campaignName) {
        title = `SpotX - ${campaignInfo.title}`;
        body = `${campaignInfo.campaignName}: Erfahren Sie mehr über aktuelle Angebote und interessante Details zu dieser Kampagne.`;
      } else if (campaignInfo?.campaignName) {
        title = `SpotX - ${campaignInfo.campaignName} um ${time} Uhr`;
        body = `Entdecken Sie aktuelle Informationen und Angebote zu dieser Kampagne.`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'ad_reminder',
            slotId,
            time,
            ...(campaignInfo?.title && { campaignTitle: campaignInfo.title }),
            ...(campaignInfo?.campaignName && { campaignName: campaignInfo.campaignName }),
          },
          sound: true,
          badge: 1,
          ...(Platform.OS === 'android' && { channelId: 'ad-reminders' }),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Send an immediate push notification with random position
   * 
   * @param title - Notification title
   * @param body - Notification body text
   * @param data - Optional data to attach to the notification
   * @returns Promise<string> - Notification identifier
   */
  async sendPushNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      // Check permissions first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          throw new Error('Notification permissions not granted');
        }
      }

      // Generate random channel for varying notification position/priority
      // This simulates random positioning by using different channels with different priorities
      let channelId: string | undefined = undefined;
      
      if (Platform.OS === 'android') {
        const randomChannelIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
        const channelIds = ['campaign-high', 'campaign-medium', 'campaign-low'];
        const importances = [
          Notifications.AndroidImportance.HIGH,
          Notifications.AndroidImportance.DEFAULT,
          Notifications.AndroidImportance.LOW,
        ];
        channelId = channelIds[randomChannelIndex];
        const importance = importances[randomChannelIndex];

        // Ensure Android channel exists with random priority
        try {
          await Notifications.setNotificationChannelAsync(channelId, {
            name: 'Kampagnen-Benachrichtigungen',
            importance,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4F46E5',
            showBadge: true,
          });
        } catch (channelError) {
          console.warn('Failed to create notification channel, using default:', channelError);
          // Fallback: use default ad-reminders channel
          try {
            await Notifications.setNotificationChannelAsync('ad-reminders', {
              name: 'Kampagnen-Benachrichtigungen',
              importance: Notifications.AndroidImportance.HIGH,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#4F46E5',
            });
            channelId = 'ad-reminders';
          } catch (fallbackError) {
            console.warn('Failed to create fallback channel:', fallbackError);
            channelId = undefined; // Use system default
          }
        }
      }

      // Prüfe ob App aktiv ist beim Senden der Notification
      // Wenn App aktiv ist, war User bereits in der App → fromNotification sollte false sein
      const appState = AppState.currentState;
      const isAppActive = appState === 'active';
      
      // Send immediate notification (no delay for reliability)
      // The random channel will still vary the position/priority
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            autoStart: true, // Flag to auto-start the ad
            appWasActive: isAppActive, // Flag: true wenn App aktiv war beim Senden
          },
          sound: true,
          ...(Platform.OS === 'android' && channelId && { channelId }), // Only set channelId on Android if available
        },
        trigger: null, // Immediate notification (no delay)
      });

      console.log('Notification sent successfully:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Send push notification error:', error);
      throw error;
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ): () => void {
    // Listener for notifications received while app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Listener for when user taps on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationTapped
    );

    // Return cleanup function
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }
}

export const notificationService = new NotificationService();

/**
 * Convenience function to send an immediate push notification
 * 
 * This function sends a campaign notification that:
 * - Appears at random positions (using different notification channels)
 * - Auto-starts the campaign when clicked
 * - Opens the app and starts the campaign directly
 * - Uses legally compliant language
 * 
 * @param title - Notification title (should include campaign information)
 * @param body - Notification body text (should describe campaign content, not monetary rewards)
 * @param data - Optional data to attach to the notification
 * @returns Promise<string> - Notification identifier
 * 
 * @example
 * ```ts
 * import { sendPushNotification } from '@/lib/notifications/notification-service';
 * 
 * // Campaign notification with campaign details
 * await sendPushNotification(
 *   'Neue Kampagne verfügbar',
 *   'Entdecken Sie aktuelle Angebote und interessante Neuigkeiten zu dieser Kampagne.',
 *   { type: 'campaign', slotId: 'slot_1', campaignName: 'Tech Campaign' }
 * );
 * ```
 */
export async function sendPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  return notificationService.sendPushNotification(title, body, data);
}


