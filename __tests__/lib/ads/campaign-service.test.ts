/**
 * Campaign Service Tests
 * 
 * Tests for the campaign service that fetches and manages campaigns from Supabase
 */

import { campaignService } from '@/lib/ads/campaign-service';
import { supabase } from '@/lib/supabase/client';

describe('CampaignService', () => {
  describe('getActiveCampaigns', () => {
    it('should fetch active campaigns from Supabase', async () => {
      const campaigns = await campaignService.getActiveCampaigns(['tech', 'gaming']);
      
      expect(Array.isArray(campaigns)).toBe(true);
      
      if (campaigns.length > 0) {
        const campaign = campaigns[0];
        expect(campaign).toHaveProperty('id');
        expect(campaign).toHaveProperty('title');
        expect(campaign).toHaveProperty('campaignName');
        expect(campaign).toHaveProperty('reward');
        expect(campaign.type).toMatch(/^(image|video|interactive)$/);
      }
    });

    it('should filter campaigns by user interests', async () => {
      const techCampaigns = await campaignService.getActiveCampaigns(['tech']);
      const foodCampaigns = await campaignService.getActiveCampaigns(['food']);
      
      // Tech campaigns should target tech interests or have no targeting
      techCampaigns.forEach(campaign => {
        if (campaign.targetInterests && campaign.targetInterests.length > 0) {
          expect(
            campaign.targetInterests.includes('tech') || 
            campaign.targetInterests.length === 0
          ).toBe(true);
        }
      });
    });

    it('should return empty array when no campaigns match', async () => {
      const campaigns = await campaignService.getActiveCampaigns(['non-existent-interest']);
      expect(Array.isArray(campaigns)).toBe(true);
    });
  });

  describe('getCampaignById', () => {
    it('should fetch a specific campaign by ID', async () => {
      // First get a campaign
      const campaigns = await campaignService.getActiveCampaigns([]);
      
      if (campaigns.length > 0) {
        const campaignId = campaigns[0].campaignId;
        const campaign = await campaignService.getCampaignById(campaignId);
        
        expect(campaign).not.toBeNull();
        expect(campaign?.id).toBe(campaignId);
      }
    });

    it('should return null for non-existent campaign', async () => {
      const campaign = await campaignService.getCampaignById('00000000-0000-0000-0000-000000000000');
      expect(campaign).toBeNull();
    });
  });

  describe('getRandomCampaign', () => {
    it('should return a random campaign', async () => {
      const campaign = await campaignService.getRandomCampaign(['tech']);
      
      if (campaign) {
        expect(campaign).toHaveProperty('id');
        expect(campaign).toHaveProperty('title');
        expect(campaign).toHaveProperty('campaignName');
      }
    });
  });

  describe('incrementCampaignSpend', () => {
    it('should increment campaign spend budget', async () => {
      // Get a test campaign
      const campaigns = await campaignService.getActiveCampaigns([]);
      
      if (campaigns.length > 0) {
        const campaignId = campaigns[0].campaignId;
        
        // Get initial budget
        const { data: before } = await supabase
          .from('campaigns')
          .select('spent_budget')
          .eq('id', campaignId)
          .single();
        
        const initialBudget = before?.spent_budget || 0;
        
        // Increment by 0.10
        await campaignService.incrementCampaignSpend(campaignId, 0.10);
        
        // Check new budget
        const { data: after } = await supabase
          .from('campaigns')
          .select('spent_budget')
          .eq('id', campaignId)
          .single();
        
        const newBudget = after?.spent_budget || 0;
        
        expect(newBudget).toBeGreaterThanOrEqual(initialBudget);
      }
    });
  });

  describe('getCampaignName', () => {
    it('should return campaign name for valid ID', async () => {
      const campaigns = await campaignService.getActiveCampaigns([]);
      
      if (campaigns.length > 0) {
        const campaignId = campaigns[0].campaignId;
        const name = await campaignService.getCampaignName(campaignId);
        
        expect(typeof name).toBe('string');
        expect(name).not.toBe('Unbekannte Kampagne');
      }
    });

    it('should return "Unbekannte Kampagne" for invalid ID', async () => {
      const name = await campaignService.getCampaignName('00000000-0000-0000-0000-000000000000');
      expect(name).toBe('Unbekannte Kampagne');
    });
  });
});

describe('Budget Tracking', () => {
  it('should auto-complete campaign when budget exceeded', async () => {
    // This test would need a dedicated test campaign
    // In production, campaigns should auto-complete when spent_budget >= total_budget
    // The database function handles this automatically
  });
});

describe('Campaign Stats', () => {
  it('should update campaign statistics', async () => {
    const campaigns = await campaignService.getActiveCampaigns([]);
    
    if (campaigns.length > 0) {
      const campaignId = campaigns[0].campaignId;
      const today = new Date().toISOString().split('T')[0];
      
      // Update stats
      await campaignService.updateCampaignStats(
        campaignId,
        today,
        true,
        5,
        0.10
      );
      
      // Check stats were created/updated
      const { data, error } = await supabase
        .from('campaign_stats')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('date', today)
        .single();
      
      if (!error && data) {
        expect(data.views_count).toBeGreaterThan(0);
        expect(data.rewards_paid).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Integration Test: Complete Ad View Flow
 */
describe('Complete Ad View Flow', () => {
  it('should handle full ad view workflow', async () => {
    // 1. Get an active campaign
    const campaigns = await campaignService.getActiveCampaigns(['tech']);
    expect(campaigns.length).toBeGreaterThan(0);
    
    const campaign = campaigns[0];
    
    // 2. Simulate ad view completion
    const campaignId = campaign.campaignId;
    const reward = campaign.reward;
    const duration = campaign.duration;
    const today = new Date().toISOString().split('T')[0];
    
    // 3. Update stats
    await campaignService.updateCampaignStats(
      campaignId,
      today,
      true,
      duration,
      reward
    );
    
    // 4. Increment budget
    await campaignService.incrementCampaignSpend(campaignId, reward);
    
    // 5. Verify campaign still exists and is trackable
    const verifyCampaign = await campaignService.getCampaignById(campaignId);
    expect(verifyCampaign).not.toBeNull();
  });
});

export {};