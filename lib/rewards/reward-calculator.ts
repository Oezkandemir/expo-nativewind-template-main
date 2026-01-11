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
 */
export async function calculateRewardSummary(userId: string): Promise<RewardSummary> {
  try {
    // Try to get data from Supabase (primary)
    const todayViews = await adTrackerService.getTodayAdViewsFromSupabase(userId);
    const allViews = await adTrackerService.getAdViewsFromSupabase(userId);
    const totalEarnedFromSupabase = await rewardService.getUserTotalRewardsFromSupabase(userId);

    // Calculate totals
    const totalEarned = totalEarnedFromSupabase;
    const todayEarned = todayViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    // Calculate weekly earnings (last 7 days)
    const weekViews = await adTrackerService.getAdViewsFromSupabase(userId, 7);
    const weekEarned = weekViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    // Calculate monthly earnings (last 30 days)
    const monthViews = await adTrackerService.getAdViewsFromSupabase(userId, 30);
    const monthEarned = monthViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    return {
      totalEarned,
      totalPaid: 0, // Will be implemented when payment system is added
      totalPending: totalEarned, // All earnings are pending until payout
      thisMonth: monthEarned,
      thisWeek: weekEarned,
      today: todayEarned,
    };
  } catch (error) {
    console.error('Calculate reward summary error (falling back to AsyncStorage):', error);
    
    // Fallback to AsyncStorage
    const todayViews = await adTrackerService.getTodayAdViews(userId);
    const allViews = await adTrackerService.getUserAdViews(userId);

    const totalEarned = allViews.reduce((sum, view) => sum + view.rewardEarned, 0);
    const todayEarned = todayViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekViews = allViews.filter(
      (view) => new Date(view.watchedAt) >= sevenDaysAgo
    );
    const weekEarned = weekViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthViews = allViews.filter(
      (view) => new Date(view.watchedAt) >= thirtyDaysAgo
    );
    const monthEarned = monthViews.reduce((sum, view) => sum + view.rewardEarned, 0);

    return {
      totalEarned,
      totalPaid: 0,
      totalPending: totalEarned,
      thisMonth: monthEarned,
      thisWeek: weekEarned,
      today: todayEarned,
    };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}



