/**
 * Migration Script: Migrate DUMMY_ADS to Supabase campaigns table
 * 
 * This script:
 * 1. Creates a system merchant account
 * 2. Migrates all DUMMY_ADS to real campaigns in Supabase
 * 3. Updates existing ad_views to reference the new campaigns
 */

import { createClient } from '@supabase/supabase-js';

// Try to import config.local, but fall back to environment variables
let SUPABASE_CONFIG: { url: string; anonKey: string };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = require('../lib/supabase/config.local');
  SUPABASE_CONFIG = config.SUPABASE_CONFIG;
} catch {
  // Fall back to environment variables (for CI/CD)
  SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

// Create Supabase client
const supabase = createClient<any>(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Define DUMMY_ADS locally to avoid React Native imports
const DUMMY_ADS = [
  {
    id: 'ad_1',
    title: 'Neues Smartphone',
    content: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.10,
    campaignId: 'campaign_1',
    campaignName: 'Tech Campaign',
    targetInterests: ['tech', 'gaming'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_2',
    title: 'Sportbekleidung',
    content: 'https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.15,
    campaignId: 'campaign_2',
    campaignName: 'Fitness Campaign',
    targetInterests: ['sports', 'fitness'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_3',
    title: 'Mode Kollektion',
    content: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.12,
    campaignId: 'campaign_3',
    campaignName: 'Fashion Campaign',
    targetInterests: ['fashion', 'art'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_4',
    title: 'Restaurant Angebot',
    content: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.08,
    campaignId: 'campaign_4',
    campaignName: 'Food Campaign',
    targetInterests: ['food'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_5',
    title: 'Reiseangebot',
    content: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.20,
    campaignId: 'campaign_5',
    campaignName: 'Travel Campaign',
    targetInterests: ['travel'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_6',
    title: 'Premium Kopfhörer',
    content: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.11,
    campaignId: 'campaign_6',
    campaignName: 'Audio Campaign',
    targetInterests: ['tech', 'music'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_7',
    title: 'Wellness & Spa',
    content: 'https://images.pexels.com/photos/3772618/pexels-photo-3772618.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.13,
    campaignId: 'campaign_7',
    campaignName: 'Wellness Campaign',
    targetInterests: ['wellness', 'health'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_8',
    title: 'Elektroauto',
    content: 'https://images.pexels.com/photos/3846209/pexels-photo-3846209.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.25,
    campaignId: 'campaign_8',
    campaignName: 'Automotive Campaign',
    targetInterests: ['tech', 'automotive'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_9',
    title: 'Kaffee Spezialitäten',
    content: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.09,
    campaignId: 'campaign_9',
    campaignName: 'Beverage Campaign',
    targetInterests: ['food', 'beverages'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad_10',
    title: 'Luxus Uhr',
    content: 'https://images.pexels.com/photos/997910/pexels-photo-997910.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image' as const,
    duration: 5,
    reward: 0.18,
    campaignId: 'campaign_10',
    campaignName: 'Luxury Campaign',
    targetInterests: ['fashion', 'luxury'],
    createdAt: new Date().toISOString(),
  },
];

interface MigrationResult {
  success: boolean;
  merchantId?: string;
  campaignsCreated?: number;
  error?: string;
}

async function migrateDummyCampaigns(): Promise<MigrationResult> {
  console.log('🚀 Starting campaign migration...\n');

  try {
    // Step 1: Create system merchant
    console.log('📝 Creating system merchant account...');
    
    const { data: existingMerchant, error: checkError } = await supabase
      .from('merchants')
      .select('id')
      .eq('business_email', 'demo@spotx.com')
      .single();

    let merchantId: string;

    if (existingMerchant) {
      console.log('✅ System merchant already exists:', existingMerchant.id);
      merchantId = existingMerchant.id;
    } else {
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          company_name: 'SpotX Demo',
          business_email: 'demo@spotx.com',
          phone: '+49 123 456789',
          website: 'https://spotx.com',
          status: 'approved',
          verified: true,
        })
        .select()
        .single();

      if (merchantError || !merchant) {
        throw new Error(`Failed to create merchant: ${merchantError?.message}`);
      }

      console.log('✅ System merchant created:', merchant.id);
      merchantId = merchant.id;
    }

    // Step 2: Migrate campaigns from DUMMY_ADS
    console.log('\n📊 Migrating campaigns from DUMMY_ADS...');
    console.log(`   Found ${DUMMY_ADS.length} campaigns to migrate\n`);

    const campaignMapping: Record<string, string> = {};

    for (const ad of DUMMY_ADS) {
      console.log(`   Migrating: ${ad.campaignName} (${ad.campaignId})`);

      // Check if campaign already exists
      const { data: existing } = await supabase
        .from('campaigns')
        .select('id')
        .eq('name', ad.campaignName)
        .eq('merchant_id', merchantId)
        .single();

      if (existing) {
        console.log(`   ⏭️  Campaign already exists, skipping...`);
        campaignMapping[ad.campaignId] = existing.id;
        continue;
      }

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          merchant_id: merchantId,
          name: ad.campaignName,
          title: ad.title,
          description: `Demo campaign for ${ad.campaignName}`,
          content_type: ad.type,
          content_url: ad.content,
          target_interests: ad.targetInterests || [],
          duration_seconds: ad.duration,
          reward_per_view: ad.reward,
          total_budget: 10000, // €10,000 demo budget
          spent_budget: 0,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: null, // No end date for demo campaigns
        })
        .select()
        .single();

      if (campaignError || !campaign) {
        console.log(`   ❌ Error: ${campaignError?.message}`);
        continue;
      }

      campaignMapping[ad.campaignId] = campaign.id;
      console.log(`   ✅ Created: ${campaign.id}`);
    }

    console.log(`\n✅ Successfully migrated ${Object.keys(campaignMapping).length} campaigns`);

    // Step 3: Update existing ad_views to reference new campaigns
    console.log('\n🔄 Updating existing ad_views...');

    for (const [oldId, newId] of Object.entries(campaignMapping)) {
      const { error: updateError } = await supabase
        .from('ad_views')
        .update({ campaign_id_uuid: newId })
        .eq('campaign_id', oldId);

      if (updateError) {
        console.log(`   ⚠️  Warning: Could not update ad_views for ${oldId}: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated ad_views: ${oldId} → ${newId}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Merchant ID: ${merchantId}`);
    console.log(`   Campaigns created: ${Object.keys(campaignMapping).length}`);
    console.log(`   Campaign mapping:`, campaignMapping);

    return {
      success: true,
      merchantId,
      campaignsCreated: Object.keys(campaignMapping).length,
    };

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run migration
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════');
  console.log('   SpotX Campaign Migration Script');
  console.log('═══════════════════════════════════════════════════\n');

  migrateDummyCampaigns()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Migration successful!');
        process.exit(0);
      } else {
        console.error('\n❌ Migration failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { migrateDummyCampaigns };
