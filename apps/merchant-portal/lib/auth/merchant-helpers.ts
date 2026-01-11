import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated merchant.
 * Redirects to /login if not authenticated.
 * Returns merchant data or null if merchant profile not found.
 */
export async function getCurrentMerchant() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  console.log('Getting merchant for user:', user.id, user.email)

  // Try database function first (bypasses RLS issues)
  let merchant = null
  let merchantError = null
  
  try {
    const { data: merchantFromFunction, error: functionError } = await supabase
      .rpc('get_current_merchant')
    
    if (!functionError && merchantFromFunction && merchantFromFunction.length > 0) {
      // Map the function result to match the expected structure
      const funcResult = merchantFromFunction[0]
      merchant = {
        id: funcResult.merchant_id,
        auth_user_id: funcResult.auth_user_id,
        user_id: funcResult.user_id,
        company_name: funcResult.company_name,
        business_email: funcResult.business_email,
        phone: funcResult.phone,
        website: funcResult.website,
        vat_id: funcResult.vat_id,
        business_address: funcResult.business_address,
        status: funcResult.status,
        verified: funcResult.verified,
        created_at: funcResult.created_at,
        updated_at: funcResult.updated_at,
      }
      console.log('Found merchant via database function:', merchant.id, merchant.company_name)
    } else if (functionError) {
      console.warn('Database function failed, trying direct query:', functionError)
      merchantError = functionError
    }
  } catch (err) {
    console.warn('Database function error:', err)
    merchantError = err as any
  }

  // Fallback: Try direct query if function didn't work
  if (!merchant) {
    // Try to fetch merchant by auth_user_id
    let { data: merchantData, error: directError } = await supabase
      .from('merchants')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!directError && merchantData) {
      merchant = merchantData
      console.log('Found merchant by auth_user_id:', merchant.id, merchant.company_name)
    } else {
      merchantError = directError
    }
  }

  // Check if merchant was not found
  const hasError = merchantError && (
    merchantError.code || 
    merchantError.message || 
    (typeof merchantError === 'object' && Object.keys(merchantError).length > 0)
  )
  const merchantNotFound = hasError || !merchant
  
  if (hasError && !merchant) {
    console.warn('Error fetching merchant:', {
      code: merchantError?.code || 'NO_CODE',
      message: merchantError?.message || 'Unknown error',
      error: merchantError,
      userId: user.id
    })
  }
  
  // If merchant still not found, return null
  if (!merchant) {
    console.error('No merchant found for user:', user.email, user.id)
    console.error('This usually means:')
    console.error('1. Merchant profile was not created during registration')
    console.error('2. auth_user_id mismatch')
    console.error('3. Merchant exists but auth_user_id is not set correctly')
    return null
  }

  // Update merchant with auth_user_id if missing (shouldn't happen, but just in case)
  if (merchant && !merchant.auth_user_id) {
    console.log('Updating merchant with auth_user_id:', user.id)
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ auth_user_id: user.id })
      .eq('id', merchant.id)
    
    if (updateError) {
      console.warn('Failed to update merchant with auth_user_id:', updateError)
      // Don't fail - merchant was found, just couldn't update
    } else {
      console.log('Successfully updated merchant with auth_user_id')
      merchant.auth_user_id = user.id
    }
  }

  console.log('Found merchant:', merchant?.id, merchant?.company_name)
  return merchant
}

/**
 * Check if current user has an approved merchant account.
 * Returns true if merchant exists and is approved.
 */
export async function isMerchantApproved() {
  const merchant = await getCurrentMerchant()
  return merchant?.status === 'approved'
}
