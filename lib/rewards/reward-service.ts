import { supabase } from '@/lib/supabase/client';
import { Payout, Reward } from '@/types/reward';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  REWARDS: '@spotx:rewards',
  PAYOUTS: '@spotx:payouts',
} as const;

/**
 * Reward service for managing rewards and payouts
 * Now uses Supabase for data persistence with AsyncStorage as fallback
 */
class RewardService {
  /**
   * Get all rewards for a user
   */
  async getUserRewards(userId: string): Promise<Reward[]> {
    try {
      const rewardsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
      const allRewards: Reward[] = rewardsJson ? JSON.parse(rewardsJson) : [];
      return allRewards.filter((reward) => reward.userId === userId);
    } catch (error) {
      console.error('Get user rewards error:', error);
      return [];
    }
  }

  /**
   * Create a reward from an ad view
   */
  async createRewardFromAdView(
    userId: string,
    adViewId: string,
    amount: number
  ): Promise<Reward> {
    try {
      const rewardsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
      const allRewards: Reward[] = rewardsJson ? JSON.parse(rewardsJson) : [];

      const newReward: Reward = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        source: 'ad_view',
        sourceId: adViewId,
        status: 'earned',
        description: 'Kampagne unterstützt',
        createdAt: new Date().toISOString(),
      };

      allRewards.push(newReward);
      await AsyncStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(allRewards));

      return newReward;
    } catch (error) {
      console.error('Create reward error:', error);
      throw error;
    }
  }

  /**
   * Get reward history for a user
   */
  async getRewardHistory(userId: string, limit?: number): Promise<Reward[]> {
    const rewards = await this.getUserRewards(userId);
    const sorted = rewards.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get payouts for a user
   */
  async getUserPayouts(userId: string): Promise<Payout[]> {
    try {
      const payoutsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYOUTS);
      const allPayouts: Payout[] = payoutsJson ? JSON.parse(payoutsJson) : [];
      return allPayouts.filter((payout) => payout.userId === userId);
    } catch (error) {
      console.error('Get user payouts error:', error);
      return [];
    }
  }

  /**
   * Request a payout (dummy implementation)
   */
  async requestPayout(userId: string, amount: number): Promise<Payout> {
    try {
      const payoutsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYOUTS);
      const allPayouts: Payout[] = payoutsJson ? JSON.parse(payoutsJson) : [];

      const newPayout: Payout = {
        id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      allPayouts.push(newPayout);
      await AsyncStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(allPayouts));

      return newPayout;
    } catch (error) {
      console.error('Request payout error:', error);
      throw error;
    }
  }

  // ============================================================
  // SUPABASE METHODS - Primary data source
  // ============================================================

  /**
   * Create a reward in Supabase from an ad view
   * This is now the primary method for creating rewards
   */
  async createRewardInSupabase(
    userId: string,
    amount: number,
    adViewId: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          amount,
          type: 'ad_view',
          description: 'Kampagne unterstützt',
          ad_view_id: adViewId,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Save to AsyncStorage as backup with the same UUID from Supabase
      try {
        const rewardsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
        const allRewards: Reward[] = rewardsJson ? JSON.parse(rewardsJson) : [];

        const newReward: Reward = {
          id: (data as any).id, // Use UUID from Supabase
          userId,
          amount,
          source: 'ad_view',
          sourceId: adViewId,
          status: 'earned',
          description: 'Kampagne unterstützt',
          createdAt: (data as any).created_at,
        };

        allRewards.push(newReward);
        await AsyncStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(allRewards));
      } catch (storageError) {
        console.warn('AsyncStorage backup failed:', storageError);
      }

      return (data as any).id;
    } catch (error) {
      console.error('Create reward in Supabase error:', error);
      // Fallback to AsyncStorage only
      const reward = await this.createRewardFromAdView(userId, adViewId, amount);
      return reward.id;
    }
  }

  /**
   * Get user's total earned rewards from Supabase
   * Uses the user_total_rewards view for optimized querying
   */
  async getUserTotalRewardsFromSupabase(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_total_rewards')
        .select('total_earned')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If view doesn't exist or no data, calculate from rewards table
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('amount')
          .eq('user_id', userId);

        if (rewardsError) throw rewardsError;

        return (rewardsData as any[]).reduce((sum, reward) => sum + reward.amount, 0);
      }

      return (data as any)?.total_earned || 0;
    } catch (error) {
      console.error('Get user total rewards from Supabase error:', error);
      // Fallback to AsyncStorage
      const rewards = await this.getUserRewards(userId);
      return rewards.reduce((sum, reward) => sum + reward.amount, 0);
    }
  }

  /**
   * Get user rewards from Supabase
   */
  async getUserRewardsFromSupabase(
    userId: string,
    limit?: number
  ): Promise<Reward[]> {
    try {
      let query = supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform Supabase data to Reward format
      return (data as any[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        source: row.type,
        sourceId: row.ad_view_id || '',
        status: 'earned' as const,
        description: row.description || 'Kampagne unterstützt',
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Get user rewards from Supabase error:', error);
      // Fallback to AsyncStorage
      return this.getRewardHistory(userId, limit);
    }
  }

  /**
   * Get reward history from Supabase
   */
  async getRewardHistoryFromSupabase(
    userId: string,
    limit?: number
  ): Promise<Reward[]> {
    return this.getUserRewardsFromSupabase(userId, limit);
  }

  /**
   * Get recent rewards from Supabase (last 10 by default)
   */
  async getRecentRewardsFromSupabase(
    userId: string,
    limit: number = 10
  ): Promise<Reward[]> {
    return this.getUserRewardsFromSupabase(userId, limit);
  }

  /**
   * Calculate total balance from Supabase
   * Convenience method that wraps getUserTotalRewardsFromSupabase
   */
  async calculateBalanceFromSupabase(userId: string): Promise<number> {
    return this.getUserTotalRewardsFromSupabase(userId);
  }
}

export const rewardService = new RewardService();



