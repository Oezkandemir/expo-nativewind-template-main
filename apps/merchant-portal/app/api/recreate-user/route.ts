import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * API Route to recreate a merchant user
 * 
 * This will:
 * 1. Delete existing merchant (if exists)
 * 2. Create new auth user (sends confirmation email)
 * 3. Create merchant profile
 * 
 * POST /api/recreate-user
 * Body: { email, password, companyName, phone }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, companyName, phone } = body

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, companyName' },
        { status: 400 }
      )
    }

    // Use anon key for signUp (this is safe as it's a public registration endpoint)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Step 1: Delete existing merchant (if exists)
    console.log('Deleting existing merchant...')
    await supabase
      .from('merchants')
      .delete()
      .eq('business_email', email)

    // Step 2: Create auth user (this sends confirmation email)
    console.log('Creating auth user...')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          user_type: 'merchant',
        },
        emailRedirectTo: `${baseUrl}/login?confirmed=true`,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create auth user', details: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      )
    }

    console.log('Auth user created:', authData.user.id)

    // Step 3: Create merchant profile
    console.log('Creating merchant profile...')
    // Type assertion needed due to TypeScript inference issue
    const { error: merchantError } = await (supabase
      .from('merchants') as any)
      .insert({
        auth_user_id: authData.user.id,
        company_name: companyName,
        business_email: email,
        phone: phone || null,
        status: 'pending',
        verified: false,
      })

    if (merchantError) {
      console.error('Merchant error:', merchantError)
      return NextResponse.json(
        { error: 'Failed to create merchant profile', details: merchantError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation.',
      userId: authData.user.id,
      email: authData.user.email,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
