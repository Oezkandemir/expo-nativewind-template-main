import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import type { Database } from '@spotx/shared-config/types'

/**
 * GET /api/admin/campaigns/[id]
 * Get a campaign (admin can access any campaign)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    const { data: campaign, error } = await adminSupabase
      .from('campaigns')
      .select(`
        *,
        merchants(id, company_name, business_email)
      `)
      .eq('id', campaignId)
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
 * PUT /api/admin/campaigns/[id]
 * Update a campaign (admin can update any campaign)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

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
      spent_budget,
      status,
      start_date,
      end_date,
    } = body

    // Get existing campaign to check spent_budget
    const { data: existingCampaign } = await adminSupabase
      .from('campaigns')
      .select('spent_budget')
      .eq('id', campaignId)
      .single()

    // Type assertion
    type CampaignRow = Database['public']['Tables']['campaigns']['Row']
    const typedExistingCampaign = existingCampaign as Pick<CampaignRow, 'spent_budget'> | null

    const currentSpent = Number(typedExistingCampaign?.spent_budget) || 0
    const newSpent = spent_budget !== undefined ? Number(spent_budget) : currentSpent

    // Validate budget constraints
    if (total_budget !== undefined && total_budget < newSpent) {
      return NextResponse.json(
        { error: `Das Gesamtbudget kann nicht unter den ausgegebenen Betrag (€${newSpent.toFixed(2)}) gesenkt werden.` },
        { status: 400 }
      )
    }

    // Prepare update data - use same pattern as users route
    type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
    const updateData: CampaignUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (content_type !== undefined) updateData.content_type = content_type
    if (content_url !== undefined) updateData.content_url = content_url
    if (target_interests !== undefined) updateData.target_interests = target_interests || []
    if (target_age_min !== undefined) updateData.target_age_min = target_age_min || null
    if (target_age_max !== undefined) updateData.target_age_max = target_age_max || null
    if (target_gender !== undefined) updateData.target_gender = target_gender === 'all' || !target_gender ? null : target_gender
    if (total_budget !== undefined) updateData.total_budget = total_budget
    if (spent_budget !== undefined) updateData.spent_budget = spent_budget
    if (status !== undefined) updateData.status = status
    if (start_date !== undefined) updateData.start_date = start_date || null
    if (end_date !== undefined) updateData.end_date = end_date || null

    // Update campaign (admin can update any campaign)
    // Explicitly type the update to help TypeScript inference
    const { data: updatedCampaign, error: updateError } = await adminSupabase
      .from('campaigns')
      .update(updateData satisfies Database['public']['Tables']['campaigns']['Update'])
      .eq('id', campaignId)
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
 * DELETE /api/admin/campaigns/[id]
 * Delete a campaign (admin can delete any campaign, even with views)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    // Admin can delete any campaign, even if it has views
    // First delete related ad_views (optional, or set campaign_id to null)
    // For now, we'll just delete the campaign
    
    const { error: deleteError } = await adminSupabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

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
