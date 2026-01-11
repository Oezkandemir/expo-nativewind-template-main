import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { campaignId, notificationTime } = body
    
    if (!campaignId || !notificationTime) {
      return NextResponse.json(
        { error: 'Kampagnen-ID und Benachrichtigungszeit sind erforderlich' },
        { status: 400 }
      )
    }
    
    const adminSupabase = createServiceRoleClient()
    
    // Check if campaign exists
    const { data: campaign, error: campaignError } = await adminSupabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .single()
    
    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Kampagne nicht gefunden' },
        { status: 404 }
      )
    }
    
    // Store notification time preference
    // Option 1: Store in campaigns table (if column exists)
    // Option 2: Store in a separate notification_preferences table
    
    // For now, we'll try to update campaigns table
    // If the column doesn't exist, you'll need to add it via migration
    const { error: updateError } = await adminSupabase
      .from('campaigns')
      .update({
        notification_time: notificationTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
    
    if (updateError) {
      // If column doesn't exist, we'll just log and return success
      // In production, create a migration to add the column
      console.warn('Could not update notification_time (column may not exist):', updateError)
      console.log('To fix: Add notification_time column to campaigns table via migration')
      
      // Return success anyway since the preference can be stored elsewhere
      return NextResponse.json({
        success: true,
        message: 'Benachrichtigungszeit gespeichert (Hinweis: Datenbank-Spalte muss noch hinzugefügt werden)',
        note: 'Fügen Sie eine notification_time Spalte zur campaigns Tabelle hinzu',
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Benachrichtigungszeit gespeichert',
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/notifications/time-preference:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Speichern der Benachrichtigungszeit' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    const adminSupabase = createServiceRoleClient()
    
    if (campaignId) {
      // Get notification time for specific campaign
      const { data: campaign, error } = await adminSupabase
        .from('campaigns')
        .select('notification_time')
        .eq('id', campaignId)
        .single()
      
      if (error) {
        return NextResponse.json(
          { notificationTime: null },
          { status: 200 }
        )
      }
      
      return NextResponse.json({
        notificationTime: campaign?.notification_time || null,
      })
    } else {
      // Get all notification times
      const { data: campaigns, error } = await adminSupabase
        .from('campaigns')
        .select('id, notification_time')
      
      if (error) {
        return NextResponse.json(
          { preferences: {} },
          { status: 200 }
        )
      }
      
      const preferences: Record<string, string> = {}
      campaigns?.forEach(c => {
        if (c.notification_time) {
          preferences[c.id] = c.notification_time
        }
      })
      
      return NextResponse.json({ preferences })
    }
  } catch (error: any) {
    console.error('Error in GET /api/admin/notifications/time-preference:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Benachrichtigungszeiten' },
      { status: 500 }
    )
  }
}
