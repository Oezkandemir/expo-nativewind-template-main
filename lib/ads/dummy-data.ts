import { Ad } from '@/types/ad';

/**
 * Dummy ad campaigns for testing
 * In production, these would come from a backend/Supabase
 */
export const DUMMY_ADS: Ad[] = [
  {
    id: 'ad_1',
    title: 'Neues Smartphone',
    content: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
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
    type: 'image',
    duration: 5,
    reward: 0.18,
    campaignId: 'campaign_10',
    campaignName: 'Luxury Campaign',
    targetInterests: ['fashion', 'luxury'],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get a random ad (for demo purposes)
 * In production, this would match user interests and return targeted ads
 */
export function getRandomAd(): Ad {
  const randomIndex = Math.floor(Math.random() * DUMMY_ADS.length);
  return DUMMY_ADS[randomIndex];
}

/**
 * Get an ad by ID
 */
export function getAdById(adId: string): Ad | undefined {
  return DUMMY_ADS.find((ad) => ad.id === adId);
}

/**
 * Get ads matching user interests
 */
export function getAdsForInterests(userInterests: string[]): Ad[] {
  if (userInterests.length === 0) {
    return DUMMY_ADS;
  }

  return DUMMY_ADS.filter((ad) => {
    if (!ad.targetInterests || ad.targetInterests.length === 0) {
      return true; // Show ads without specific targeting
    }
    return ad.targetInterests.some((interest) => userInterests.includes(interest));
  });
}


