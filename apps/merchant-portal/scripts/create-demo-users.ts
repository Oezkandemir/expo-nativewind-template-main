/**
 * Script to create 15 demo users for testing
 * 
 * Usage:
 *   cd apps/merchant-portal
 *   npx tsx scripts/create-demo-users.ts
 * 
 * Or with environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/create-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('Or create a .env.local file in apps/merchant-portal/')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Demo user data
const demoUsers = [
  { name: 'Max Mustermann', email: 'max.mustermann@demo.com', age: 28, gender: 'male', interests: ['sports', 'technology'] },
  { name: 'Anna Schmidt', email: 'anna.schmidt@demo.com', age: 32, gender: 'female', interests: ['fashion', 'travel'] },
  { name: 'Tom Weber', email: 'tom.weber@demo.com', age: 25, gender: 'male', interests: ['gaming', 'music'] },
  { name: 'Lisa Müller', email: 'lisa.mueller@demo.com', age: 29, gender: 'female', interests: ['food', 'fitness'] },
  { name: 'David Fischer', email: 'david.fischer@demo.com', age: 35, gender: 'male', interests: ['technology', 'business'] },
  { name: 'Sarah Becker', email: 'sarah.becker@demo.com', age: 27, gender: 'female', interests: ['art', 'photography'] },
  { name: 'Michael Koch', email: 'michael.koch@demo.com', age: 31, gender: 'male', interests: ['sports', 'outdoor'] },
  { name: 'Julia Wagner', email: 'julia.wagner@demo.com', age: 26, gender: 'female', interests: ['music', 'dance'] },
  { name: 'Daniel Schulz', email: 'daniel.schulz@demo.com', age: 33, gender: 'male', interests: ['cars', 'technology'] },
  { name: 'Emma Hoffmann', email: 'emma.hoffmann@demo.com', age: 24, gender: 'female', interests: ['fashion', 'beauty'] },
  { name: 'Lukas Bauer', email: 'lukas.bauer@demo.com', age: 30, gender: 'male', interests: ['gaming', 'movies'] },
  { name: 'Sophie Klein', email: 'sophie.klein@demo.com', age: 28, gender: 'female', interests: ['travel', 'food'] },
  { name: 'Felix Wolf', email: 'felix.wolf@demo.com', age: 29, gender: 'male', interests: ['sports', 'fitness'] },
  { name: 'Hannah Zimmermann', email: 'hannah.zimmermann@demo.com', age: 27, gender: 'female', interests: ['art', 'design'] },
  { name: 'Niklas Braun', email: 'niklas.braun@demo.com', age: 26, gender: 'male', interests: ['technology', 'startups'] },
]

const DEFAULT_PASSWORD = 'Demo123!@#' // Change this in production!

async function createDemoUsers() {
  console.log('🚀 Starting demo user creation...\n')
  
  const createdUsers = []
  const errors = []
  
  for (const userData of demoUsers) {
    try {
      console.log(`Creating user: ${userData.email}...`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: userData.name,
        },
      })
      
      if (authError) {
        console.error(`  ❌ Auth error: ${authError.message}`)
        errors.push({ email: userData.email, error: authError.message })
        continue
      }
      
      if (!authData.user) {
        console.error(`  ❌ No user data returned`)
        errors.push({ email: userData.email, error: 'No user data returned' })
        continue
      }
      
      // Create user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          interests: userData.interests,
          onboarding_complete: true,
          notifications_enabled: true,
          ad_frequency_preference: 'normal',
          history_widget_enabled: true,
        })
      
      if (profileError) {
        console.error(`  ⚠️  Profile error (user may already exist): ${profileError.message}`)
        // Don't add to errors if it's a duplicate
        if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
          errors.push({ email: userData.email, error: profileError.message })
        }
      }
      
      console.log(`  ✅ Created: ${userData.name} (${userData.email})`)
      createdUsers.push(userData.email)
      
    } catch (error: any) {
      console.error(`  ❌ Unexpected error: ${error.message}`)
      errors.push({ email: userData.email, error: error.message })
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`✅ Successfully created: ${createdUsers.length} users`)
  console.log(`❌ Errors: ${errors.length}`)
  
  if (createdUsers.length > 0) {
    console.log('\n✅ Created users:')
    createdUsers.forEach(email => console.log(`   - ${email}`))
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(({ email, error }) => console.log(`   - ${email}: ${error}`))
  }
  
  console.log(`\n🔑 Default password for all users: ${DEFAULT_PASSWORD}`)
  console.log('='.repeat(50))
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
