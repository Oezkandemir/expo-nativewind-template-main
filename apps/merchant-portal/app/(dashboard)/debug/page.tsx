import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Try to fetch merchant by auth_user_id
  const { data: merchantByAuthId, error: authIdError } = await supabase
    .from('merchants')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // Try to fetch merchant by email
  const { data: merchantByEmail, error: emailError } = await supabase
    .from('merchants')
    .select('*')
    .eq('business_email', user.email)
    .maybeSingle()

  // Check all merchants (for debugging - remove in production)
  const { data: allMerchants, error: allError } = await supabase
    .from('merchants')
    .select('id, company_name, business_email, auth_user_id, status')
    .limit(10)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Debug: Merchant Lookup</h1>

        {/* Auth User Info */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Auth User Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="text-white font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email Confirmed:</span>
              <span className={user.email_confirmed_at ? 'text-green-400' : 'text-yellow-400'}>
                {user.email_confirmed_at ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Merchant by auth_user_id */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Merchant by auth_user_id</h2>
          {authIdError && Object.keys(authIdError).length > 0 ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded p-4">
              <p className="text-red-400 font-semibold mb-2">Error:</p>
              <pre className="text-xs text-red-300 overflow-auto">
                {JSON.stringify(authIdError, null, 2)}
              </pre>
            </div>
          ) : merchantByAuthId ? (
            <div className="bg-green-500/10 border border-green-500/50 rounded p-4">
              <p className="text-green-400 font-semibold mb-2">✅ Found!</p>
              <pre className="text-xs text-green-300 overflow-auto">
                {JSON.stringify(merchantByAuthId, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-4">
              <p className="text-yellow-400">⚠️ No merchant found with auth_user_id = {user.id}</p>
            </div>
          )}
        </div>

        {/* Merchant by email */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Merchant by business_email</h2>
          {emailError && Object.keys(emailError).length > 0 ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded p-4">
              <p className="text-red-400 font-semibold mb-2">Error:</p>
              <pre className="text-xs text-red-300 overflow-auto">
                {JSON.stringify(emailError, null, 2)}
              </pre>
            </div>
          ) : merchantByEmail ? (
            <div className="bg-green-500/10 border border-green-500/50 rounded p-4">
              <p className="text-green-400 font-semibold mb-2">✅ Found!</p>
              <pre className="text-xs text-green-300 overflow-auto">
                {JSON.stringify(merchantByEmail, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-4">
              <p className="text-yellow-400">⚠️ No merchant found with business_email = {user.email}</p>
            </div>
          )}
        </div>

        {/* All Merchants (for debugging) */}
        {allMerchants && allMerchants.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">All Merchants (first 10)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-gray-400 p-2">ID</th>
                    <th className="text-left text-gray-400 p-2">Company</th>
                    <th className="text-left text-gray-400 p-2">Email</th>
                    <th className="text-left text-gray-400 p-2">Auth User ID</th>
                    <th className="text-left text-gray-400 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allMerchants.map((m) => (
                    <tr key={m.id} className="border-b border-slate-700">
                      <td className="text-white font-mono text-xs p-2">{m.id.slice(0, 8)}...</td>
                      <td className="text-white p-2">{m.company_name}</td>
                      <td className="text-white p-2">{m.business_email}</td>
                      <td className="text-white font-mono text-xs p-2">
                        {m.auth_user_id ? m.auth_user_id.slice(0, 8) + '...' : '❌ NULL'}
                      </td>
                      <td className="text-white p-2">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="space-y-2">
            {merchantByAuthId ? (
              <p className="text-green-400">✅ Merchant found by auth_user_id - everything is working!</p>
            ) : merchantByEmail ? (
              <div className="space-y-2">
                <p className="text-yellow-400">⚠️ Merchant found by email but not by auth_user_id</p>
                <p className="text-gray-400 text-sm">
                  This means the merchant profile exists but doesn't have auth_user_id set.
                  The getCurrentMerchant() function should automatically fix this.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-400">❌ No merchant profile found!</p>
                <p className="text-gray-400 text-sm">
                  This means the merchant profile was not created during registration.
                  You may need to:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm ml-4">
                  <li>Check if registration completed successfully</li>
                  <li>Check Supabase logs for errors during registration</li>
                  <li>Manually create the merchant profile in Supabase</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/campaigns"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            ← Back to Campaigns
          </a>
        </div>
      </div>
    </div>
  )
}
