import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, User, Eye, Calendar, Euro, BarChart, Activity, Mail, Clock } from 'lucide-react'
import type { Database as DatabaseType } from '@spotx/shared-config/types'

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  
  const { id } = await params
  const adminSupabase = createServiceRoleClient()
  
  // Get user details
  const { data: user, error: userError } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User nicht gefunden</h1>
          <Link
            href="/admin/users"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Zurück zur User-Liste
          </Link>
        </div>
      </div>
    )
  }
  
  // Type assertion for user
  type UserRow = DatabaseType['public']['Tables']['users']['Row']
  const typedUser = user as UserRow
  
  // Get user's ad views
  const { data: adViews } = await adminSupabase
    .from('ad_views')
    .select('*, campaigns(name, title)')
    .eq('user_id', id)
    .order('viewed_at', { ascending: false })
    .limit(50)
  
  // Get user's rewards
  const { data: rewards } = await adminSupabase
    .from('rewards')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(50)
  
  // Type assertions
  type AdViewRow = DatabaseType['public']['Tables']['ad_views']['Row']
  type CampaignRow = DatabaseType['public']['Tables']['campaigns']['Row']
  type RewardRow = DatabaseType['public']['Tables']['rewards']['Row']
  
  type AdViewWithCampaign = AdViewRow & {
    campaigns: Pick<CampaignRow, 'name' | 'title'> | null
  }
  
  const typedAdViews = (adViews || []) as AdViewWithCampaign[]
  const typedRewards = (rewards || []) as RewardRow[]
  
  // Calculate statistics
  const totalViews = typedAdViews.length
  const completedViews = typedAdViews.filter(v => v.completed).length
  const totalRewards = typedRewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const campaignsSeen = new Set(typedAdViews.map(v => v.campaign_id).filter(Boolean)).size
  
  const lastActivity = typedAdViews.length > 0
    ? (typedAdViews[0].viewed_at ? new Date(typedAdViews[0].viewed_at) : new Date(typedAdViews[0].created_at))
    : null
  
  const isOnline = lastActivity
    ? (new Date().getTime() - lastActivity.getTime()) < 15 * 60 * 1000
    : false
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
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
            href="/admin/users"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Zurück zur User-Liste</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">User-Details</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{typedUser.email}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* User Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-600 flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {typedUser.name || 'Kein Name'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{typedUser.email}</span>
                  </div>
                </div>
                {isOnline && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    <Activity className="w-3 h-3" />
                    Online
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Registriert:</span>
                  <p className="text-white font-semibold">{formatDate(typedUser.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Letzte Aktivität:</span>
                  <p className="text-white font-semibold">{formatDate(lastActivity)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Onboarding:</span>
                  <p className="text-white font-semibold">
                    {typedUser.onboarding_complete ? 'Abgeschlossen' : 'Ausstehend'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Benachrichtigungen:</span>
                  <p className="text-white font-semibold">
                    {typedUser.notifications_enabled ? 'Aktiviert' : 'Deaktiviert'}
                  </p>
                </div>
                {typedUser.interests && typedUser.interests.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400">Interessen:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {typedUser.interests.map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Views</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalViews}</p>
            <p className="text-xs text-gray-400 mt-1">{completedViews} abgeschlossen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Kampagnen</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{campaignsSeen}</p>
            <p className="text-xs text-gray-400 mt-1">verschiedene gesehen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Rewards</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{totalRewards.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{typedRewards.length} Transaktionen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Status</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {isOnline ? 'Online' : 'Offline'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastActivity ? formatDate(lastActivity) : 'Keine Aktivität'}
            </p>
          </div>
        </div>

        {/* Recent Ad Views */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 mb-6">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Letzte Ad-Views</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {typedAdViews.length > 0 ? (
              typedAdViews.slice(0, 10).map((view) => (
                <div key={view.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {view.campaigns?.name || view.campaign_id || 'Unbekannte Kampagne'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(view.viewed_at || view.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        view.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {view.completed ? 'Abgeschlossen' : 'Unvollständig'}
                      </span>
                      <span className="text-white font-semibold">
                        €{Number(view.reward_earned || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                Keine Ad-Views gefunden
              </div>
            )}
          </div>
        </div>

        {/* Recent Rewards */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Letzte Rewards</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {typedRewards.length > 0 ? (
              typedRewards.slice(0, 10).map((reward) => (
                <div key={reward.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {reward.description || reward.type}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(reward.created_at)}
                      </div>
                    </div>
                    <div className="text-white font-semibold text-lg">
                      +€{Number(reward.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                Keine Rewards gefunden
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
