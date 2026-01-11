import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'

/**
 * PATCH /api/admin/campaigns/[id]/status
 * Update campaign status (quick action for admin)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const campaignId = resolvedParams.id

    const body = await request.json()
    const { status } = body

    if (!status || !['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      )
    }

    const { data: updatedCampaign, error: updateError } = await adminSupabase
      .from('campaigns')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating campaign status:', updateError)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Status', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, campaign: updatedCampaign },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error updating campaign status:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler', details: error.message },
      { status: 500 }
    )
  }
}
