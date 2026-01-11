import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * API Route to create a merchant profile
 * Uses service role key to bypass RLS policies
 * 
 * POST /api/merchants/register
 * Body: { authUserId, companyName, email, phone }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { authUserId, companyName, email, phone } = body

    if (!authUserId || !companyName || !email) {
      return NextResponse.json(
        { error: 'Fehlende erforderliche Felder: authUserId, companyName, email' },
        { status: 400 }
      )
    }

    // Check if service role key is set - REQUIRED for this operation
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      const errorMsg = 'Server-Konfigurationsfehler: SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt. Bitte fügen Sie ihn zu Ihrer .env.local Datei hinzu.'
      console.error('❌', errorMsg)
      console.error('📋 Anleitung:')
      console.error('1. Öffnen Sie Supabase Dashboard → Settings → API')
      console.error('2. Kopieren Sie den "service_role" Key (nicht den anon key!)')
      console.error('3. Fügen Sie ihn zu apps/merchant-portal/.env.local hinzu:')
      console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here')
      console.error('4. Starten Sie den Dev-Server neu')
      
      return NextResponse.json(
        { 
          error: errorMsg,
          details: {
            hint: 'Der Service Role Key ist erforderlich, um RLS zu umgehen. Bitte setzen Sie SUPABASE_SERVICE_ROLE_KEY in Ihrer .env.local Datei.',
            instructions: [
              '1. Öffnen Sie Supabase Dashboard → Settings → API',
              '2. Kopieren Sie den "service_role" Key',
              '3. Fügen Sie ihn zu apps/merchant-portal/.env.local hinzu',
              '4. Starten Sie den Dev-Server neu'
            ]
          }
        },
        { status: 500 }
      )
    }
    
    // Create service role client (bypasses RLS)
    const supabase = createServiceRoleClient()
    console.log('✅ Using service role client (RLS bypassed)')

    // Check if merchant already exists
    const { data: existingMerchant } = await supabase
      .from('merchants')
      .select('id, business_email')
      .eq('business_email', email)
      .maybeSingle()

    if (existingMerchant) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits als Merchant registriert.' },
        { status: 409 }
      )
    }

    // Build merchant data
    const merchantData: any = {
      company_name: companyName,
      business_email: email,
      phone: phone || null,
      status: 'pending',
      verified: false,
    }

    // Try with auth_user_id first (if column exists)
    let result = await supabase
      .from('merchants')
      .insert({
        ...merchantData,
        auth_user_id: authUserId,
      })
      .select()

    // If that fails (e.g., auth_user_id column doesn't exist), try without it
    if (result.error) {
      const isColumnError = result.error.message?.includes('column') && 
                            result.error.message?.includes('auth_user_id')
      
      if (isColumnError) {
        console.log('auth_user_id column not found, inserting without it')
        result = await supabase
          .from('merchants')
          .insert(merchantData)
          .select()
      }
    }

    if (result.error) {
      console.error('Merchant creation error:', result.error)
      console.error('Error code:', result.error.code)
      console.error('Error message:', result.error.message)
      console.error('Error hint:', result.error.hint)
      console.error('Service Role Key set:', !!serviceRoleKey)
      
      // If still getting RLS error, the service role key might not be working
      if (result.error.message?.includes('row-level security') || result.error.code === '42501') {
        return NextResponse.json(
          { 
            error: 'RLS-Fehler: Service Role Key funktioniert nicht korrekt. Bitte überprüfen Sie die Umgebungsvariablen.',
            details: {
              message: result.error.message,
              code: result.error.code,
              hint: 'Stellen Sie sicher, dass SUPABASE_SERVICE_ROLE_KEY in .env.local gesetzt ist'
            }
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: result.error.message || 'Fehler beim Erstellen des Merchant-Profils',
          details: result.error
        },
        { status: 500 }
      )
    }

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'Merchant-Profil wurde nicht erstellt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      merchant: result.data[0]
    })
  } catch (error: any) {
    console.error('Error in merchant registration API:', error)
    return NextResponse.json(
      { error: error.message || 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
