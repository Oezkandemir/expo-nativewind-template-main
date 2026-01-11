import { updateMerchantStatus, requireAdmin } from '@/lib/auth/admin-helpers'
import { NextResponse } from 'next/server'

/**
 * API Route to update merchant status
 * POST /api/admin/merchants/update-status
 * Body: { merchantId, status }
 */
export async function POST(request: Request) {
  try {
    // Verify admin access
    await requireAdmin()

    const body = await request.json()
    const { merchantId, status } = body

    if (!merchantId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: merchantId, status' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, approved, or suspended' },
        { status: 400 }
      )
    }

    const updatedMerchant = await updateMerchantStatus(merchantId, status)

    return NextResponse.json({
      success: true,
      merchant: updatedMerchant,
    })

  } catch (error: any) {
    console.error('Error updating merchant status:', error)
    
    if (error.message?.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update merchant status', details: error.message },
      { status: 500 }
    )
  }
}
