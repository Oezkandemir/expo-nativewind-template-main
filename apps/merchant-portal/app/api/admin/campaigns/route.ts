import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    
    const adminSupabase = createServiceRoleClient()
    
    const { data: campaigns, error } = await adminSupabase
      .from('campaigns')
      .select('id, name, title, status')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Kampagnen' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ campaigns: campaigns || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/campaigns:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Kampagnen' },
      { status: 500 }
    )
  }
}
