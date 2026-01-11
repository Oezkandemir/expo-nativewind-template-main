import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route to send a merchant access request
 * 
 * This creates a support request when an app user wants to become a merchant
 * 
 * POST /api/support/request-merchant-access
 * Body: { email, message, companyName }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, message, companyName } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    // For now, we'll just log the request
    // In production, you could:
    // 1. Send an email to support
    // 2. Create a ticket in a support system
    // 3. Store in a database table for admin review
    
    console.log('📧 Merchant Access Request:')
    console.log('Email:', email)
    console.log('Company:', companyName || 'Nicht angegeben')
    console.log('Message:', message || 'Keine Nachricht')
    console.log('Timestamp:', new Date().toISOString())

    // TODO: Implement actual email sending or database storage
    // Example: Send email via Supabase Edge Function or external service
    
    return NextResponse.json({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.'
    })
  } catch (error: any) {
    console.error('Error processing merchant access request:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}
