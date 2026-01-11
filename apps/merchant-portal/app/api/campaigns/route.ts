import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

/**
 * POST /api/campaigns
 * Create a new campaign for the authenticated merchant
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current merchant (this will redirect if not authenticated)
    const merchant = await getCurrentMerchant()
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant-Profil nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if merchant is approved
    if (merchant.status !== 'approved') {
      return NextResponse.json(
        { error: 'Ihr Account wurde noch nicht genehmigt. Bitte warten Sie auf die Freigabe.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      title,
      description,
      content_type,
      content_url,
      target_interests,
      target_age_min,
      target_age_max,
      target_gender,
      total_budget,
      status = 'active', // New campaigns are active by default
      start_date,
      end_date,
    } = body

    // Validate required fields
    if (!name || !title || !content_type || !content_url || total_budget === undefined) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: name, title, content_type, content_url, total_budget' },
        { status: 400 }
      )
    }

    // Validate content_type
    if (!['image', 'video', 'interactive'].includes(content_type)) {
      return NextResponse.json(
        { error: 'Ungültiger content_type. Muss image, video oder interactive sein.' },
        { status: 400 }
      )
    }

    // Validate budget
    if (total_budget <= 0) {
      return NextResponse.json(
        { error: 'Gesamtbudget muss größer als 0 sein.' },
        { status: 400 }
      )
    }

    // Fester Preis pro View: 1€
    const FIXED_REWARD_PER_VIEW = 1.00
    // Feste Dauer: 5 Sekunden
    const FIXED_DURATION_SECONDS = 5

    // Validate dates if provided
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        { error: 'Startdatum muss vor dem Enddatum liegen.' },
        { status: 400 }
      )
    }

    // Prepare campaign data
    type CampaignInsert = DatabaseType['public']['Tables']['campaigns']['Insert']
    const campaignData: CampaignInsert = {
      merchant_id: merchant.id,
      name,
      title,
      description: description || null,
      content_type,
      content_url,
      target_interests: target_interests || [],
      target_age_min: target_age_min || null,
      target_age_max: target_age_max || null,
      target_gender: target_gender || null,
      duration_seconds: FIXED_DURATION_SECONDS, // Immer 5 Sekunden fest
      reward_per_view: FIXED_REWARD_PER_VIEW, // Immer 1€ fest
      total_budget,
      spent_budget: 0,
      status,
      start_date: start_date || null,
      end_date: end_date || null,
    }

    console.log('Creating campaign with data:', {
      merchant_id: merchant.id,
      merchant_status: merchant.status,
      campaign_name: name,
      content_type,
      reward_per_view: FIXED_REWARD_PER_VIEW,
      total_budget,
    })

    // Verify user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User session error:', userError)
      return NextResponse.json(
        { error: 'Nicht authentifiziert', details: userError?.message },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email, user.id)
    console.log('Merchant data:', {
      id: merchant.id,
      email: merchant.business_email,
      status: merchant.status,
      auth_user_id: merchant.auth_user_id,
    })

    // Verify that merchant's business_email matches user's email
    if (merchant.business_email !== user.email) {
      console.error('Email mismatch:', {
        merchant_email: merchant.business_email,
        user_email: user.email,
      })
      return NextResponse.json(
        { error: 'E-Mail-Adresse stimmt nicht überein' },
        { status: 403 }
      )
    }

    // Try to create campaign with regular client first (respects RLS)
    let campaignResult = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    // If RLS blocks the insert, try with service role client (if available)
    if (campaignResult.error && campaignResult.error.code === '42501') {
      console.warn('RLS blocked insert, trying with service role client...')
      const serviceClient = createServiceRoleClient()
      campaignResult = await serviceClient
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single()
    }

    const { data: campaign, error: campaignError } = campaignResult

    if (campaignError) {
      console.error('Error creating campaign:', {
        message: campaignError.message,
        details: campaignError.details,
        hint: campaignError.hint,
        code: campaignError.code,
        campaignData,
      })
      return NextResponse.json(
        { 
          error: 'Fehler beim Erstellen der Kampagne', 
          details: campaignError.message,
          hint: campaignError.hint,
          code: campaignError.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, campaign },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Unexpected error creating campaign:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Erstellen der Kampagne', details: error.message },
      { status: 500 }
    )
  }
}
