import { supabase } from '@/lib/supabase/client';
import { AdView, DailyAdStatus } from '@/types/ad';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getTodayDateString,
    initializeDailyAdStatus,
    markSlotCompleted,
} from './ad-scheduler';

const STORAGE_KEYS = {
  AD_VIEWS: '@spotx:ad_views',
  DAILY_STATUS: '@spotx:daily_ad_status',
} as const;

/**
 * Ad tracking service
 * Tracks ad views and daily completion status
 * Now uses Supabase for data persistence with AsyncStorage as fallback
 */
class AdTrackerService {
  /**
   * Get all ad views
   */
  async getAdViews(): Promise<AdView[]> {
    try {
      const viewsJson = await AsyncStorage.getItem(STORAGE_KEYS.AD_VIEWS);
      return viewsJson ? JSON.parse(viewsJson) : [];
    } catch (error) {
      console.error('Get ad views error:', error);
      return [];
    }
  }

  /**
   * Get ad views for a specific user
   */
  async getUserAdViews(userId: string): Promise<AdView[]> {
    const allViews = await this.getAdViews();
    return allViews.filter((view) => view.userId === userId);
  }

  /**
   * Get today's ad views for a user
   */
  async getTodayAdViews(userId: string): Promise<AdView[]> {
    const userViews = await this.getUserAdViews(userId);
    const today = getTodayDateString();
    return userViews.filter((view) => view.date === today);
  }

  /**
   * Record an ad view
   */
  async recordAdView(view: Omit<AdView, 'id' | 'watchedAt' | 'date'>): Promise<AdView> {
    try {
      const allViews = await this.getAdViews();

      const newView: AdView = {
        ...view,
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        watchedAt: new Date().toISOString(),
        date: getTodayDateString(),
      };

      allViews.push(newView);
      await AsyncStorage.setItem(STORAGE_KEYS.AD_VIEWS, JSON.stringify(allViews));

      return newView;
    } catch (error) {
      console.error('Record ad view error:', error);
      throw error;
    }
  }

  /**
   * Get daily ad status for a user
   */
  async getDailyAdStatus(userId: string): Promise<DailyAdStatus> {
    try {
      const statusKey = `${STORAGE_KEYS.DAILY_STATUS}:${userId}`;
      const statusJson = await AsyncStorage.getItem(statusKey);

      if (statusJson) {
        const status: DailyAdStatus = JSON.parse(statusJson);
        const today = getTodayDateString();

        // If status is for today, return it
        if (status.date === today) {
          return status;
        }
      }

      // Initialize new status for today
      return initializeDailyAdStatus();
    } catch (error) {
      console.error('Get daily ad status error:', error);
      return initializeDailyAdStatus();
    }
  }

  /**
   * Update daily ad status
   */
  async updateDailyAdStatus(
    userId: string,
    status: DailyAdStatus
  ): Promise<void> {
    try {
      const statusKey = `${STORAGE_KEYS.DAILY_STATUS}:${userId}`;
      await AsyncStorage.setItem(statusKey, JSON.stringify(status));
    } catch (error) {
      console.error('Update daily ad status error:', error);
      throw error;
    }
  }

  /**
   * Mark a slot as completed
   */
  async completeSlot(
    userId: string,
    slotId: string,
    adId: string
  ): Promise<DailyAdStatus> {
    const status = await this.getDailyAdStatus(userId);
    const updatedStatus = markSlotCompleted(status, slotId, adId);
    await this.updateDailyAdStatus(userId, updatedStatus);
    return updatedStatus;
  }

  /**
   * Check if user has completed a slot today
   */
  async hasCompletedSlot(userId: string, slotId: string): Promise<boolean> {
    const status = await this.getDailyAdStatus(userId);
    return status.slots.some((slot) => slot.slotId === slotId && slot.completed);
  }

  /**
   * Get total ad views count for a user
   */
  async getTotalAdViewsCount(userId: string): Promise<number> {
    const userViews = await this.getUserAdViews(userId);
    return userViews.length;
  }

  /**
   * Get today's ad views count for a user
   */
  async getTodayAdViewsCount(userId: string): Promise<number> {
    const todayViews = await this.getTodayAdViews(userId);
    return todayViews.length;
  }

  /**
   * Get ad views for a user within a date range
   */
  async getAdViewsByDateRange(
    userId: string,
    days: number
  ): Promise<AdView[]> {
    const userViews = await this.getUserAdViews(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    return userViews.filter((view) => {
      const viewDate = new Date(view.watchedAt);
      return viewDate >= cutoffDate;
    });
  }

  // ============================================================
  // SUPABASE METHODS - Primary data source
  // ============================================================

  /**
   * Record an ad view to Supabase
   * This is now the primary method for recording views
   */
  async recordAdViewToSupabase(
    userId: string,
    adId: string,
    slotId: string,
    campaignId: string,
    videoUrl: string,
    duration: number,
    rewardEarned: number,
    verified: boolean
  ): Promise<string> {
    try {
      // Round duration to integer for Supabase (watched_duration is INTEGER type)
      const durationInt = Math.round(duration);

      const { data, error } = await supabase
        .from('ad_views')
        .insert({
          user_id: userId,
          ad_slot_id: slotId,
          campaign_id: campaignId,
          campaign_id_uuid: campaignId, // Also set UUID for proper foreign key relationship
          video_url: videoUrl,
          watched_duration: durationInt,
          completed: verified,
          reward_earned: rewardEarned,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Save to AsyncStorage as backup with the same UUID from Supabase
      try {
        const allViews = await this.getAdViews();
        const newView: AdView = {
          id: (data as any).id, // Use UUID from Supabase
          userId,
          adId,
          slotId,
          watchedAt: (data as any).viewed_at,
          duration,
          rewardEarned,
          verified,
          date: (data as any).viewed_at.split('T')[0],
        };

        if (new Date((data as any).viewed_at).toDateString() !== new Date().toDateString()) {
          console.warn('⚠️ Supabase returned different viewed_at date than expected');
        }

        allViews.push(newView);
        await AsyncStorage.setItem(STORAGE_KEYS.AD_VIEWS, JSON.stringify(allViews));
      } catch (storageError) {
        console.warn('AsyncStorage backup failed:', storageError);
      }

      // Return the UUID from Supabase
      return (data as any).id;
    } catch (error) {
      console.error('Record ad view to Supabase error:', error);
      // Fallback to AsyncStorage only
      const view = await this.recordAdView({
        userId,
        adId,
        slotId,
        duration,
        rewardEarned,
        verified,
      });
      // Note: This returns a generated ID, not a UUID
      // Reward creation might fail in this case
      return view.id;
    }
  }

  /**
   * Get ad views from Supabase for a specific user
   */
  async getAdViewsFromSupabase(
    userId: string,
    days?: number
  ): Promise<AdView[]> {
    try {
      let query = supabase
        .from('ad_views')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false });

      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('viewed_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform Supabase data to AdView format
      return (data as any[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        adId: row.campaign_id, // Using campaign_id as adId
        slotId: row.ad_slot_id,
        watchedAt: row.viewed_at,
        duration: row.watched_duration,
        rewardEarned: row.reward_earned,
        verified: row.completed,
        date: row.viewed_at.split('T')[0], // Extract YYYY-MM-DD
      }));
    } catch (error) {
      console.error('Get ad views from Supabase error:', error);
      // Fallback to AsyncStorage
      if (days) {
        return this.getAdViewsByDateRange(userId, days);
      }
      return this.getUserAdViews(userId);
    }
  }

  /**
   * Get today's ad views from Supabase
   */
  async getTodayAdViewsFromSupabase(userId: string): Promise<AdView[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error } = await supabase
        .from('ad_views')
        .select('*')
        .eq('user_id', userId)
        .gte('viewed_at', todayISO)
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to AdView format
      return (data as any[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        adId: row.campaign_id,
        slotId: row.ad_slot_id,
        watchedAt: row.viewed_at,
        duration: row.watched_duration,
        rewardEarned: row.reward_earned,
        verified: row.completed,
        date: row.viewed_at.split('T')[0],
      }));
    } catch (error) {
      console.error('Get today ad views from Supabase error:', error);
      // Fallback to AsyncStorage
      return this.getTodayAdViews(userId);
    }
  }

  /**
   * Get total ad views count from Supabase
   */
  async getTotalAdViewsCountFromSupabase(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ad_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get total ad views count from Supabase error:', error);
      // Fallback to AsyncStorage
      return this.getTotalAdViewsCount(userId);
    }
  }

  /**
   * Get completed ad views count from Supabase
   */
  async getCompletedAdViewsCountFromSupabase(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ad_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get completed ad views count from Supabase error:', error);
      // Fallback to count from AsyncStorage
      const views = await this.getUserAdViews(userId);
      return views.filter((v) => v.verified).length;
    }
  }
}

export const adTrackerService = new AdTrackerService();



