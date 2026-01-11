import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@spotx/shared-config/types'
import { NextResponse } from 'next/server'

/**
 * API route to save/update push notification tokens from mobile app
 * POST /api/users/push-token
 */
export async function POST(request: Request) {
  try {
    // Get authorization header for mobile app authentication
    const authHeader = request.headers.get('authorization')
    let supabase = await createClient()
    let user = null
    let authError = null
    
    // If Authorization header is present, use it for authentication (mobile app)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      // Create a client with the provided token
      const tempSupabase = createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
      
      const { data: { user: authUser }, error: tokenError } = await tempSupabase.auth.getUser(token)
      user = authUser
      authError = tokenError
    } else {
      // Fallback to cookie-based authentication (web)
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
      user = cookieUser
      authError = cookieError
    }
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { token, platform, deviceId } = body
    
    if (!token || !platform) {
      return NextResponse.json(
        { error: 'Token und Platform sind erforderlich' },
        { status: 400 }
      )
    }
    
    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json(
        { error: 'Ungültige Platform. Muss ios, android oder web sein' },
        { status: 400 }
      )
    }
    
    // Use service role client to bypass RLS for upsert
    const adminSupabase = createServiceRoleClient()
    
    // Check if token already exists for this user
    // Type assertion needed due to TypeScript inference issue with service role client
    const { data: existingTokenData } = await (adminSupabase
      .from('push_tokens') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('token', token)
      .single()
    
    // Type assertion for existingToken
    type PushTokenId = { id: string }
    const existingToken = existingTokenData as PushTokenId | null
    
    if (existingToken) {
      // Update existing token
      // Type assertion needed due to TypeScript inference issue with service role client
      const { error: updateError } = await (adminSupabase
        .from('push_tokens') as any)
        .update({
          platform,
          device_id: deviceId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)
      
      if (updateError) {
        console.error('Error updating push token:', updateError)
        return NextResponse.json(
          { error: 'Fehler beim Aktualisieren des Tokens' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Push-Token aktualisiert',
      })
    } else {
      // Insert new token
      // Type assertion needed due to TypeScript inference issue with service role client
      const { error: insertError } = await (adminSupabase
        .from('push_tokens') as any)
        .insert({
          user_id: user.id,
          token,
          platform,
          device_id: deviceId || null,
        })
      
      if (insertError) {
        console.error('Error inserting push token:', insertError)
        return NextResponse.json(
          { error: 'Fehler beim Speichern des Tokens' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Push-Token gespeichert',
      })
    }
  } catch (error: any) {
    console.error('Error in POST /api/users/push-token:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Speichern des Push-Tokens' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/push-token
 * Remove push token (e.g., on logout)
 */
export async function DELETE(request: Request) {
  try {
    // Get authorization header for mobile app authentication
    const authHeader = request.headers.get('authorization')
    let supabase = await createClient()
    let user = null
    let authError = null
    
    // If Authorization header is present, use it for authentication (mobile app)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      // Create a client with the provided token
      const tempSupabase = createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
      
      const { data: { user: authUser }, error: tokenError } = await tempSupabase.auth.getUser(token)
      user = authUser
      authError = tokenError
    } else {
      // Fallback to cookie-based authentication (web)
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
      user = cookieUser
      authError = cookieError
    }
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }
    
    const adminSupabase = createServiceRoleClient()
    
    const { error: deleteError } = await adminSupabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('token', token)
    
    if (deleteError) {
      console.error('Error deleting push token:', deleteError)
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Tokens' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Push-Token gelöscht',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/users/push-token:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen des Push-Tokens' },
      { status: 500 }
    )
  }
}
