/**
 * Cleanup Script: Remove or fix invalid campaign entries for user "demir"
 * 
 * This script:
 * 1. Finds the user "demir" in the database
 * 2. Lists all ad_views with their campaign_ids
 * 3. Identifies entries with invalid/unknown campaign_ids
 * 4. Offers to delete or update them
 */

import { DUMMY_ADS } from '../lib/ads/dummy-data';
import { supabase } from '../lib/supabase/client';

// Get all valid campaign IDs from dummy data
const VALID_CAMPAIGN_IDS = DUMMY_ADS.map(ad => ad.campaignId);

async function cleanupUserCampaigns() {
  console.log('🔍 Starting cleanup for user "demir"...\n');

  try {
    // 1. Find user by email containing "demir"
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .ilike('email', '%demir%');

    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No user found with "demir" in email');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):`);
    users.forEach((user: any) => {
      console.log(`- ${user.name} (${user.email}): ${user.id}`);
    });
    console.log('');

    // 2. Check ad_views for each user
    for (const user of (users as any[])) {
      console.log(`\n📊 Checking ad_views for ${user.email}...`);
      
      const { data: adViews, error: viewsError } = await supabase
        .from('ad_views')
        .select('id, campaign_id, viewed_at, completed, reward_earned')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false });

      if (viewsError) {
        console.error('❌ Error fetching ad_views:', viewsError);
        continue;
      }

      if (!adViews || adViews.length === 0) {
        console.log('   ℹ️  No ad_views found');
        continue;
      }

      console.log(`   Found ${adViews.length} ad_view(s):\n`);

      // 3. Identify invalid campaigns
      const invalidViews: any[] = [];
      const validViews: any[] = [];

      (adViews as any[]).forEach(view => {
        const isValid = VALID_CAMPAIGN_IDS.includes(view.campaign_id);
        const status = isValid ? '✅' : '❌';
        const campaignInfo = isValid 
          ? `Valid: ${DUMMY_ADS.find((ad: any) => ad.campaignId === view.campaign_id)?.campaignName}`
          : `❌ Invalid Campaign ID: ${view.campaign_id}`;

        console.log(`   ${status} ${campaignInfo}`);
        console.log(`      ID: ${view.id}`);
        console.log(`      Viewed: ${new Date(view.viewed_at).toLocaleString('de-DE')}`);
        console.log(`      Completed: ${view.completed ? 'Yes' : 'No'}`);
        console.log(`      Reward: €${view.reward_earned}`);
        console.log('');

        if (isValid) {
          validViews.push(view);
        } else {
          invalidViews.push(view);
        }
      });

      // 4. Summary
      console.log(`\n📈 Summary for ${user.email}:`);
      console.log(`   ✅ Valid campaigns: ${validViews.length}`);
      console.log(`   ❌ Invalid campaigns: ${invalidViews.length}`);

      // 5. Delete invalid entries
      if (invalidViews.length > 0) {
        console.log(`\n🗑️  Deleting ${invalidViews.length} invalid ad_view(s)...`);
        
        for (const view of invalidViews) {
          // Delete associated rewards first
          const { error: rewardDeleteError } = await supabase
            .from('rewards')
            .delete()
            .eq('ad_view_id', view.id);

          if (rewardDeleteError) {
            console.error(`   ⚠️  Error deleting reward for ad_view ${view.id}:`, rewardDeleteError.message);
          } else {
            console.log(`   ✅ Deleted reward(s) for ad_view ${view.id}`);
          }

          // Delete ad_view
          const { error: viewDeleteError } = await supabase
            .from('ad_views')
            .delete()
            .eq('id', view.id);

          if (viewDeleteError) {
            console.error(`   ❌ Error deleting ad_view ${view.id}:`, viewDeleteError.message);
          } else {
            console.log(`   ✅ Deleted ad_view ${view.id}`);
          }
        }

        console.log(`\n✅ Cleanup complete! Deleted ${invalidViews.length} invalid entries.`);
      } else {
        console.log('\n✅ No invalid campaigns found - database is clean!');
      }
    }

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Available valid campaign IDs for reference
console.log('📋 Valid Campaign IDs:');
DUMMY_ADS.forEach((ad: any, index: number) => {
  console.log(`   ${index + 1}. ${ad.campaignId} - ${ad.campaignName}`);
});
console.log('');

// Run the cleanup
cleanupUserCampaigns();
