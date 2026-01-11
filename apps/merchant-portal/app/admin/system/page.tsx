import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Database, Users, BarChart, Euro, Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

export default async function SystemDashboardPage() {
  await requireAdmin()
  
  const adminSupabase = createServiceRoleClient()
  
  // Get all data in parallel
  const [
    { data: users },
    { data: merchants },
    { data: campaigns },
    { data: adViews },
    { data: rewards },
  ] = await Promise.all([
    adminSupabase.from('users').select('id, created_at'),
    adminSupabase.from('merchants').select('id, status, created_at'),
    adminSupabase.from('campaigns').select('id, status, total_budget, spent_budget, created_at'),
    adminSupabase.from('ad_views').select('id, user_id, campaign_id, completed, reward_earned, viewed_at, created_at'),
    adminSupabase.from('rewards').select('id, user_id, amount, created_at'),
  ])
  
  // Type assertions
  type UserRow = DatabaseType['public']['Tables']['users']['Row']
  type MerchantRow = DatabaseType['public']['Tables']['merchants']['Row']
  type CampaignRow = DatabaseType['public']['Tables']['campaigns']['Row']
  type AdViewRow = DatabaseType['public']['Tables']['ad_views']['Row']
  type RewardRow = DatabaseType['public']['Tables']['rewards']['Row']
  
  const typedUsers = (users || []) as Pick<UserRow, 'id' | 'created_at'>[]
  const typedMerchants = (merchants || []) as Pick<MerchantRow, 'id' | 'status' | 'created_at'>[]
  const typedCampaigns = (campaigns || []) as Pick<CampaignRow, 'id' | 'status' | 'total_budget' | 'spent_budget' | 'created_at'>[]
  const typedAdViews = (adViews || []) as Pick<AdViewRow, 'id' | 'user_id' | 'campaign_id' | 'completed' | 'reward_earned' | 'viewed_at' | 'created_at'>[]
  const typedRewards = (rewards || []) as Pick<RewardRow, 'id' | 'user_id' | 'amount' | 'created_at'>[]
  
  // Calculate statistics
  const totalUsers = typedUsers.length
  const totalMerchants = typedMerchants.length
  const approvedMerchants = typedMerchants.filter(m => m.status === 'approved').length
  const pendingMerchants = typedMerchants.filter(m => m.status === 'pending').length
  
  const totalCampaigns = typedCampaigns.length
  const activeCampaigns = typedCampaigns.filter(c => c.status === 'active').length
  const totalBudget = typedCampaigns.reduce((sum, c) => sum + (Number(c.total_budget) || 0), 0)
  const spentBudget = typedCampaigns.reduce((sum, c) => sum + (Number(c.spent_budget) || 0), 0)
  
  const totalViews = typedAdViews.length
  const completedViews = typedAdViews.filter(v => v.completed).length
  const uniqueUsers = new Set(typedAdViews.map(v => v.user_id).filter(Boolean)).size
  const uniqueCampaigns = new Set(typedAdViews.map(v => v.campaign_id).filter(Boolean)).size
  
  const totalRewards = typedRewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const totalRewardTransactions = typedRewards.length
  
  // Calculate online users (active in last 15 minutes)
  const now = new Date()
  const onlineThreshold = new Date(now.getTime() - 15 * 60 * 1000)
  const onlineUsers = new Set(
    typedAdViews.filter(v => {
      const viewDate = v.viewed_at ? new Date(v.viewed_at) : new Date(v.created_at)
      return viewDate >= onlineThreshold && v.user_id
    }).map(v => v.user_id)
  ).size
  
  // Calculate growth (last 7 days vs previous 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  const recentUsers = typedUsers.filter(u => new Date(u.created_at) >= sevenDaysAgo).length
  const previousUsers = typedUsers.filter(u => {
    const created = new Date(u.created_at)
    return created >= fourteenDaysAgo && created < sevenDaysAgo
  }).length
  
  const recentViews = typedAdViews.filter(v => {
    const viewDate = v.viewed_at ? new Date(v.viewed_at) : new Date(v.created_at)
    return viewDate >= sevenDaysAgo
  }).length
  
  const previousViews = typedAdViews.filter(v => {
    const viewDate = v.viewed_at ? new Date(v.viewed_at) : new Date(v.created_at)
    return viewDate >= fourteenDaysAgo && viewDate < sevenDaysAgo
  }).length
  
  const userGrowth = previousUsers > 0
    ? ((recentUsers - previousUsers) / previousUsers * 100).toFixed(1)
    : recentUsers > 0 ? '100' : '0'
  
  const viewGrowth = previousViews > 0
    ? ((recentViews - previousViews) / previousViews * 100).toFixed(1)
    : recentViews > 0 ? '100' : '0'
  
  // Calculate completion rate
  const completionRate = totalViews > 0
    ? ((completedViews / totalViews) * 100).toFixed(1)
    : '0'
  
  // Budget utilization
  const budgetUtilization = totalBudget > 0
    ? ((spentBudget / totalBudget) * 100).toFixed(1)
    : '0'
  
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">System-Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Übersicht aller System-Metriken</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalUsers}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${Number(userGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <p className={`text-xs ${Number(userGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {userGrowth}% (7 Tage)
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Online User</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{onlineUsers}</p>
            <p className="text-xs text-gray-400 mt-1">letzten 15 Min</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Views</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${Number(viewGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <p className={`text-xs ${Number(viewGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {viewGrowth}% (7 Tage)
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Rewards</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{totalRewards.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{totalRewardTransactions} Transaktionen</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Merchants</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalMerchants}</p>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-400">{approvedMerchants} genehmigt</span>
              <span className="text-gray-400">•</span>
              <span className="text-yellow-400">{pendingMerchants} ausstehend</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Kampagnen</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalCampaigns}</p>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-400">{activeCampaigns} aktiv</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">€{totalBudget.toFixed(2)} Budget</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Completion Rate</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{completionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {completedViews} von {totalViews} Views
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Budget-Übersicht</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Gesamt Budget</span>
                  <span className="text-white font-semibold">€{totalBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Ausgegeben</span>
                  <span className="text-white font-semibold">€{spentBudget.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${Math.min(Number(budgetUtilization), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {budgetUtilization}% Budget genutzt
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Engagement-Metriken</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Eindeutige User</span>
                  <span className="text-white font-semibold">{uniqueUsers}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Eindeutige Kampagnen</span>
                  <span className="text-white font-semibold">{uniqueCampaigns}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Durchschnitt Views/User</span>
                  <span className="text-white font-semibold">
                    {uniqueUsers > 0 ? (totalViews / uniqueUsers).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Schnellzugriff</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/admin/users"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">User-Verwaltung</div>
              <div className="text-gray-400 text-xs mt-1">{totalUsers} User</div>
            </Link>
            <Link
              href="/admin/analytics"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">App Analytics</div>
              <div className="text-gray-400 text-xs mt-1">{onlineUsers} online</div>
            </Link>
            <Link
              href="/admin/campaigns"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">Kampagnen</div>
              <div className="text-gray-400 text-xs mt-1">{activeCampaigns} aktiv</div>
            </Link>
            <Link
              href="/admin"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">Merchants</div>
              <div className="text-gray-400 text-xs mt-1">{pendingMerchants} ausstehend</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
