import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Try to import local config first, fall back to production credentials if not found
// Initialize with production fallback first (ensures TypeScript knows it's always assigned)
let SUPABASE_CONFIG: { url: string; anonKey: string } = {
  url: 'https://mxdpiqnkowcxbujgrfom.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s',
};

try {
  // Try to load local config (ignored by git, contains real credentials)
  const localConfig = require('./config.local').SUPABASE_CONFIG;
  // Check if values are not placeholders
  if (localConfig.url && localConfig.url !== 'YOUR_SUPABASE_URL_HERE' && 
      localConfig.anonKey && localConfig.anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
    SUPABASE_CONFIG = localConfig;
  } else {
    // Placeholder values detected, use production fallback
    console.warn('⚠️  Using production Supabase config. For development, create lib/supabase/config.local.ts');
  }
} catch {
  // config.local.ts not found or invalid, using production fallback
  console.warn('⚠️  Using production Supabase config. For development, create lib/supabase/config.local.ts');
}

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Final validation (should never fail with fallback, but safety check)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  throw new Error('Supabase credentials are not configured');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
