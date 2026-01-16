/**
 * Campaign Service
 * 
 * Service to fetch and manage campaigns from Supabase.
 * Replaces the old DUMMY_ADS approach with real database queries.
 */

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { Ad } from '@/types/ad';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

export class CampaignService {
  /**
   * Get active campaigns based on user interests
   * 
   * @param userInterests - Array of user's interests for targeting
   * @returns Promise with array of Ad objects
   */
  async getActiveCampaigns(userInterests: string[]): Promise<Ad[]> {
    try {
      const now = new Date().toISOString();

      // Fetch active campaigns
      // Only get campaigns that are active and haven't exceeded their budget
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`);

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Filter out campaigns that have exceeded their budget
      const campaignsWithinBudget = (data as unknown as Campaign[]).filter((campaign) => {
        const spent = Number(campaign.spent_budget) || 0;
        const total = Number(campaign.total_budget) || 0;
        return spent < total;
      });

      if (campaignsWithinBudget.length === 0) {
        return [];
      }

      // Filter by interests if user has any
      let filtered = campaignsWithinBudget;
      if (userInterests && userInterests.length > 0) {
        filtered = (data as unknown as Campaign[]).filter((campaign) => {
          // If campaign has no targeting, show to everyone
          if (!campaign.target_interests || campaign.target_interests.length === 0) {
            return true;
          }
          
          // Check if any user interest matches campaign targeting
          return campaign.target_interests.some((interest) =>
            userInterests.includes(interest)
          );
        });

        // If no campaigns match interests, fall back to all campaigns
        if (filtered.length === 0) {
          filtered = data as unknown as Campaign[];
        }
      }

      // Convert to Ad format
      return filtered.map(this.campaignToAd);
    } catch (error) {
      console.error('Error in getActiveCampaigns:', error);
      return [];
    }
  }

  /**
   * Get a specific campaign by ID
   * Used for displaying campaign details in history
   * Note: RLS policies allow users to view active campaigns
   * 
   * @param campaignId - UUID of the campaign
   * @returns Promise with Ad object or null
   */
  async getCampaignById(campaignId: string): Promise<Ad | null> {
    try {
      // Use maybeSingle() instead of single() to avoid errors when campaign doesn't exist
      // This is better for cases where campaign might not be found (e.g., deleted, inactive, RLS blocked)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) {
        // Only log non-404 errors (PGRST116 is "no rows found", which is expected)
        if (error.code !== 'PGRST116') {
          console.error('Error fetching campaign:', error);
        }
        // Try fallback with explicit status filter
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (fallbackError) {
          // Only log non-404 errors
          if (fallbackError.code !== 'PGRST116') {
            console.error('Error fetching campaign (fallback):', fallbackError);
          }
          return null;
        }
        
        if (!fallbackData) {
          return null;
        }
        
        return this.campaignToAd(fallbackData as unknown as Campaign);
      }

      if (!data) {
        return null;
      }

      return this.campaignToAd(data as unknown as Campaign);
    } catch (error) {
      console.error('Error in getCampaignById:', error);
      return null;
    }
  }

  /**
   * Get a random active campaign
   * 
   * @param userInterests - Optional array of user interests
   * @returns Promise with random Ad or null
   */
  async getRandomCampaign(userInterests?: string[]): Promise<Ad | null> {
    try {
      const campaigns = await this.getActiveCampaigns(userInterests || []);
      
      if (campaigns.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * campaigns.length);
      return campaigns[randomIndex];
    } catch (error) {
      console.error('Error in getRandomCampaign:', error);
      return null;
    }
  }

  /**
   * Increment campaign spend after an ad view
   * This updates the spent_budget and auto-completes campaign if budget exceeded
   * 
   * @param campaignId - UUID of the campaign
   * @param amount - Amount to add to spent budget
   */
  async incrementCampaignSpend(
    campaignId: string,
    amount: number
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_campaign_spend', {
        p_campaign_id: campaignId,
        p_spend_amount: amount,
      } as any);

      if (error) {
        console.error('Error incrementing campaign spend:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in incrementCampaignSpend:', error);
      throw error;
    }
  }

  /**
   * Update campaign statistics
   * 
   * @param campaignId - UUID of the campaign
   * @param date - Date of the view (YYYY-MM-DD)
   * @param completed - Whether the view was completed
   * @param watchTime - Watch time in seconds
   * @param reward - Reward amount
   */
  async updateCampaignStats(
    campaignId: string,
    date: string,
    completed: boolean,
    watchTime: number,
    reward: number
  ): Promise<void> {
    try {
      // Round watchTime to integer (database expects INTEGER, not DECIMAL)
      const watchTimeInteger = Math.round(watchTime);
      
      const { error } = await supabase.rpc('update_campaign_stats', {
        p_campaign_id: campaignId,
        p_date: date,
        p_completed: completed,
        p_watch_time: watchTimeInteger,
        p_reward: reward,
      } as any);

      if (error) {
        console.error('Error updating campaign stats:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateCampaignStats:', error);
      throw error;
    }
  }

  /**
   * Get campaign name by ID
   * Used for displaying campaign names in history
   * 
   * @param campaignId - UUID of the campaign
   * @returns Campaign name (or title as fallback) or "Unbekannte Kampagne"
   */
  async getCampaignName(campaignId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('name, title')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) {
        // Only log non-404 errors (PGRST116 is "no rows found", which is expected)
        if (error.code !== 'PGRST116') {
          console.error('Error fetching campaign name:', error);
        }
        return 'Unbekannte Kampagne';
      }

      if (!data) {
        return 'Unbekannte Kampagne';
      }

      // Return name if available, otherwise use title as fallback
      const campaignData = data as any;
      return campaignData.name || campaignData.title || 'Unbekannte Kampagne';
    } catch (error) {
      console.error('Error in getCampaignName:', error);
      return 'Unbekannte Kampagne';
    }
  }

  /**
   * Convert Campaign database row to Ad interface
   * 
   * @param campaign - Campaign row from database
   * @returns Ad object
   */
  private campaignToAd(campaign: Campaign): Ad {
    return {
      id: campaign.id,
      title: campaign.title,
      content: campaign.content_url,
      type: campaign.content_type as 'image' | 'video' | 'interactive',
      duration: campaign.duration_seconds,
      reward: Number(campaign.reward_per_view),
      campaignId: campaign.id,
      campaignName: campaign.name,
      targetInterests: campaign.target_interests || [],
      createdAt: campaign.created_at,
    };
  }
}

// Export singleton instance
export const campaignService = new CampaignService();
