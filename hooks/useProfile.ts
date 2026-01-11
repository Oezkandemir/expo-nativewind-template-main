import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { rewardService } from '@/lib/rewards/reward-service';
import { adTrackerService } from '@/lib/ads/ad-tracker';

/**
 * Profile statistics interface
 */
export interface ProfileStats {
  totalBalance: number;
  totalCampaigns: number;
  completedCampaigns: number;
  loading: boolean;
}

/**
 * Hook for fetching user profile statistics from Supabase
 * 
 * Returns:
 * - totalBalance: Total earned rewards in euros
 * - totalCampaigns: Total number of campaigns viewed
 * - completedCampaigns: Number of fully completed campaigns
 * - loading: Loading state
 * - refreshStats: Function to manually refresh statistics
 */
export function useProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    totalBalance: 0,
    totalCampaigns: 0,
    completedCampaigns: 0,
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadProfileStats();
    } else {
      setStats({
        totalBalance: 0,
        totalCampaigns: 0,
        completedCampaigns: 0,
        loading: false,
      });
    }
  }, [user]);

  /**
   * Load profile statistics from Supabase
   */
  const loadProfileStats = async () => {
    if (!user) return;

    setStats((prev) => ({ ...prev, loading: true }));

    try {
      // Fetch all stats in parallel for better performance
      const [totalBalance, totalCampaigns, completedCampaigns] = await Promise.all([
        rewardService.getUserTotalRewardsFromSupabase(user.id),
        adTrackerService.getTotalAdViewsCountFromSupabase(user.id),
        adTrackerService.getCompletedAdViewsCountFromSupabase(user.id),
      ]);

      setStats({
        totalBalance,
        totalCampaigns,
        completedCampaigns,
        loading: false,
      });
    } catch (error) {
      console.error('Load profile stats error:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Manually refresh profile statistics
   */
  const refreshStats = async () => {
    await loadProfileStats();
  };

  return {
    stats,
    refreshStats,
  };
}
