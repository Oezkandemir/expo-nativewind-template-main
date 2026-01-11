import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Reward, RewardSummary, Payout } from '@/types/reward';
import { rewardService } from '@/lib/rewards/reward-service';
import { calculateRewardSummary } from '@/lib/rewards/reward-calculator';
import { useAuth } from './AuthContext';

interface RewardContextType {
  summary: RewardSummary | null;
  recentRewards: Reward[];
  payouts: Payout[];
  loading: boolean;
  refreshSummary: () => Promise<void>;
  refreshRewards: () => Promise<void>;
  refreshPayouts: () => Promise<void>;
  requestPayout: (amount: number) => Promise<Payout | null>;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export function RewardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [recentRewards, setRecentRewards] = useState<Reward[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRewardData();
    }
  }, [user]);

  const loadRewardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([refreshSummary(), refreshRewards(), refreshPayouts()]);
    } catch (error) {
      console.error('Load reward data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSummary = async () => {
    if (!user) return;

    try {
      const newSummary = await calculateRewardSummary(user.id);
      setSummary(newSummary);
    } catch (error) {
      console.error('Refresh summary error:', error);
    }
  };

  const refreshRewards = async () => {
    if (!user) return;

    try {
      // Use Supabase method (primary)
      const rewards = await rewardService.getRecentRewardsFromSupabase(user.id, 10);
      setRecentRewards(rewards);
    } catch (error) {
      console.error('Refresh rewards error:', error);
    }
  };

  const refreshPayouts = async () => {
    if (!user) return;

    try {
      const userPayouts = await rewardService.getUserPayouts(user.id);
      setPayouts(userPayouts);
    } catch (error) {
      console.error('Refresh payouts error:', error);
    }
  };

  const requestPayout = async (amount: number): Promise<Payout | null> => {
    if (!user) return null;

    try {
      const payout = await rewardService.requestPayout(user.id, amount);
      await refreshPayouts();
      await refreshSummary();
      return payout;
    } catch (error) {
      console.error('Request payout error:', error);
      return null;
    }
  };

  return (
    <RewardContext.Provider
      value={{
        summary,
        recentRewards,
        payouts,
        loading,
        refreshSummary,
        refreshRewards,
        refreshPayouts,
        requestPayout,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardProvider');
  }
  return context;
}

