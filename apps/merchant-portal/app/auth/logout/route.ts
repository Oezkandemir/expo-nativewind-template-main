import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Logout route handler
 * POST /auth/logout
 * Signs out the user and redirects to login page
 */
export async function POST() {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Redirect to login page
  redirect('/login')
}
