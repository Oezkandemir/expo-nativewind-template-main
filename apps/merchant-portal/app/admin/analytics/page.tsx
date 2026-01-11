import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, TrendingUp, Clock, BarChart, Activity } from 'lucide-react'

// Online threshold: users active in last 15 minutes
const ONLINE_THRESHOLD_MINUTES = 15

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  
  const adminSupabase = createServiceRoleClient()
  
  // Get all users
  const { data: allUsers } = await adminSupabase
    .from('users')
    .select('id, email, name, created_at')
    .order('created_at', { ascending: false })
  
  // Get all ad_views to determine online users and campaign views
  const { data: allAdViews } = await adminSupabase
    .from('ad_views')
    .select('user_id, campaign_id, viewed_at, created_at, completed')
    .order('viewed_at', { ascending: false })
  
  // Calculate online users (active in last 15 minutes)
  const now = new Date()
  const onlineThreshold = new Date(now.getTime() - ONLINE_THRESHOLD_MINUTES * 60 * 1000)
  
  const onlineUserIds = new Set<string>()
  const userLastActivity = new Map<string, Date>()
  
  allAdViews?.forEach((view: any) => {
    if (!view.user_id) return
    
    const viewDate = view.viewed_at ? new Date(view.viewed_at) : new Date(view.created_at)
    
    // Track last activity
    const currentLastActivity = userLastActivity.get(view.user_id)
    if (!currentLastActivity || viewDate > currentLastActivity) {
      userLastActivity.set(view.user_id, viewDate)
    }
    
    // Check if online
    if (viewDate >= onlineThreshold) {
      onlineUserIds.add(view.user_id)
    }
  })
  
  // Calculate user statistics
  const userStatsMap = new Map<string, {
    totalViews: number
    completedViews: number
    campaignsSeen: Set<string>
    lastActivity: Date | null
    totalRewards: number
  }>()
  
  // Get rewards for users
  const { data: allRewards } = await adminSupabase
    .from('rewards')
    .select('user_id, amount')
  
  allUsers?.forEach((user: any) => {
    userStatsMap.set(user.id, {
      totalViews: 0,
      completedViews: 0,
      campaignsSeen: new Set(),
      lastActivity: userLastActivity.get(user.id) || null,
      totalRewards: 0,
    })
  })
  
  // Process ad views
  allAdViews?.forEach((view: any) => {
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
  })
  
  // Process rewards
  allRewards?.forEach((reward: any) => {
    if (!reward.user_id) return
    
    const stats = userStatsMap.get(reward.user_id)
    if (stats) {
      stats.totalRewards += Number(reward.amount) || 0
    }
  })
  
  // Calculate totals
  const totalUsers = allUsers?.length || 0
  const onlineUsers = onlineUserIds.size
  const totalViews = allAdViews?.length || 0
  const completedViews = allAdViews?.filter((v: any) => v.completed).length || 0
  const totalCampaignsSeen = new Set(allAdViews?.map((v: any) => v.campaign_id).filter(Boolean)).size
  
  // Get campaign names
  const { data: campaigns } = await adminSupabase
    .from('campaigns')
    .select('id, name')
  
  const campaignMap = new Map<string, string>()
  campaigns?.forEach((c: any) => {
    campaignMap.set(c.id, c.name)
  })
  
  // Format date helper
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
  
  // Sort users by activity (most active first)
  const usersWithStats = allUsers?.map((user: any) => ({
    ...user,
    stats: userStatsMap.get(user.id) || {
      totalViews: 0,
      completedViews: 0,
      campaignsSeen: new Set(),
      lastActivity: null,
      totalRewards: 0,
    },
    isOnline: onlineUserIds.has(user.id),
  })).sort((a, b) => {
    // Online users first
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1
    // Then by last activity
    const aTime = a.stats.lastActivity?.getTime() || 0
    const bTime = b.stats.lastActivity?.getTime() || 0
    return bTime - aTime
  }) || []
  
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">App Analytics & Statistiken</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Native App User-Statistiken und Kampagnen-Analytics</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">{onlineUsers} online</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Online User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{onlineUsers}</p>
            <p className="text-xs text-gray-400 mt-1">letzten {ONLINE_THRESHOLD_MINUTES} Min</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Views</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{completedViews.toLocaleString()} abgeschlossen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Kampagnen</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalCampaignsSeen}</p>
            <p className="text-xs text-gray-400 mt-1">verschiedene gesehen</p>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Alle User ({totalUsers})</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Übersicht aller registrierten User mit ihren Aktivitäten
            </p>
          </div>

          {usersWithStats.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Keine User gefunden
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Card View */}
              <div className="block xl:hidden divide-y divide-slate-700">
                {usersWithStats.map((user) => {
                  const stats = user.stats
                  const campaignsSeenCount = stats.campaignsSeen.size
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-3 sm:p-4 ${user.isOnline ? 'bg-green-500/5' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm sm:text-base truncate">
                              {user.name || user.email}
                            </span>
                            {user.isOnline && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 shrink-0">
                                <Activity className="w-3 h-3" />
                                Online
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Views:</span>
                          <span className="text-gray-300 font-semibold">{stats.totalViews}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Abgeschlossen:</span>
                          <span className="text-gray-300 font-semibold">{stats.completedViews}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Kampagnen:</span>
                          <span className="text-gray-300 font-semibold">{campaignsSeenCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Rewards:</span>
                          <span className="text-gray-300 font-semibold">€{stats.totalRewards.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <span className="text-gray-400 text-xs block mb-1">Letzte Aktivität:</span>
                          <span className="text-gray-300 text-xs">{formatDate(stats.lastActivity)}</span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithStats.map((user) => {
                      const stats = user.stats
                      const campaignsSeenCount = stats.campaignsSeen.size
                      
                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-slate-700 hover:bg-slate-800/30 transition-colors ${
                            user.isOnline ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <td className="px-4 xl:px-6 py-4">
                            <div className="font-semibold text-white">{user.name || user.email}</div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{user.email}</div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            {user.isOnline ? (
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
