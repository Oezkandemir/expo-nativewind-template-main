import { Reward, RewardSummary } from '@/types/reward';
import { adTrackerService } from '@/lib/ads/ad-tracker';
import { rewardService } from '@/lib/rewards/reward-service';

/**
 * User reward per campaign view
 * Calculation: 10€ per month / 150 campaigns per month = 0.0667€ ≈ 0.067€
 * This ensures users earn exactly 10€ per month with 5 campaigns per day
 */
export const USER_REWARD_PER_CAMPAIGN = 0.067;

/**
 * Calculate reward summary for a user using Supabase data
 * Uses actual reward_earned values from database for accurate calculation
 * This shows the real data stored in the database
 */
export async function calculateRewardSummary(userId: string): Promise<RewardSummary> {
  try {
    // Try to get data from Supabase (primary)
    const todayViews = await adTrackerService.getTodayAdViewsFromSupabase(userId);
    const weekViews = await adTrackerService.getAdViewsFromSupabase(userId, 7);
    const monthViews = await adTrackerService.getAdViewsFromSupabase(userId, 30);
    const allViews = await adTrackerService.getAdViewsFromSupabase(userId);
    
    // Calculate using actual reward_earned values from database
    // This shows the real data stored in ad_views table
    // Ensure values are converted to numbers (database may return strings)
    const todayEarned = todayViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);
    const weekEarned = weekViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);
    const monthEarned = monthViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);
    
    // For total earned, use the sum from rewards table (more accurate)
    const totalEarnedFromSupabase = await rewardService.getUserTotalRewardsFromSupabase(userId);
    const totalEarned = totalEarnedFromSupabase || allViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);

    // Round all values to 2 decimal places for display
    return {
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalPaid: 0, // Will be implemented when payment system is added
      totalPending: Math.round(totalEarned * 100) / 100, // All earnings are pending until payout
      thisMonth: Math.round(monthEarned * 100) / 100,
      thisWeek: Math.round(weekEarned * 100) / 100,
      today: Math.round(todayEarned * 100) / 100,
    };
  } catch (error) {
    console.error('Calculate reward summary error (falling back to AsyncStorage):', error);
    
    // Fallback to AsyncStorage - use actual reward_earned values
    const todayViews = await adTrackerService.getTodayAdViews(userId);
    const allViews = await adTrackerService.getUserAdViews(userId);

    // Calculate using actual reward_earned values
    // Ensure values are converted to numbers
    const todayEarned = todayViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);
    const totalEarned = allViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekViews = allViews.filter(
      (view) => new Date(view.watchedAt) >= sevenDaysAgo
    );
    const weekEarned = weekViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthViews = allViews.filter(
      (view) => new Date(view.watchedAt) >= thirtyDaysAgo
    );
    const monthEarned = monthViews.reduce((sum, view) => {
      const reward = typeof view.rewardEarned === 'string' ? parseFloat(view.rewardEarned) : (view.rewardEarned || 0);
      return sum + (isNaN(reward) ? 0 : reward);
    }, 0);

    // Round all values to 2 decimal places for display
    return {
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalPaid: 0,
      totalPending: Math.round(totalEarned * 100) / 100,
      thisMonth: Math.round(monthEarned * 100) / 100,
      thisWeek: Math.round(weekEarned * 100) / 100,
      today: Math.round(todayEarned * 100) / 100,
    };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}



