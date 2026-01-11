import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Ad, DailyAdStatus, AdView } from '@/types/ad';
import { AdSlot, getCurrentActiveSlot, getNextSlot, getTodayDateString } from '@/lib/ads/ad-scheduler';
import { adTrackerService } from '@/lib/ads/ad-tracker';
import { campaignService } from '@/lib/ads/campaign-service';
import { USER_REWARD_PER_CAMPAIGN } from '@/lib/rewards/reward-calculator';
import { rewardService } from '@/lib/rewards/reward-service';
import { useAuth } from './AuthContext';

interface AdContextType {
  currentSlot: AdSlot | null;
  nextSlot: AdSlot | null;
  dailyStatus: DailyAdStatus | null;
  currentAd: Ad | null;
  loading: boolean;
  refreshDailyStatus: () => Promise<void>;
  getAdForSlot: (slotId: string) => Promise<Ad | null>;
  completeAdView: (slotId: string, adId: string, duration: number) => Promise<void>;
  getTodayViews: () => Promise<AdView[]>;
  getViewsByDateRange: (days: number) => Promise<AdView[]>;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export function AdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentSlot, setCurrentSlot] = useState<AdSlot | null>(null);
  const [nextSlot, setNextSlot] = useState<AdSlot | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyAdStatus | null>(null);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeAdSystem();
      // Update slots every minute
      const interval = setInterval(() => {
        updateSlots();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const initializeAdSystem = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await refreshDailyStatus();
      updateSlots();
    } catch (error) {
      console.error('Initialize ad system error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSlots = () => {
    setCurrentSlot(getCurrentActiveSlot());
    setNextSlot(getNextSlot());
  };

  const refreshDailyStatus = async () => {
    if (!user) return;

    try {
      const status = await adTrackerService.getDailyAdStatus(user.id);
      setDailyStatus(status);
    } catch (error) {
      console.error('Refresh daily status error:', error);
    }
  };

  const getAdForSlot = async (slotId: string): Promise<Ad | null> => {
    if (!user) return null;

    try {
      // TEMPORARILY DISABLED FOR TESTING: Check if slot already completed
      // const completed = await adTrackerService.hasCompletedSlot(user.id, slotId);
      // if (completed) {
      //   return null; // Slot already completed
      // }

      // Get active campaigns from Supabase based on user interests
      const ads = await campaignService.getActiveCampaigns(user.interests);
      
      // If no campaigns available, return null
      if (ads.length === 0) {
        console.warn('No active campaigns available');
        return null;
      }
      
      // Select random ad from available campaigns
      const ad = ads[Math.floor(Math.random() * ads.length)];
      setCurrentAd(ad);
      return ad;
    } catch (error) {
      console.error('Get ad for slot error:', error);
      return null;
    }
  };

  const completeAdView = async (slotId: string, adId: string, duration: number) => {
    if (!user) return;

    // Get ad if not already set
    let ad = currentAd;
    if (!ad) {
      ad = await getAdForSlot(slotId);
    }
    if (!ad) {
      throw new Error('Ad not found');
    }

    try {
      // User always receives fixed reward per campaign (0.067€)
      // This ensures users earn exactly 10€ per month with 5 campaigns per day (150/month)
      const rewardAmount = USER_REWARD_PER_CAMPAIGN;

      // Record the view to Supabase (primary)
      // Store the actual user reward (0.067€), not the campaign reward_per_view (1€)
      const adViewId = await adTrackerService.recordAdViewToSupabase(
        user.id,
        ad.id,
        slotId,
        ad.campaignId,
        ad.content, // video URL
        duration,
        rewardAmount, // Use user reward, not campaign reward
        duration >= ad.duration // Verify if watched full duration
      );

      // Update campaign budget and stats
      if (duration >= ad.duration) {
        // Increment campaign spend (use actual campaign reward, not fixed amount)
        await campaignService.incrementCampaignSpend(ad.campaignId, ad.reward);
        
        // Update campaign stats (use actual campaign reward for stats)
        await campaignService.updateCampaignStats(
          ad.campaignId,
          getTodayDateString(),
          true,
          duration,
          ad.reward
        );
      }

      // Create reward from ad view in Supabase (primary)
      // User always receives fixed reward (0.067€), regardless of what merchant pays
      await rewardService.createRewardInSupabase(user.id, rewardAmount, adViewId);

      // Mark slot as completed
      await adTrackerService.completeSlot(user.id, slotId, ad.id);

      // Refresh daily status
      await refreshDailyStatus();

      // Clear current ad
      setCurrentAd(null);
    } catch (error) {
      console.error('Complete ad view error:', error);
      throw error;
    }
  };

  const getTodayViews = async (): Promise<AdView[]> => {
    if (!user) return [];
    return await adTrackerService.getTodayAdViewsFromSupabase(user.id);
  };

  const getViewsByDateRange = async (days: number): Promise<AdView[]> => {
    if (!user) return [];
    return await adTrackerService.getAdViewsFromSupabase(user.id, days);
  };

  return (
    <AdContext.Provider
      value={{
        currentSlot,
        nextSlot,
        dailyStatus,
        currentAd,
        loading,
        refreshDailyStatus,
        getAdForSlot,
        completeAdView,
        getTodayViews,
        getViewsByDateRange,
      }}
    >
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

