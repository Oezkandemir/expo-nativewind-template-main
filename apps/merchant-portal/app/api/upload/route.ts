import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'

/**
 * POST /api/upload
 * Upload a file to Supabase Storage
 */
export async function POST(request: Request) {
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
        { error: 'Ihr Account wurde noch nicht genehmigt.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur Bilddateien (JPEG, PNG, GIF, WebP) sind erlaubt' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximale Größe: 10MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${merchant.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('campaign-assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Hochladen der Datei', details: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campaign-assets')
      .getPublicUrl(fileName)

    return NextResponse.json(
      { 
        success: true, 
        url: urlData.publicUrl,
        path: fileName,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Unexpected error uploading file:', error)
    return NextResponse.json(
      { error: 'Unerwarteter Fehler beim Hochladen', details: error.message },
      { status: 500 }
    )
  }
}
