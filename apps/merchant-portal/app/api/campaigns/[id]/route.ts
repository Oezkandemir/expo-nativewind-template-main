import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

/**
 * GET /api/campaigns/[id]
 * Get a specific campaign by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient()
    const merchant = await getCurrentMerchant()
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant-Profil nicht gefunden' },
        { status: 404 }
      )
    }

    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('merchant_id', merchant.id)
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { error: 'Kampagne nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kampagne', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/campaigns/[id]
 * Update a campaign
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient()
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

    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    // Verify campaign belongs to merchant
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, merchant_id, spent_budget')
      .eq('id', campaignId)
      .eq('merchant_id', merchant.id)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Kampagne nicht gefunden oder Sie haben keine Berechtigung' },
        { status: 404 }
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
      status,
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

    // Don't allow reducing total_budget below spent_budget
    const spentBudget = Number(existingCampaign.spent_budget) || 0
    if (total_budget < spentBudget) {
      return NextResponse.json(
        { error: `Das Gesamtbudget kann nicht unter den bereits ausgegebenen Betrag (€${spentBudget.toFixed(2)}) gesenkt werden.` },
        { status: 400 }
      )
    }

    // Validate dates if provided
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        { error: 'Startdatum muss vor dem Enddatum liegen.' },
        { status: 400 }
      )
    }

    // Validate status
    if (status && !['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      )
    }

    // Prepare update data (don't update spent_budget or merchant_id)
    type CampaignUpdate = DatabaseType['public']['Tables']['campaigns']['Update']
    const updateData: CampaignUpdate = {
      name,
      title,
      description: description || null,
      content_type,
      content_url,
      target_interests: target_interests || [],
      target_age_min: target_age_min || null,
      target_age_max: target_age_max || null,
      target_gender: target_gender === 'all' || !target_gender ? null : target_gender,
      duration_seconds: FIXED_DURATION_SECONDS, // Immer 5 Sekunden fest
      reward_per_view: FIXED_REWARD_PER_VIEW, // Immer 1€ fest
      total_budget,
      status: status || 'draft',
      start_date: start_date || null,
      end_date: end_date || null,
      updated_at: new Date().toISOString(),
    }

    // Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .eq('merchant_id', merchant.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating campaign:', updateError)
      return NextResponse.json(
        { 
          error: 'Fehler beim Aktualisieren der Kampagne', 
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, campaign: updatedCampaign },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error updating campaign:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Aktualisieren der Kampagne', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign (only if no views exist)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient()
    const merchant = await getCurrentMerchant()
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant-Profil nicht gefunden' },
        { status: 404 }
      )
    }

    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    // Verify campaign belongs to merchant
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, merchant_id')
      .eq('id', campaignId)
      .eq('merchant_id', merchant.id)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Kampagne nicht gefunden oder Sie haben keine Berechtigung' },
        { status: 404 }
      )
    }

    // Check if campaign has any views
    const { data: views, error: viewsError } = await supabase
      .from('ad_views')
      .select('id')
      .eq('campaign_id_uuid', campaignId)
      .limit(1)

    if (viewsError) {
      console.error('Error checking views:', viewsError)
    }

    if (views && views.length > 0) {
      return NextResponse.json(
        { error: 'Kampagne kann nicht gelöscht werden, da bereits Views vorhanden sind. Bitte setzen Sie den Status auf "cancelled" statt dessen.' },
        { status: 400 }
      )
    }

    // Delete campaign
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('merchant_id', merchant.id)

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError)
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Kampagne', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Löschen der Kampagne', details: error.message },
      { status: 500 }
    )
  }
}
