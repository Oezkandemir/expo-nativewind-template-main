import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Activity, Eye, Euro, Users, Calendar, Filter } from 'lucide-react'

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; user?: string; limit?: string }>
}) {
  await requireAdmin()
  
  const params = await searchParams
  const limit = parseInt(params.limit || '100')
  const adminSupabase = createServiceRoleClient()
  
  // Get recent ad views
  const { data: adViews } = await adminSupabase
    .from('ad_views')
    .select(`
      *,
      users!inner(id, email, name),
      campaigns(id, name)
    `)
    .order('viewed_at', { ascending: false })
    .limit(limit)
  
  // Get recent rewards
  const { data: rewards } = await adminSupabase
    .from('rewards')
    .select(`
      *,
      users!inner(id, email, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Combine and sort activities
  const activities: Array<{
    id: string
    type: 'ad_view' | 'reward'
    timestamp: string
    user: any
    data: any
  }> = []
  
  adViews?.forEach((view) => {
    activities.push({
      id: view.id,
      type: 'ad_view',
      timestamp: view.viewed_at || view.created_at,
      user: view.users,
      data: view,
    })
  })
  
  rewards?.forEach((reward) => {
    activities.push({
      id: reward.id,
      type: 'reward',
      timestamp: reward.created_at,
      user: reward.users,
      data: reward,
    })
  })
  
  // Sort by timestamp
  activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  // Apply filters
  let filteredActivities = activities
  if (params.type) {
    filteredActivities = filteredActivities.filter(a => a.type === params.type)
  }
  if (params.user) {
    filteredActivities = filteredActivities.filter(a => a.user?.id === params.user)
  }
  
  // Limit results
  filteredActivities = filteredActivities.slice(0, limit)
  
  // Calculate statistics
  const totalActivities = activities.length
  const adViewCount = activities.filter(a => a.type === 'ad_view').length
  const rewardCount = activities.filter(a => a.type === 'reward').length
  
  // Recent activity (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentActivity = activities.filter(a => 
    new Date(a.timestamp) >= oneHourAgo
  ).length
  
  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `vor ${diffHours} Std`
    return d.toLocaleDateString('de-DE', {
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">Activity-Logs</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Alle Aktivitäten im System</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Aktivitäten</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalActivities}</p>
            <p className="text-xs text-gray-400 mt-1">letzten {limit} Einträge</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Ad-Views</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{adViewCount}</p>
            <p className="text-xs text-gray-400 mt-1">{((adViewCount / totalActivities) * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Rewards</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{rewardCount}</p>
            <p className="text-xs text-gray-400 mt-1">{((rewardCount / totalActivities) * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Letzte Stunde</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{recentActivity}</p>
            <p className="text-xs text-gray-400 mt-1">Aktivitäten</p>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Aktivitäten ({filteredActivities.length})
            </h2>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Keine Aktivitäten gefunden
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredActivities.map((activity) => {
                const user = activity.user as any
                
                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="p-3 sm:p-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'ad_view'
                          ? 'bg-purple-500/20'
                          : 'bg-yellow-500/20'
                      }`}>
                        {activity.type === 'ad_view' ? (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        ) : (
                          <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm sm:text-base truncate">
                                {user?.name || user?.email || 'Unbekannter User'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${
                                activity.type === 'ad_view'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {activity.type === 'ad_view' ? 'Ad-View' : 'Reward'}
                              </span>
                            </div>
                            
                            {activity.type === 'ad_view' ? (
                              <div className="text-xs sm:text-sm text-gray-300 mt-1">
                                <div className="truncate">
                                  {(activity.data.campaigns as any)?.name || activity.data.campaign_id || 'Unbekannte Kampagne'}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {activity.data.completed && (
                                    <span className="text-green-400 text-xs">✓ Abgeschlossen</span>
                                  )}
                                  {activity.data.reward_earned && (
                                    <span className="text-yellow-400 text-xs">
                                      +€{Number(activity.data.reward_earned).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm text-gray-300 mt-1">
                                <div className="line-clamp-2">
                                  {activity.data.description || activity.data.type}
                                </div>
                                <span className="ml-0 sm:ml-2 text-green-400 font-semibold block sm:inline mt-1 sm:mt-0">
                                  +€{Number(activity.data.amount).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400 shrink-0 sm:text-right">
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
