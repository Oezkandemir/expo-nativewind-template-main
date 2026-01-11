import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

/**
 * GET /api/admin/users/[id]
 * Get user details (admin)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.id

    const { data: user, error } = await adminSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Users', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.id

    const body = await request.json()
    type UserUpdate = DatabaseType['public']['Tables']['users']['Update']
    const updateData: UserUpdate = {
      updated_at: new Date().toISOString(),
    }

    // Allow updating any user field
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.interests !== undefined) updateData.interests = body.interests
    if (body.age !== undefined) updateData.age = body.age
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.location !== undefined) updateData.location = body.location
    if (body.country !== undefined) updateData.country = body.country
    if (body.notifications_enabled !== undefined) updateData.notifications_enabled = body.notifications_enabled
    if (body.onboarding_complete !== undefined) updateData.onboarding_complete = body.onboarding_complete

    const { data: updatedUser, error: updateError } = await adminSupabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Users', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error updating user:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (admin)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin()
    const adminSupabase = createServiceRoleClient()
    
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.id

    // Delete user profile
    const { error: deleteError } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Users', details: deleteError.message },
        { status: 500 }
      )
    }

    // Also delete auth user (requires admin API)
    try {
      const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)
      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError)
        // Don't fail if auth user deletion fails, profile is already deleted
      }
    } catch (authError) {
      console.error('Error deleting auth user:', authError)
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error deleting user:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler', details: error.message },
      { status: 500 }
    )
  }
}
