/**
 * Test Data Generation Script
 * 
 * Generiert verschiedene Merchant-User und Kampagnen für Tests
 * 
 * Usage:
 *   npx ts-node scripts/generate-test-data.ts
 * 
 * Oder mit tsx:
 *   npx tsx scripts/generate-test-data.ts
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

// Service Role Key aus Umgebungsvariable (falls gesetzt)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Erstelle Supabase Client mit Service Role Key (umgeht RLS)
const supabase = SERVICE_ROLE_KEY
  ? createClient<any>(SUPABASE_CONFIG.url, SERVICE_ROLE_KEY)
  : createClient<any>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Interessen für Targeting
const INTERESTS = [
  'Technology',
  'Fitness',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Wellness',
  'Automotive',
  'Beverages',
  'Luxury',
  'Sports',
  'Entertainment',
  'Education',
  'Health',
  'Beauty',
];

// Content Types
const CONTENT_TYPES = ['image', 'video', 'interactive'] as const;

// Status Optionen
const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed', 'cancelled'] as const;
const MERCHANT_STATUSES = ['pending', 'approved', 'suspended'] as const;

// Test Merchant Daten
const TEST_MERCHANTS = [
  {
    email: 'techcorp@test.com',
    password: 'TestPassword123!',
    companyName: 'TechCorp GmbH',
    phone: '+49 30 12345678',
    website: 'https://techcorp.de',
    status: 'approved' as const,
    verified: true,
  },
  {
    email: 'fitnessplus@test.com',
    password: 'TestPassword123!',
    companyName: 'Fitness Plus',
    phone: '+49 40 98765432',
    website: 'https://fitnessplus.de',
    status: 'approved' as const,
    verified: true,
  },
  {
    email: 'fashionboutique@test.com',
    password: 'TestPassword123!',
    companyName: 'Fashion Boutique',
    phone: '+49 89 55512345',
    website: 'https://fashionboutique.de',
    status: 'approved' as const,
    verified: true,
  },
  {
    email: 'fooddelivery@test.com',
    password: 'TestPassword123!',
    companyName: 'Food Delivery Express',
    phone: '+49 221 77788899',
    website: 'https://fooddelivery.de',
    status: 'approved' as const,
    verified: true,
  },
  {
    email: 'travelagency@test.com',
    password: 'TestPassword123!',
    companyName: 'Travel Agency Premium',
    phone: '+49 69 11122233',
    website: 'https://travelagency.de',
    status: 'approved' as const,
    verified: true,
  },
  {
    email: 'pendingmerchant@test.com',
    password: 'TestPassword123!',
    companyName: 'Pending Merchant Co.',
    phone: '+49 30 99988877',
    website: 'https://pendingmerchant.de',
    status: 'pending' as const,
    verified: false,
  },
  {
    email: 'suspendedmerchant@test.com',
    password: 'TestPassword123!',
    companyName: 'Suspended Merchant Ltd.',
    phone: '+49 40 66655544',
    website: 'https://suspendedmerchant.de',
    status: 'suspended' as const,
    verified: false,
  },
];

// Kampagnen-Templates für jeden Merchant
const CAMPAIGN_TEMPLATES: Record<string, Array<{
  name: string;
  title: string;
  description: string;
  content_type: typeof CONTENT_TYPES[number];
  content_url: string;
  target_interests: string[];
  target_age_min?: number;
  target_age_max?: number;
  target_gender?: string;
  duration_seconds: number;
  reward_per_view: number;
  total_budget: number;
  status: typeof CAMPAIGN_STATUSES[number];
  start_date?: string;
  end_date?: string;
}>> = {
  'techcorp@test.com': [
    {
      name: 'Neues Smartphone Launch',
      title: 'Das neueste Smartphone - Jetzt verfügbar!',
      description: 'Entdecken Sie unser neuestes Smartphone mit revolutionären Features',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Technology', 'Entertainment'],
      target_age_min: 18,
      target_age_max: 45,
      duration_seconds: 5,
      reward_per_view: 0.15,
      total_budget: 5000,
      status: 'active',
    },
    {
      name: 'Laptop Kollektion',
      title: 'Premium Laptops für Profis',
      description: 'Hochleistungs-Laptops für alle Ihre Bedürfnisse',
      content_type: 'video',
      content_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Technology', 'Education'],
      target_age_min: 25,
      target_age_max: 55,
      duration_seconds: 5,
      reward_per_view: 0.12,
      total_budget: 3000,
      status: 'active',
    },
    {
      name: 'Smartwatch Werbung',
      title: 'Smartwatch für ein gesünderes Leben',
      description: 'Tracken Sie Ihre Fitness-Ziele',
      content_type: 'interactive',
      content_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Technology', 'Fitness', 'Health'],
      target_age_min: 20,
      target_age_max: 50,
      duration_seconds: 5,
      reward_per_view: 0.10,
      total_budget: 2000,
      status: 'draft',
    },
  ],
  'fitnessplus@test.com': [
    {
      name: 'Fitness Studio Mitgliedschaft',
      title: 'Werden Sie fit mit Fitness Plus!',
      description: 'Modernste Ausstattung und professionelle Trainer',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Fitness', 'Health', 'Sports'],
      target_age_min: 18,
      target_age_max: 60,
      duration_seconds: 5,
      reward_per_view: 0.20,
      total_budget: 8000,
      status: 'active',
    },
    {
      name: 'Personal Training',
      title: 'Personal Training - Ihre Ziele erreichen',
      description: 'Individuelles Training mit zertifizierten Trainern',
      content_type: 'video',
      content_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Fitness', 'Health'],
      target_age_min: 25,
      target_age_max: 55,
      duration_seconds: 5,
      reward_per_view: 0.18,
      total_budget: 4000,
      status: 'active',
    },
    {
      name: 'Yoga Kurse',
      title: 'Finden Sie inneren Frieden',
      description: 'Yoga-Kurse für Anfänger und Fortgeschrittene',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/3772618/pexels-photo-3772618.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Wellness', 'Health'],
      target_gender: 'all',
      duration_seconds: 5,
      reward_per_view: 0.12,
      total_budget: 2500,
      status: 'paused',
    },
  ],
  'fashionboutique@test.com': [
    {
      name: 'Frühjahr Kollektion',
      title: 'Die neue Frühjahr Kollektion ist da!',
      description: 'Entdecken Sie die neuesten Trends',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Fashion', 'Beauty'],
      target_age_min: 18,
      target_age_max: 45,
      target_gender: 'female',
      duration_seconds: 5,
      reward_per_view: 0.14,
      total_budget: 6000,
      status: 'active',
    },
    {
      name: 'Herren Mode',
      title: 'Stylische Herrenmode',
      description: 'Von Business bis Casual',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Fashion'],
      target_age_min: 25,
      target_age_max: 50,
      target_gender: 'male',
      duration_seconds: 5,
      reward_per_view: 0.13,
      total_budget: 3500,
      status: 'active',
    },
    {
      name: 'Accessoires',
      title: 'Perfekte Accessoires für jeden Look',
      description: 'Taschen, Schuhe, Uhren und mehr',
      content_type: 'interactive',
      content_url: 'https://images.pexels.com/photos/997910/pexels-photo-997910.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Fashion', 'Luxury'],
      duration_seconds: 5,
      reward_per_view: 0.11,
      total_budget: 2000,
      status: 'draft',
    },
  ],
  'fooddelivery@test.com': [
    {
      name: 'Pizza Angebot',
      title: '20% Rabatt auf alle Pizzen!',
      description: 'Bestellen Sie jetzt und sparen Sie',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Food'],
      target_age_min: 18,
      target_age_max: 50,
      duration_seconds: 5,
      reward_per_view: 0.08,
      total_budget: 4000,
      status: 'active',
    },
    {
      name: 'Sushi Spezial',
      title: 'Frisches Sushi direkt zu Ihnen',
      description: 'Premium Sushi aus der Region',
      content_type: 'video',
      content_url: 'https://images.pexels.com/photos/1059943/pexels-photo-1059943.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Food'],
      target_age_min: 25,
      target_age_max: 45,
      duration_seconds: 5,
      reward_per_view: 0.10,
      total_budget: 3000,
      status: 'active',
    },
    {
      name: 'Vegan Optionen',
      title: 'Entdecken Sie unsere veganen Gerichte',
      description: 'Gesund und lecker',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Food', 'Health'],
      duration_seconds: 5,
      reward_per_view: 0.09,
      total_budget: 2000,
      status: 'completed',
    },
  ],
  'travelagency@test.com': [
    {
      name: 'Sommerurlaub Angebot',
      title: 'Buchen Sie jetzt Ihren Traumurlaub',
      description: 'Exklusive Angebote für den Sommer',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Travel'],
      target_age_min: 25,
      target_age_max: 65,
      duration_seconds: 5,
      reward_per_view: 0.25,
      total_budget: 10000,
      status: 'active',
    },
    {
      name: 'Städtereisen',
      title: 'Erkunden Sie die schönsten Städte',
      description: 'Weekend-Trips zu Top-Destinationen',
      content_type: 'video',
      content_url: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Travel', 'Entertainment'],
      target_age_min: 20,
      target_age_max: 50,
      duration_seconds: 5,
      reward_per_view: 0.20,
      total_budget: 5000,
      status: 'active',
    },
    {
      name: 'Luxus Reisen',
      title: 'Premium Reiseerlebnisse',
      description: '5-Sterne Hotels und exklusive Locations',
      content_type: 'interactive',
      content_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Travel', 'Luxury'],
      target_age_min: 35,
      target_age_max: 70,
      duration_seconds: 5,
      reward_per_view: 0.30,
      total_budget: 15000,
      status: 'draft',
    },
  ],
  'pendingmerchant@test.com': [
    {
      name: 'Wartende Kampagne',
      title: 'Diese Kampagne wartet auf Freigabe',
      description: 'Kampagne von einem Merchant mit pending Status',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Technology'],
      duration_seconds: 5,
      reward_per_view: 0.10,
      total_budget: 1000,
      status: 'draft',
    },
  ],
  'suspendedmerchant@test.com': [
    {
      name: 'Gesperrte Kampagne',
      title: 'Diese Kampagne gehört zu einem gesperrten Merchant',
      description: 'Kampagne von einem Merchant mit suspended Status',
      content_type: 'image',
      content_url: 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop',
      target_interests: ['Technology'],
      duration_seconds: 5,
      reward_per_view: 0.10,
      total_budget: 1000,
      status: 'cancelled',
    },
  ],
};

interface GenerationResult {
  success: boolean;
  merchantsCreated: number;
  campaignsCreated: number;
  errors: string[];
  merchantCredentials: Array<{
    email: string;
    password: string;
    companyName: string;
    merchantId: string;
    authUserId?: string;
  }>;
}

async function generateTestData(): Promise<GenerationResult> {
  console.log('🚀 Starte Testdaten-Generierung...\n');
  console.log(`📊 ${TEST_MERCHANTS.length} Merchants werden erstellt\n`);

  const result: GenerationResult = {
    success: true,
    merchantsCreated: 0,
    campaignsCreated: 0,
    errors: [],
    merchantCredentials: [],
  };

  // Prüfe ob Service Role Key vorhanden ist
  if (!SERVICE_ROLE_KEY) {
    console.warn('⚠️  WARNUNG: SUPABASE_SERVICE_ROLE_KEY nicht gefunden!');
    console.warn('   Das Script verwendet den anon key, was zu RLS-Fehlern führen kann.');
    console.warn('   Setzen Sie SUPABASE_SERVICE_ROLE_KEY für beste Ergebnisse.\n');
  } else {
    console.log('✅ Service Role Key gefunden - RLS wird umgangen\n');
  }

  for (const merchantData of TEST_MERCHANTS) {
    try {
      console.log(`📝 Erstelle Merchant: ${merchantData.companyName}`);
      console.log(`   Email: ${merchantData.email}`);

      // Prüfe ob Merchant bereits existiert
      const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('id, auth_user_id')
        .eq('business_email', merchantData.email)
        .maybeSingle();

      let merchantId: string;
      let authUserId: string | undefined;

      if (existingMerchant) {
        console.log(`   ⏭️  Merchant existiert bereits: ${existingMerchant.id}`);
        merchantId = existingMerchant.id;
        authUserId = existingMerchant.auth_user_id;
      } else {
        // Erstelle Auth User (nur wenn Service Role Key vorhanden)
        if (SERVICE_ROLE_KEY) {
          try {
            // Verwende Admin API um User zu erstellen (ohne Email-Bestätigung)
            // Der Service Role Client hat Zugriff auf auth.admin
            const adminClient = createClient<any>(SUPABASE_CONFIG.url, SERVICE_ROLE_KEY);
            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
              email: merchantData.email,
              password: merchantData.password,
              email_confirm: true, // Email automatisch bestätigen
              user_metadata: {
                company_name: merchantData.companyName,
                user_type: 'merchant',
              },
            });

            if (authError) {
              throw authError;
            }

            if (authData?.user) {
              authUserId = authData.user.id;
              console.log(`   ✅ Auth User erstellt: ${authUserId}`);
            }
          } catch (authError: any) {
            console.log(`   ⚠️  Auth User konnte nicht erstellt werden: ${authError.message}`);
            console.log(`   ℹ️  Merchant wird ohne Auth User erstellt (kann später verknüpft werden)`);
          }
        } else {
          console.log(`   ⚠️  Kein Service Role Key - Auth User wird übersprungen`);
        }

        // Erstelle Merchant Profile
        const merchantInsert: any = {
          company_name: merchantData.companyName,
          business_email: merchantData.email,
          phone: merchantData.phone,
          website: merchantData.website,
          status: merchantData.status,
          verified: merchantData.verified,
        };

        // Füge auth_user_id hinzu falls vorhanden
        if (authUserId) {
          merchantInsert.auth_user_id = authUserId;
        }

        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .insert(merchantInsert)
          .select()
          .single();

        if (merchantError) {
          throw new Error(`Merchant creation failed: ${merchantError.message}`);
        }

        if (!merchant) {
          throw new Error('Merchant creation returned no data');
        }

        merchantId = merchant.id;
        console.log(`   ✅ Merchant erstellt: ${merchantId}`);
        result.merchantsCreated++;
      }

      // Speichere Credentials
      result.merchantCredentials.push({
        email: merchantData.email,
        password: merchantData.password,
        companyName: merchantData.companyName,
        merchantId,
        authUserId,
      });

      // Erstelle Kampagnen für diesen Merchant
      const campaigns = CAMPAIGN_TEMPLATES[merchantData.email] || [];
      console.log(`   📊 Erstelle ${campaigns.length} Kampagnen...`);

      for (const campaignTemplate of campaigns) {
        try {
          // Prüfe ob Kampagne bereits existiert
          const { data: existingCampaign } = await supabase
            .from('campaigns')
            .select('id')
            .eq('merchant_id', merchantId)
            .eq('name', campaignTemplate.name)
            .maybeSingle();

          if (existingCampaign) {
            console.log(`      ⏭️  Kampagne "${campaignTemplate.name}" existiert bereits`);
            continue;
          }

          const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
              merchant_id: merchantId,
              name: campaignTemplate.name,
              title: campaignTemplate.title,
              description: campaignTemplate.description,
              content_type: campaignTemplate.content_type,
              content_url: campaignTemplate.content_url,
              target_interests: campaignTemplate.target_interests,
              target_age_min: campaignTemplate.target_age_min || null,
              target_age_max: campaignTemplate.target_age_max || null,
              target_gender: campaignTemplate.target_gender || null,
              duration_seconds: campaignTemplate.duration_seconds,
              reward_per_view: campaignTemplate.reward_per_view,
              total_budget: campaignTemplate.total_budget,
              spent_budget: 0,
              status: campaignTemplate.status,
              start_date: campaignTemplate.start_date || new Date().toISOString(),
              end_date: campaignTemplate.end_date || null,
            })
            .select()
            .single();

          if (campaignError) {
            throw new Error(`Campaign creation failed: ${campaignError.message}`);
          }

          if (campaign) {
            console.log(`      ✅ "${campaignTemplate.name}" erstellt`);
            result.campaignsCreated++;
          }
        } catch (campaignError: any) {
          const errorMsg = `Fehler beim Erstellen der Kampagne "${campaignTemplate.name}": ${campaignError.message}`;
          console.log(`      ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }

      console.log('');
    } catch (error: any) {
      const errorMsg = `Fehler beim Erstellen des Merchants ${merchantData.email}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      result.success = false;
    }
  }

  return result;
}

// Hauptfunktion
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   SpotX Testdaten-Generierung');
  console.log('═══════════════════════════════════════════════════\n');

  const result = await generateTestData();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   Zusammenfassung');
  console.log('═══════════════════════════════════════════════════\n');

  console.log(`✅ Merchants erstellt: ${result.merchantsCreated}`);
  console.log(`✅ Kampagnen erstellt: ${result.campaignsCreated}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Fehler (${result.errors.length}):`);
    result.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  console.log('\n📋 Merchant Credentials:\n');
  result.merchantCredentials.forEach((cred, index) => {
    console.log(`${index + 1}. ${cred.companyName}`);
    console.log(`   Email: ${cred.email}`);
    console.log(`   Password: ${cred.password}`);
    console.log(`   Merchant ID: ${cred.merchantId}`);
    if (cred.authUserId) {
      console.log(`   Auth User ID: ${cred.authUserId}`);
    }
    console.log('');
  });

  console.log('\n💡 Tipp: Verwenden Sie diese Credentials zum Testen im Merchant Portal');
  console.log('   URL: http://localhost:3000/login (oder Ihre Merchant Portal URL)\n');

  if (result.success && result.errors.length === 0) {
    console.log('🎉 Testdaten-Generierung erfolgreich abgeschlossen!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Testdaten-Generierung mit Fehlern abgeschlossen.\n');
    process.exit(1);
  }
}

// Script ausführen
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Unerwarteter Fehler:', error);
    process.exit(1);
  });
}

export { generateTestData };
