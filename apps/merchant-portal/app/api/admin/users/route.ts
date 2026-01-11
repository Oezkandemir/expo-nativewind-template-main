import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    
    const adminSupabase = createServiceRoleClient()
    
    const { data: users, error } = await adminSupabase
      .from('users')
      .select('id, email, name, notifications_enabled')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der User' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ users: users || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der User' },
      { status: 500 }
    )
  }
}
