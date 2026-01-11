import AsyncStorage from '@react-native-async-storage/async-storage';
import { adTrackerService } from '@/lib/ads/ad-tracker';
import { rewardService } from '@/lib/rewards/reward-service';
import { useRewardStore } from '@/store/reward-store';

const STORAGE_KEYS = {
  AD_VIEWS: '@spotx:ad_views',
  REWARDS: '@spotx:rewards',
  PAYOUTS: '@spotx:payouts',
  DAILY_STATUS: '@spotx:daily_ad_status',
} as const;

/**
 * Service to reset all statistics
 */
class ResetService {
  /**
   * Reset all statistics for a user
   */
  async resetAllStatistics(userId: string): Promise<void> {
    try {
      // Get all data
      const allViews = await adTrackerService.getAdViews();
      const rewardsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
      const payoutsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYOUTS);
      
      // Filter out user's data
      const filteredViews = allViews.filter((view) => view.userId !== userId);
      const allRewards = rewardsJson ? JSON.parse(rewardsJson) : [];
      const filteredRewards = allRewards.filter((reward: any) => reward.userId !== userId);
      const allPayouts = payoutsJson ? JSON.parse(payoutsJson) : [];
      const filteredPayouts = allPayouts.filter((payout: any) => payout.userId !== userId);
      
      // Save filtered data
      await AsyncStorage.setItem(STORAGE_KEYS.AD_VIEWS, JSON.stringify(filteredViews));
      await AsyncStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(filteredRewards));
      await AsyncStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(filteredPayouts));
      
      // Clear daily status for user
      const statusKey = `${STORAGE_KEYS.DAILY_STATUS}:${userId}`;
      await AsyncStorage.removeItem(statusKey);
      
      // Clear reward store summary
      useRewardStore.getState().clearSummary();
      
      console.log('All statistics reset successfully for user:', userId);
    } catch (error) {
      console.error('Reset statistics error:', error);
      throw error;
    }
  }

  /**
   * Reset all statistics for all users (complete reset)
   */
  async resetAllStatisticsForAllUsers(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AD_VIEWS);
      await AsyncStorage.removeItem(STORAGE_KEYS.REWARDS);
      await AsyncStorage.removeItem(STORAGE_KEYS.PAYOUTS);
      
      // Clear all daily status entries
      const allKeys = await AsyncStorage.getAllKeys();
      const dailyStatusKeys = allKeys.filter((key) => key.startsWith(STORAGE_KEYS.DAILY_STATUS));
      await AsyncStorage.multiRemove(dailyStatusKeys);
      
      // Clear reward store summary
      useRewardStore.getState().clearSummary();
      
      console.log('All statistics reset successfully for all users');
    } catch (error) {
      console.error('Reset all statistics error:', error);
      throw error;
    }
  }
}

export const resetService = new ResetService();
