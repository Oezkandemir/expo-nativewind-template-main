import { getAllMerchants } from '@/lib/auth/admin-helpers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, LogOut, BarChart, Activity, Users, Euro, Database, Settings, Bell } from 'lucide-react'
import MerchantActions from './components/MerchantActions'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

export default async function AdminDashboard() {
  const merchants = await getAllMerchants()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Type assertion for merchants
  type MerchantRow = DatabaseType['public']['Tables']['merchants']['Row']
  type MerchantStatus = 'pending' | 'approved' | 'suspended'
  
  const typedMerchants = ((merchants || []) as MerchantRow[]).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    company_name: m.company_name,
    business_email: m.business_email,
    phone: m.phone,
    website: m.website,
    vat_id: m.vat_id,
    business_address: m.business_address,
    status: (m.status as MerchantStatus) || ('pending' as MerchantStatus),
    verified: m.verified,
    created_at: m.created_at,
    updated_at: m.updated_at,
  })) as (MerchantRow & { status: MerchantStatus })[]

  // Get statistics
  const pendingCount = typedMerchants.filter(m => m.status === 'pending').length
  const approvedCount = typedMerchants.filter(m => m.status === 'approved').length
  const suspendedCount = typedMerchants.filter(m => m.status === 'suspended').length
  
  // Sort merchants: newest first (pending at top for attention)
  const sortedMerchants = [...typedMerchants].sort((a, b) => {
    // Pending merchants first
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    // Then by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-400">Merchant-Verwaltung</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-400 truncate">{user?.email}</span>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Abmelden</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Admin-Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Link
              href="/admin/system"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Database className="w-6 h-6 text-indigo-400 mb-2" />
              <div className="text-white font-semibold text-sm">System-Dashboard</div>
              <div className="text-gray-400 text-xs mt-1">System-Übersicht</div>
            </Link>
            
            <Link
              href="/admin/users"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-white font-semibold text-sm">User-Verwaltung</div>
              <div className="text-gray-400 text-xs mt-1">Alle User verwalten</div>
            </Link>
            
            <Link
              href="/admin/analytics"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Activity className="w-6 h-6 text-green-400 mb-2" />
              <div className="text-white font-semibold text-sm">App Analytics</div>
              <div className="text-gray-400 text-xs mt-1">User-Statistiken</div>
            </Link>
            
            <Link
              href="/admin/campaigns"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <BarChart className="w-6 h-6 text-purple-400 mb-2" />
              <div className="text-white font-semibold text-sm">Kampagnen</div>
              <div className="text-gray-400 text-xs mt-1">Alle Kampagnen</div>
            </Link>
            
            <Link
              href="/admin/rewards"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Euro className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="text-white font-semibold text-sm">Rewards</div>
              <div className="text-gray-400 text-xs mt-1">Reward-Verwaltung</div>
            </Link>
            
            <Link
              href="/admin/activity"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Activity className="w-6 h-6 text-pink-400 mb-2" />
              <div className="text-white font-semibold text-sm">Activity-Logs</div>
              <div className="text-gray-400 text-xs mt-1">Alle Aktivitäten</div>
            </Link>
            
            <Link
              href="/admin/notifications"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              <Bell className="w-6 h-6 text-orange-400 mb-2" />
              <div className="text-white font-semibold text-sm">Push-Benachrichtigungen</div>
              <div className="text-gray-400 text-xs mt-1">Benachrichtigungen senden</div>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Ausstehend</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400/50 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Genehmigt</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-green-400/50 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Gesperrt</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400">{suspendedCount}</p>
              </div>
              <XCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-400/50 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Merchants List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Alle Merchants</h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Gesamt: {typedMerchants.length} Merchants
                  {pendingCount > 0 && (
                    <span className="ml-2 text-yellow-400 font-semibold">
                      • {pendingCount} neue Registrierung{pendingCount > 1 ? 'en' : ''} ausstehend
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block xl:hidden">
            {sortedMerchants.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                Keine Merchants gefunden
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {sortedMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className={`p-3 sm:p-4 ${
                      merchant.status === 'pending' ? 'bg-yellow-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/admin/merchants/${merchant.id}`}
                          className="font-semibold text-white text-sm sm:text-base hover:text-purple-400 transition-colors block truncate"
                        >
                          {merchant.company_name}
                        </Link>
                        {merchant.website && (
                          <a 
                            href={merchant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 truncate block mt-1"
                          >
                            {merchant.website}
                          </a>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        merchant.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : merchant.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {merchant.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {merchant.status === 'pending' && <Clock className="w-3 h-3" />}
                        {merchant.status === 'suspended' && <XCircle className="w-3 h-3" />}
                        <span>
                          {merchant.status === 'approved' ? 'Genehmigt' : 
                           merchant.status === 'pending' ? 'Ausstehend' : 'Gesperrt'}
                        </span>
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">E-Mail:</span>
                        <span className="text-gray-300 truncate ml-2 text-right">{merchant.business_email}</span>
                      </div>
                      {merchant.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Telefon:</span>
                          <span className="text-gray-300 ml-2">{merchant.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Erstellt:</span>
                        <span className="text-gray-300 ml-2">
                          {new Date(merchant.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <MerchantActions merchant={{
                        id: merchant.id,
                        company_name: merchant.company_name,
                        business_email: merchant.business_email,
                        status: merchant.status
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4">Firma</th>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4">E-Mail</th>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4 hidden lg:table-cell">Telefon</th>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4">Status</th>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4 hidden lg:table-cell">Erstellt</th>
                  <th className="text-left text-gray-400 font-semibold px-4 lg:px-6 py-4">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {sortedMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-12">
                      Keine Merchants gefunden
                    </td>
                  </tr>
                ) : (
                  sortedMerchants.map((merchant) => (
                    <tr 
                      key={merchant.id} 
                      className={`border-b border-slate-700 hover:bg-slate-800/30 transition-colors ${
                        merchant.status === 'pending' ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <Link 
                          href={`/admin/merchants/${merchant.id}`}
                          className="font-semibold text-white hover:text-purple-400 transition-colors block"
                        >
                          {merchant.company_name}
                        </Link>
                        {merchant.website && (
                          <a 
                            href={merchant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 block mt-1 truncate max-w-xs"
                          >
                            {merchant.website}
                          </a>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-300 text-sm">
                        <span className="truncate block max-w-xs">{merchant.business_email}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-300 text-sm hidden lg:table-cell">
                        {merchant.phone || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                          merchant.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400' 
                            : merchant.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {merchant.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {merchant.status === 'pending' && <Clock className="w-3 h-3" />}
                          {merchant.status === 'suspended' && <XCircle className="w-3 h-3" />}
                          <span className="hidden xl:inline">
                            {merchant.status === 'approved' ? 'Genehmigt' : 
                             merchant.status === 'pending' ? 'Ausstehend' : 'Gesperrt'}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">
                        {new Date(merchant.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <MerchantActions merchant={{
                          id: merchant.id,
                          company_name: merchant.company_name,
                          business_email: merchant.business_email,
                          status: merchant.status
                        }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
