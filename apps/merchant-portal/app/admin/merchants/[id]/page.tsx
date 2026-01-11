import { requireAdmin } from '@/lib/auth/admin-helpers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BarChart, Eye, Euro, Users, Calendar, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function MerchantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  await requireAdmin()
  
  const resolvedParams = await Promise.resolve(params)
  const merchantId = resolvedParams.id
  
  // Use service role client for admin to bypass RLS
  const supabase = createServiceRoleClient()

  // Get merchant details
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchantId)
    .single()

  if (merchantError || !merchant) {
    redirect('/admin')
  }

  // Get all campaigns for this merchant
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_stats (
        views_count,
        completed_views_count,
        rewards_paid,
        total_watch_time,
        unique_viewers,
        date
      )
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })

  // Get campaign IDs for this merchant
  const campaignIds = campaigns?.map(c => c.id) || []

  // Get direct views from ad_views table for more accurate statistics
  // Use admin client to bypass RLS
  let directViews = { total: 0, completed: 0, totalRewards: 0, totalWatchTime: 0, uniqueUsers: 0 }
  let campaignViewsMap: Record<string, { views: number; completed: number }> = {}
  
  if (campaignIds.length > 0) {
    const { data: adViews } = await supabase
      .from('ad_views')
      .select('id, campaign_id_uuid, user_id, completed, reward_earned, watched_duration')
      .in('campaign_id_uuid', campaignIds)

    if (adViews) {
      directViews.total = adViews.length
      directViews.completed = adViews.filter(v => v.completed).length
      directViews.totalRewards = adViews.reduce((sum, v) => sum + Number(v.reward_earned || 0), 0)
      directViews.totalWatchTime = adViews.reduce((sum, v) => sum + (v.watched_duration || 0), 0)
      directViews.uniqueUsers = new Set(adViews.map(v => v.user_id)).size

      // Group views by campaign
      adViews.forEach(view => {
        const campaignId = view.campaign_id_uuid
        if (!campaignViewsMap[campaignId]) {
          campaignViewsMap[campaignId] = { views: 0, completed: 0 }
        }
        campaignViewsMap[campaignId].views++
        if (view.completed) {
          campaignViewsMap[campaignId].completed++
        }
      })
    }
  }

  // Calculate total statistics
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
  
  // Aggregate campaign stats (use direct views as primary, fallback to campaign_stats)
  let totalViews = directViews.total
  let totalCompleted = directViews.completed
  let totalSpent = 0
  let totalRewardsPaid = directViews.totalRewards
  let totalWatchTime = directViews.totalWatchTime
  let uniqueViewers = directViews.uniqueUsers

  campaigns?.forEach(campaign => {
    totalSpent += Number(campaign.spent_budget) || 0
    
    // Fallback to campaign_stats if direct views are 0
    if (totalViews === 0 && campaign.campaign_stats) {
      campaign.campaign_stats.forEach((stat: any) => {
        totalViews += stat.views_count || 0
        totalCompleted += stat.completed_views_count || 0
        totalRewardsPaid += Number(stat.rewards_paid) || 0
        totalWatchTime += stat.total_watch_time || 0
      })
    }
  })

  // Get total budget across all campaigns
  const totalBudget = campaigns?.reduce((sum, c) => sum + Number(c.total_budget || 0), 0) || 0
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Calculate completion rate
  const completionRate = totalViews > 0 ? (totalCompleted / totalViews) * 100 : 0

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nicht gesetzt'
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Zurück zum Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Merchant Info */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{merchant.company_name}</h1>
                <p className="text-sm sm:text-base text-gray-400 break-all">{merchant.business_email}</p>
                {merchant.website && (
                  <a
                    href={merchant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm mt-1 inline-block break-all"
                  >
                    {merchant.website}
                  </a>
                )}
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 ${
                merchant.status === 'approved' 
                  ? 'bg-green-500/20 text-green-400' 
                  : merchant.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {merchant.status === 'approved' ? 'Genehmigt' : 
                 merchant.status === 'pending' ? 'Ausstehend' : 'Gesperrt'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Telefon</span>
                <p className="text-white text-sm sm:text-base">{merchant.phone || '-'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Registriert am</span>
                <p className="text-white text-sm sm:text-base">{formatDate(merchant.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Verifiziert</span>
                <p className="text-white text-sm sm:text-base">{merchant.verified ? 'Ja' : 'Nein'}</p>
              </div>
              {merchant.vat_id && (
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm">USt-IdNr.</span>
                  <p className="text-white text-sm sm:text-base break-all">{merchant.vat_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
            <p className="text-xs text-gray-400 mt-1">{totalCompleted.toLocaleString()} abgeschlossen ({completionRate.toFixed(1)}%)</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Ausgegeben</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">€{totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">von €{totalBudget.toFixed(2)} ({budgetUtilization.toFixed(1)}%)</p>
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

        {/* Budget Progress */}
        {totalBudget > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Budget-Übersicht</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Ausgegeben</span>
                <span className="text-white font-semibold">
                  €{totalSpent.toFixed(2)} / €{totalBudget.toFixed(2)}
                </span>
              </div>
              <div className="h-3 sm:h-4 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {budgetUtilization.toFixed(1)}% des Gesamtbudgets verwendet
              </p>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Kampagnen ({totalCampaigns})</h2>
          </div>

          {campaigns && campaigns.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-slate-700">
                {campaigns.map((campaign) => {
                  const directCampaignViews = campaignViewsMap[campaign.id] || { views: 0, completed: 0 }
                  const campaignStats = campaign.campaign_stats || []
                  const statsViews = campaignStats.reduce((sum: number, stat: any) => sum + (stat.views_count || 0), 0)
                  const statsCompleted = campaignStats.reduce((sum: number, stat: any) => sum + (stat.completed_views_count || 0), 0)
                  
                  const campaignViews = directCampaignViews.views || statsViews
                  const campaignCompleted = directCampaignViews.completed || statsCompleted
                  const campaignSpent = Number(campaign.spent_budget) || 0
                  const campaignBudget = Number(campaign.total_budget) || 0
                  const campaignBudgetPercent = campaignBudget > 0 ? (campaignSpent / campaignBudget) * 100 : 0
                  const completionRate = campaignViews > 0 ? (campaignCompleted / campaignViews) * 100 : 0

                  return (
                    <div key={campaign.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white mb-1">{campaign.name}</div>
                          <div className="text-xs sm:text-sm text-gray-400">{campaign.title}</div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0 ${
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
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-400 text-xs">Views:</span>
                          <p className="text-white font-semibold">{campaignViews.toLocaleString()}</p>
                          {campaignViews > 0 && (
                            <p className="text-xs text-gray-400">{completionRate.toFixed(1)}% Rate</p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Abgeschlossen:</span>
                          <p className="text-white font-semibold">{campaignCompleted.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Ausgegeben:</span>
                          <p className="text-white font-semibold">€{campaignSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Budget:</span>
                          <p className="text-white font-semibold">€{campaignBudget.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="w-full h-1.5 bg-slate-700 rounded-full">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${Math.min(campaignBudgetPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{campaignBudgetPercent.toFixed(1)}% Budget genutzt</p>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Name</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Status</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Klicks/Views</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Abgeschlossen</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Ausgegeben</th>
                      <th className="text-right text-gray-400 font-semibold px-4 xl:px-6 py-4">Budget</th>
                      <th className="text-left text-gray-400 font-semibold px-4 xl:px-6 py-4">Zeitraum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const directCampaignViews = campaignViewsMap[campaign.id] || { views: 0, completed: 0 }
                      const campaignStats = campaign.campaign_stats || []
                      const statsViews = campaignStats.reduce((sum: number, stat: any) => sum + (stat.views_count || 0), 0)
                      const statsCompleted = campaignStats.reduce((sum: number, stat: any) => sum + (stat.completed_views_count || 0), 0)
                      
                      const campaignViews = directCampaignViews.views || statsViews
                      const campaignCompleted = directCampaignViews.completed || statsCompleted
                      const campaignSpent = Number(campaign.spent_budget) || 0
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-400">Dieser Merchant hat noch keine Kampagnen erstellt.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
