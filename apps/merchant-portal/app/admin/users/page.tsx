import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, Activity, Euro, Calendar, Search, Filter, UserX, UserCheck } from 'lucide-react'
import UserActions from '../components/UserActions'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  await requireAdmin()
  
  const params = await searchParams
  const searchQuery = params.search || ''
  const filterStatus = params.filter || 'all'
  
  const adminSupabase = createServiceRoleClient()
  
  // Get all users
  const { data: allUsers } = await adminSupabase
    .from('users')
    .select('id, email, name, created_at, onboarding_complete, notifications_enabled')
    .order('created_at', { ascending: false })
  
  // Get all ad_views for statistics
  const { data: allAdViews } = await adminSupabase
    .from('ad_views')
    .select('user_id, campaign_id, viewed_at, created_at, completed, reward_earned')
  
  // Get all rewards
  const { data: allRewards } = await adminSupabase
    .from('rewards')
    .select('user_id, amount')
  
  // Calculate statistics per user
  const userStatsMap = new Map<string, {
    totalViews: number
    completedViews: number
    campaignsSeen: Set<string>
    totalRewards: number
    lastActivity: Date | null
    isOnline: boolean
  }>()
  
  const now = new Date()
  const onlineThreshold = new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes
  
  allUsers?.forEach((user) => {
    userStatsMap.set(user.id, {
      totalViews: 0,
      completedViews: 0,
      campaignsSeen: new Set(),
      totalRewards: 0,
      lastActivity: null,
      isOnline: false,
    })
  })
  
  // Process ad views
  allAdViews?.forEach((view) => {
    if (!view.user_id) return
    
    const stats = userStatsMap.get(view.user_id)
    if (!stats) return
    
    stats.totalViews++
    if (view.completed) {
      stats.completedViews++
    }
    if (view.campaign_id) {
      stats.campaignsSeen.add(view.campaign_id)
    }
    
    const viewDate = view.viewed_at ? new Date(view.viewed_at) : new Date(view.created_at)
    if (!stats.lastActivity || viewDate > stats.lastActivity) {
      stats.lastActivity = viewDate
    }
    
    if (viewDate >= onlineThreshold) {
      stats.isOnline = true
    }
  })
  
  // Process rewards
  allRewards?.forEach((reward) => {
    if (!reward.user_id) return
    
    const stats = userStatsMap.get(reward.user_id)
    if (stats) {
      stats.totalRewards += Number(reward.amount) || 0
    }
  })
  
  // Filter and search users
  let filteredUsers = allUsers?.map((user) => ({
    ...user,
    stats: userStatsMap.get(user.id) || {
      totalViews: 0,
      completedViews: 0,
      campaignsSeen: new Set(),
      totalRewards: 0,
      lastActivity: null,
      isOnline: false,
    },
  })) || []
  
  // Apply search filter
  if (searchQuery) {
    filteredUsers = filteredUsers.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  
  // Apply status filter
  if (filterStatus === 'online') {
    filteredUsers = filteredUsers.filter((user) => user.stats.isOnline)
  } else if (filterStatus === 'active') {
    filteredUsers = filteredUsers.filter((user) => user.stats.totalViews > 0)
  } else if (filterStatus === 'inactive') {
    filteredUsers = filteredUsers.filter((user) => user.stats.totalViews === 0)
  }
  
  // Calculate totals
  const totalUsers = allUsers?.length || 0
  const onlineUsers = filteredUsers.filter((u) => u.stats.isOnline).length
  const activeUsers = filteredUsers.filter((u) => u.stats.totalViews > 0).length
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Nie'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `vor ${diffHours} Std`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
    return date.toLocaleDateString('de-DE')
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">User-Verwaltung</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Alle registrierten User verwalten</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">{activeUsers} aktiv</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Online</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{onlineUsers}</p>
            <p className="text-xs text-gray-400 mt-1">letzten 15 Min</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Aktive User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{activeUsers}</p>
            <p className="text-xs text-gray-400 mt-1">mit Aktivität</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="User suchen (E-Mail, Name)..."
                defaultValue={searchQuery}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                defaultValue={filterStatus}
                className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Alle</option>
                <option value="online">Online</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              User ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Keine User gefunden
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Card View */}
              <div className="block xl:hidden divide-y divide-slate-700">
                {filteredUsers.map((user) => {
                  const stats = user.stats
                  const campaignsSeenCount = stats.campaignsSeen.size
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-3 sm:p-4 ${
                        user.stats.isOnline ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex-1 min-w-0 hover:text-purple-400 transition-colors"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm sm:text-base truncate">
                              {user.name || user.email}
                            </span>
                            {user.stats.isOnline && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 shrink-0">
                                <Activity className="w-3 h-3" />
                                Online
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                        </Link>
                        <div className="flex-shrink-0">
                          <UserActions user={user} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Views:</span>
                          <p className="text-white font-semibold">{stats.totalViews}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Abgeschlossen:</span>
                          <p className="text-white font-semibold">{stats.completedViews}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Kampagnen:</span>
                          <p className="text-white font-semibold">{campaignsSeenCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Rewards:</span>
                          <p className="text-white font-semibold">€{stats.totalRewards.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-4">
                          <span className="text-gray-400 text-xs block mb-1">Letzte Aktivität:</span>
                          <p className="text-white font-semibold text-xs">{formatDate(stats.lastActivity)}</p>
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
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Status</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Views</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Abgeschlossen</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Kampagnen</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Rewards</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Letzte Aktivität</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const stats = user.stats
                      const campaignsSeenCount = stats.campaignsSeen.size
                      
                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-slate-700 hover:bg-slate-800/30 transition-colors ${
                            user.stats.isOnline ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <td className="px-4 xl:px-6 py-4">
                            <Link 
                              href={`/admin/users/${user.id}`}
                              className="block hover:text-purple-400 transition-colors"
                            >
                              <div className="font-semibold text-white">{user.name || user.email}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">{user.email}</div>
                            </Link>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            {user.stats.isOnline ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                <Activity className="w-3 h-3" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                Offline
                              </span>
                            )}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">{stats.totalViews}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">{stats.completedViews}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">{campaignsSeenCount}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">€{stats.totalRewards.toFixed(2)}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-gray-400 text-xs xl:text-sm">
                            {formatDate(stats.lastActivity)}
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <UserActions user={user} />
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
