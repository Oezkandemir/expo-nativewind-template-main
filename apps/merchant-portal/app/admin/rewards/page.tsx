import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Euro, TrendingUp, Users, Calendar, Filter } from 'lucide-react'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

export default async function AdminRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; type?: string; date?: string }>
}) {
  await requireAdmin()
  
  const params = await searchParams
  const adminSupabase = createServiceRoleClient()
  
  // Get all rewards with user info
  let query = adminSupabase
    .from('rewards')
    .select(`
      *,
      users!inner(id, email, name)
    `)
    .order('created_at', { ascending: false })
  
  // Apply filters
  if (params.user) {
    query = query.eq('user_id', params.user)
  }
  
  if (params.type) {
    query = query.eq('type', params.type)
  }
  
  if (params.date) {
    const date = new Date(params.date)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query.gte('created_at', date.toISOString())
      .lt('created_at', nextDay.toISOString())
  }
  
  const { data: rewards } = await query.limit(500)
  
  // Type assertion for rewards with users relation
  type RewardRow = DatabaseType['public']['Tables']['rewards']['Row']
  type UserRow = DatabaseType['public']['Tables']['users']['Row']
  type RewardWithUser = RewardRow & {
    users: Pick<UserRow, 'id' | 'email' | 'name'>
  }
  const typedRewards = (rewards || []) as RewardWithUser[]
  
  // Calculate statistics
  const totalRewards = typedRewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const totalTransactions = typedRewards.length
  const uniqueUsers = new Set(typedRewards.map(r => r.user_id).filter(Boolean)).size
  
  // Group by type
  const rewardsByType = new Map<string, number>()
  typedRewards.forEach((r) => {
    const type = r.type || 'unknown'
    const current = rewardsByType.get(type) || 0
    rewardsByType.set(type, current + Number(r.amount || 0))
  })
  
  // Get date range stats (last 7 days, 30 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const last7Days = typedRewards.filter(r => new Date(r.created_at) >= sevenDaysAgo)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  
  const last30Days = typedRewards.filter(r => new Date(r.created_at) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Zurück zum Dashboard</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Rewards-Verwaltung</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Alle Reward-Transaktionen verwalten</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Rewards</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{totalRewards.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{totalTransactions} Transaktionen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">User mit Rewards</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{uniqueUsers}</p>
            <p className="text-xs text-gray-400 mt-1">eindeutige User</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Letzte 7 Tage</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{last7Days.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">ausgezahlt</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Letzte 30 Tage</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{last30Days.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">ausgezahlt</p>
          </div>
        </div>

        {/* Rewards by Type */}
        {rewardsByType.size > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Rewards nach Typ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from(rewardsByType.entries()).map(([type, amount]) => (
                <div
                  key={type}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="text-gray-400 text-xs mb-1">{type}</div>
                  <div className="text-white font-semibold">€{amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Alle Rewards ({typedRewards.length})
            </h2>
          </div>

          {typedRewards.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Keine Rewards gefunden
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Card View */}
              <div className="block xl:hidden divide-y divide-slate-700">
                {typedRewards.map((reward) => {
                  const user = reward.users
                  return (
                    <div key={reward.id} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm sm:text-base truncate">
                            {user?.name || user?.email || 'Unbekannter User'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {reward.description || reward.type}
                          </div>
                          <div className="mt-1">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {reward.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-green-400">
                            +€{Number(reward.amount).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(reward.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">User</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Typ</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Beschreibung</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Betrag</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typedRewards.map((reward) => {
                      const user = reward.users
                      return (
                        <tr
                          key={reward.id}
                          className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 xl:px-6 py-4">
                            <div className="font-semibold text-white">
                              {user?.name || 'Kein Name'}
                            </div>
                            <div className="text-xs text-gray-400">{user?.email}</div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {reward.type}
                            </span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-gray-300 text-sm">
                            {reward.description || '-'}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-green-400 font-semibold text-lg">
                              +€{Number(reward.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-gray-400 text-xs xl:text-sm">
                            {formatDate(reward.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
