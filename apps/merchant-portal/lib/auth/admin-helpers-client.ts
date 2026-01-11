/**
 * Client-side admin helper functions
 * These can be used in Client Components without server dependencies
 */

/**
 * Check if a user object is an admin.
 * Can be used with any user object (from auth.getUser() or signInWithPassword)
 * 
 * @param user - User object from Supabase Auth
 * @returns true if user is an admin
 */
export function checkIsAdmin(user?: { email?: string | null; user_metadata?: any } | null): boolean {
  if (!user) {
    return false
  }

  // Check if user has admin role in metadata
  const isAdminUser = user.user_metadata?.is_admin === true || 
                      user.user_metadata?.role === 'admin' ||
                      user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                      user.email === (typeof window !== 'undefined' ? (window as any).__ADMIN_EMAIL__ : undefined)

  return isAdminUser
}
