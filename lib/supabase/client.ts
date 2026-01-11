import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Try to import local config first, fall back to example if not found
let SUPABASE_CONFIG: { url: string; anonKey: string };

try {
  // Try to load local config (ignored by git, contains real credentials)
  SUPABASE_CONFIG = require('./config.local').SUPABASE_CONFIG;
} catch {
  try {
    // Fall back to example config (for first-time setup)
    SUPABASE_CONFIG = require('./config.example').SUPABASE_CONFIG;
    console.warn('⚠️  Using example Supabase config. Please create lib/supabase/config.local.ts with your credentials.');
  } catch {
    // If neither exists, use empty values (will throw error below)
    SUPABASE_CONFIG = { url: '', anonKey: '' };
  }
}

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Validate that credentials are set
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.error('❌ Supabase credentials missing or not configured!');
  console.error('📝 Please create: lib/supabase/config.local.ts');
  console.error('📋 Copy from: lib/supabase/config.example.ts');
  console.error('🔑 Add your Supabase URL and Anon Key');
  throw new Error('Supabase credentials are not configured. Please create lib/supabase/config.local.ts');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
