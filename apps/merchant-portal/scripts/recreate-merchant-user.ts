/**
 * Script to recreate a merchant user and send confirmation email
 * 
 * Usage: 
 *   cd apps/merchant-portal
 *   npx tsx scripts/recreate-merchant-user.ts
 * 
 * Or with environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npx tsx scripts/recreate-merchant-user.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('Or create a .env.local file in apps/merchant-portal/')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function recreateMerchantUser() {
  const email = 'demiroezkan205@gmail.com'
  const password = 'TempPassword123!' // User should change this after login
  const companyName = 'Cenety'
  const phone = '017684509967'

  console.log('🔄 Recreating merchant user...')
  console.log(`Email: ${email}`)
  console.log(`Company: ${companyName}`)
  console.log('')

  try {
    // Step 1: Create auth user (this will send confirmation email)
    console.log('📧 Creating auth user and sending confirmation email...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          user_type: 'merchant',
        },
        emailRedirectTo: `${BASE_URL}/login?confirmed=true`,
      },
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned')
    }

    console.log('✅ Auth user created:', authData.user.id)
    console.log('📧 Confirmation email sent to:', email)
    console.log('')

    // Step 2: Create merchant profile
    console.log('🏢 Creating merchant profile...')
    const { error: merchantError } = await supabase
      .from('merchants')
      .insert({
        auth_user_id: authData.user.id,
        company_name: companyName,
        business_email: email,
        phone: phone || null,
        status: 'pending',
        verified: false,
      })

    if (merchantError) {
      console.error('❌ Error creating merchant profile:', merchantError)
      throw merchantError
    }

    console.log('✅ Merchant profile created successfully')
    console.log('')

    // Summary
    console.log('🎉 Success!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Check your email inbox for the confirmation email')
    console.log('2. Click the confirmation link in the email')
    console.log('3. Login with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('4. Change your password after first login')
    console.log('')
    console.log('⚠️  Note: The merchant account status is "pending" and needs admin approval.')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

recreateMerchantUser()
