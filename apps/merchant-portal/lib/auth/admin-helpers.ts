import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkIsAdmin as checkIsAdminClient } from './admin-helpers-client'

/**
 * Re-export client-side checkIsAdmin for server-side use
 * Server-side version can also access process.env.ADMIN_EMAIL
 */
export function checkIsAdmin(user?: { email?: string | null; user_metadata?: any } | null): boolean {
  if (!user) {
    return false
  }

  // Check if user has admin role in metadata
  const isAdminUser = user.user_metadata?.is_admin === true || 
                      user.user_metadata?.role === 'admin' ||
                      user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                      user.email === process.env.ADMIN_EMAIL

  return isAdminUser
}

/**
 * Check if the current user is an admin.
 * Admins are identified by having 'is_admin: true' in their auth.users metadata.
 */
export async function isAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return false
  }

  return checkIsAdmin(user)
}

/**
 * Get admin user or redirect to login.
 * Use this in admin pages to protect routes.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/admin-login')
  }

  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    redirect('/campaigns') // Redirect non-admins to merchant dashboard
  }

  return user
}

/**
 * Get all merchants for admin dashboard
 * Uses a database function to bypass RLS if needed
 */
export async function getAllMerchants() {
  const supabase = await createClient()
  
  // Verify admin status
  await requireAdmin()
  
  // Try direct query first (should work with RLS policy)
  let { data: merchants, error } = await supabase
    .from('merchants')
    .select('*')
    .order('created_at', { ascending: false })

  // If RLS blocks, use database function as fallback
  if (error) {
    console.warn('Direct query failed, trying database function:', error)
    const { data: functionResult, error: functionError } = await supabase
      .rpc('get_all_merchants_for_admin')
    
    if (functionError) {
      console.error('Error fetching merchants via function:', functionError)
      return []
    }
    
    // Map function result to match expected structure
    merchants = functionResult?.map((m: any) => ({
      id: m.id,
      auth_user_id: m.auth_user_id,
      user_id: m.user_id,
      company_name: m.company_name,
      business_email: m.business_email,
      phone: m.phone,
      website: m.website,
      vat_id: m.vat_id,
      business_address: m.business_address,
      status: m.status,
      verified: m.verified,
      created_at: m.created_at,
      updated_at: m.updated_at,
    })) || []
  }

  return merchants || []
}

/**
 * Update merchant status (approve, suspend, etc.)
 */
export async function updateMerchantStatus(merchantId: string, status: 'pending' | 'approved' | 'suspended') {
  const supabase = await createClient()
  
  // Verify admin status
  await requireAdmin()
  
  const { data, error } = await supabase
    .from('merchants')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', merchantId)
    .select()
    .single()

  if (error) {
    console.error('Error updating merchant status:', error)
    throw error
  }

  return data
}
