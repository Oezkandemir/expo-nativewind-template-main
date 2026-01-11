import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BarChart, Eye, CheckCircle, Euro, Calendar, Users } from 'lucide-react'
import { isAdmin } from '@/lib/auth/admin-helpers'
import CampaignActions from '../components/CampaignActions'

export default async function AdminCampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  const adminStatus = await isAdmin()
  if (!user || !adminStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Zugriff verweigert</h1>
          <p className="text-gray-400 mb-6">Sie haben keine Berechtigung für diese Seite.</p>
          <Link
            href="/admin"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Use service role client for admin to bypass RLS
  // This ensures admins can see all campaigns regardless of RLS policies
  const adminSupabase = createServiceRoleClient()

  // Fetch all campaigns with merchant info
  const { data: campaigns, error } = await adminSupabase
    .from('campaigns')
    .select(`
      *,
      merchants!inner (
        id,
        company_name,
        business_email,
        status
      ),
      campaign_stats (
        views_count,
        completed_views_count,
        rewards_paid
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
  }

  // Fetch ad_views for accurate statistics (use admin client to bypass RLS)
  const { data: allAdViews } = await adminSupabase
    .from('ad_views')
    .select('campaign_id, completed, reward_earned, watched_duration, user_id')

  // Create a map of campaign views
  const campaignViewsMap: Record<string, {
    views: number
    completed: number
    rewards: number
    watchTime: number
    uniqueUsers: Set<string>
  }> = {}

  allAdViews?.forEach((view: any) => {
    const campaignId = view.campaign_id
    if (!campaignId) return

    if (!campaignViewsMap[campaignId]) {
      campaignViewsMap[campaignId] = {
        views: 0,
        completed: 0,
        rewards: 0,
        watchTime: 0,
        uniqueUsers: new Set(),
      }
    }

    campaignViewsMap[campaignId].views++
    if (view.completed) {
      campaignViewsMap[campaignId].completed++
    }
    campaignViewsMap[campaignId].rewards += Number(view.reward_earned) || 0
    campaignViewsMap[campaignId].watchTime += Number(view.watched_duration) || 0
    if (view.user_id) {
      campaignViewsMap[campaignId].uniqueUsers.add(view.user_id)
    }
  })

  // Calculate totals
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0
  const totalViews = Object.values(campaignViewsMap).reduce((sum, v) => sum + v.views, 0)
  const totalCompleted = Object.values(campaignViewsMap).reduce((sum, v) => sum + v.completed, 0)
  const totalSpent = Object.values(campaignViewsMap).reduce((sum, v) => sum + v.rewards, 0)
  const totalBudget = campaigns?.reduce((sum: number, c: any) => sum + (Number(c.total_budget) || 0), 0) || 0
  const uniqueViewers = new Set(
    Object.values(campaignViewsMap).flatMap(v => Array.from(v.uniqueUsers))
  ).size

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('de-DE')
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">Alle Kampagnen</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Übersicht aller Kampagnen von allen Merchants</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Kampagnen</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalCampaigns}</p>
            <p className="text-xs text-gray-400 mt-1">{activeCampaigns} aktiv</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Gesamt Views</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{totalCompleted.toLocaleString()} abgeschlossen</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Ausgegeben</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">von €{totalBudget.toFixed(2)}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Eindeutige Viewer</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{uniqueViewers.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Einzelne Nutzer</p>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Kampagnen ({totalCampaigns})</h2>
          </div>

          {campaigns && campaigns.length > 0 ? (
            <>
              {/* Mobile & Tablet Card View */}
              <div className="block xl:hidden divide-y divide-slate-700">
                {campaigns.map((campaign: any) => {
                  const merchant = campaign.merchants
                  const directCampaignViews = campaignViewsMap[campaign.id] || {
                    views: 0,
                    completed: 0,
                    rewards: 0,
                    watchTime: 0,
                    uniqueUsers: new Set(),
                  }
                  const campaignStats = campaign.campaign_stats || []
                  const statsViews = campaignStats.reduce((sum: number, stat: any) => sum + (stat.views_count || 0), 0)
                  const statsCompleted = campaignStats.reduce((sum: number, stat: any) => sum + (stat.completed_views_count || 0), 0)

                  const campaignViews = directCampaignViews.views || statsViews
                  const campaignCompleted = directCampaignViews.completed || statsCompleted
                  const campaignSpent = directCampaignViews.rewards || Number(campaign.spent_budget) || 0
                  const campaignBudget = Number(campaign.total_budget) || 0
                  const campaignBudgetPercent = campaignBudget > 0 ? (campaignSpent / campaignBudget) * 100 : 0
                  const completionRate = campaignViews > 0 ? (campaignCompleted / campaignViews) * 100 : 0

                  return (
                    <div key={campaign.id} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm sm:text-base mb-1 truncate">{campaign.name}</div>
                          <div className="text-xs text-gray-400 mb-2 line-clamp-2">{campaign.title}</div>
                          <Link
                            href={`/admin/merchants/${merchant.id}`}
                            className="text-xs text-purple-400 hover:text-purple-300 truncate block"
                          >
                            {merchant.company_name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            campaign.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : campaign.status === 'draft'
                              ? 'bg-gray-500/20 text-gray-400'
                              : campaign.status === 'paused'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : campaign.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {campaign.status === 'active' ? 'Aktiv' :
                             campaign.status === 'draft' ? 'Entwurf' :
                             campaign.status === 'paused' ? 'Pausiert' :
                             campaign.status === 'completed' ? 'Abgeschlossen' :
                             'Abgebrochen'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Views:</span>
                          <p className="text-white font-semibold">{campaignViews.toLocaleString()}</p>
                          {campaignViews > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{completionRate.toFixed(1)}% Rate</p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Abgeschlossen:</span>
                          <p className="text-white font-semibold">{campaignCompleted.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Ausgegeben:</span>
                          <p className="text-white font-semibold">€{campaignSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">Budget:</span>
                          <p className="text-white font-semibold">€{campaignBudget.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="w-full h-1.5 bg-slate-700 rounded-full">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${Math.min(campaignBudgetPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{campaignBudgetPercent.toFixed(1)}% Budget genutzt</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400 mb-2">
                        <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <CampaignActions campaign={campaign} />
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
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Kampagne</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Merchant</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Status</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Views</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Abgeschlossen</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Ausgegeben</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Budget</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Zeitraum</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign: any) => {
                      const merchant = campaign.merchants
                      const directCampaignViews = campaignViewsMap[campaign.id] || {
                        views: 0,
                        completed: 0,
                        rewards: 0,
                        watchTime: 0,
                        uniqueUsers: new Set(),
                      }
                      const campaignStats = campaign.campaign_stats || []
                      const statsViews = campaignStats.reduce((sum: number, stat: any) => sum + (stat.views_count || 0), 0)
                      const statsCompleted = campaignStats.reduce((sum: number, stat: any) => sum + (stat.completed_views_count || 0), 0)

                      const campaignViews = directCampaignViews.views || statsViews
                      const campaignCompleted = directCampaignViews.completed || statsCompleted
                      const campaignSpent = directCampaignViews.rewards || Number(campaign.spent_budget) || 0
                      const campaignBudget = Number(campaign.total_budget) || 0
                      const campaignBudgetPercent = campaignBudget > 0 ? (campaignSpent / campaignBudget) * 100 : 0
                      const completionRate = campaignViews > 0 ? (campaignCompleted / campaignViews) * 100 : 0

                      return (
                        <tr
                          key={campaign.id}
                          className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 xl:px-6 py-4">
                            <div className="font-semibold text-white">{campaign.name}</div>
                            <div className="text-sm text-gray-400">{campaign.title}</div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <Link
                              href={`/admin/merchants/${merchant.id}`}
                              className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                              {merchant.company_name}
                            </Link>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              campaign.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : campaign.status === 'draft'
                                ? 'bg-gray-500/20 text-gray-400'
                                : campaign.status === 'paused'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : campaign.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {campaign.status === 'active' ? 'Aktiv' :
                               campaign.status === 'draft' ? 'Entwurf' :
                               campaign.status === 'paused' ? 'Pausiert' :
                               campaign.status === 'completed' ? 'Abgeschlossen' :
                               'Abgebrochen'}
                            </span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">{campaignViews.toLocaleString()}</span>
                            {campaignViews > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {completionRate.toFixed(1)}% Rate
                              </p>
                            )}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">{campaignCompleted.toLocaleString()}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <span className="text-white font-semibold">€{campaignSpent.toFixed(2)}</span>
                            <div className="w-20 xl:w-24 h-1.5 bg-slate-700 rounded-full mt-1 ml-auto">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${Math.min(campaignBudgetPercent, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right text-gray-300 text-sm">
                            €{campaignBudget.toFixed(2)}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-gray-400 text-xs xl:text-sm">
                            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <CampaignActions campaign={campaign} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-400">Keine Kampagnen gefunden.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
