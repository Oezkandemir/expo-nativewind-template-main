import { notificationService } from './notification-service';
import { AD_SLOTS } from '@/lib/ads/ad-scheduler';

/**
 * Initialize and schedule all campaign slot notifications
 * Uses legally compliant language without references to advertising or monetary rewards
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    // Schedule daily campaign notifications
    await notificationService.scheduleDailyNotifications();

    // Register push token if user is authenticated
    // This will silently fail if not authenticated (expected on app start)
    await notificationService.registerPushTokenIfAuthenticated().catch(() => {
      // Silently fail - token will be registered after login
    });

    return true;
  } catch (error) {
    console.error('Initialize notifications error:', error);
    return false;
  }
}

/**
 * Reschedule campaign notifications (useful when app restarts)
 */
export async function rescheduleNotifications(): Promise<void> {
  await notificationService.scheduleDailyNotifications();
}



