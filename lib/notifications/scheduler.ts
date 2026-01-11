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



