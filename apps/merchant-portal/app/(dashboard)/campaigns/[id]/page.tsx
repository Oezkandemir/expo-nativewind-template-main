import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'
import { ArrowLeft, Edit, BarChart, Calendar, Target, Euro, Users, Eye, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const supabase = await createClient()
  const merchant = await getCurrentMerchant()

  if (!merchant) {
    redirect('/login')
  }

  // Handle both Promise and direct params (Next.js 14 vs 15)
  const resolvedParams = await Promise.resolve(params)
  const campaignId = resolvedParams.id

  // Fetch campaign
  const { data: campaign, error } = await supabase
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
    .eq('id', campaignId)
    .eq('merchant_id', merchant.id)
    .single()

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Kampagne nicht gefunden</h1>
          <p className="text-gray-400 mb-6">
            Die angeforderte Kampagne existiert nicht oder Sie haben keine Berechtigung.
          </p>
          <Link
            href="/campaigns"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Zurück zu Kampagnen
          </Link>
        </div>
      </div>
    )
  }

  // Type assertion for campaign with relations
  const campaignData = campaign as any

  // Calculate statistics
  const stats = campaignData.campaign_stats || []
  const totalViews = stats.reduce((sum: number, stat: any) => sum + (stat.views_count || 0), 0)
  const totalCompleted = stats.reduce((sum: number, stat: any) => sum + (stat.completed_views_count || 0), 0)
  const totalRewardsPaid = stats.reduce((sum: number, stat: any) => sum + Number(stat.rewards_paid || 0), 0)
  const totalWatchTime = stats.reduce((sum: number, stat: any) => sum + (stat.total_watch_time || 0), 0)
  const uniqueViewers = stats.reduce((max: number, stat: any) => Math.max(max, stat.unique_viewers || 0), 0)

  const budgetPercent = (Number(campaignData.spent_budget) / Number(campaignData.total_budget)) * 100
  const completionRate = totalViews > 0 ? (totalCompleted / totalViews) * 100 : 0

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/campaigns"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zu Kampagnen
          </Link>
          <Link
            href={`/campaigns/${campaignData.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Campaign Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{campaignData.name}</h1>
              <p className="text-xl text-gray-400">{campaignData.title}</p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              campaignData.status === 'active' ? 'bg-green-500/20 text-green-400' :
              campaignData.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
              campaignData.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
              campaignData.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {campaignData.status === 'active' ? 'Aktiv' :
               campaignData.status === 'draft' ? 'Entwurf' :
               campaignData.status === 'paused' ? 'Pausiert' :
               campaignData.status === 'completed' ? 'Abgeschlossen' :
               'Abgebrochen'}
            </span>
          </div>
          {campaignData.description && (
            <p className="text-gray-300 mt-4">{campaignData.description}</p>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Gesamt Views</h3>
            </div>
            <p className="text-2xl font-bold text-white">{totalViews}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Abgeschlossen</h3>
            </div>
            <p className="text-2xl font-bold text-white">{totalCompleted}</p>
            <p className="text-xs text-gray-400 mt-1">{completionRate.toFixed(1)}% Completion Rate</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Eindeutige Viewer</h3>
            </div>
            <p className="text-2xl font-bold text-white">{uniqueViewers}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Euro className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Ausgegeben</h3>
            </div>
            <p className="text-2xl font-bold text-white">€{Number(campaignData.spent_budget).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">von €{Number(campaignData.total_budget).toFixed(2)}</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Budget-Fortschritt</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ausgegeben</span>
              <span className="text-white font-semibold">
                €{Number(campaignData.spent_budget).toFixed(2)} / €{Number(campaignData.total_budget).toFixed(2)}
              </span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {budgetPercent.toFixed(1)}% des Budgets verwendet
            </p>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Content Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Inhalts-Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Inhaltstyp</span>
                <span className="text-white capitalize">{campaignData.content_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dauer</span>
                <span className="text-white">{campaignData.duration_seconds} Sekunden</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kosten pro View</span>
                <span className="text-white">€{Number(campaignData.reward_per_view).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Content URL</span>
                <a
                  href={campaignData.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 break-all"
                >
                  {campaignData.content_url}
                </a>
              </div>
            </div>
          </div>

          {/* Targeting Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Zielgruppen-Targeting</h2>
            <div className="space-y-3">
              {campaignData.target_interests && campaignData.target_interests.length > 0 ? (
                <div>
                  <span className="text-gray-400 block mb-2">Interessen</span>
                  <div className="flex flex-wrap gap-2">
                    {campaignData.target_interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-400">Interessen</span>
                  <span className="text-white">Alle</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Alter</span>
                <span className="text-white">
                  {campaignData.target_age_min && campaignData.target_age_max
                    ? `${campaignData.target_age_min} - ${campaignData.target_age_max} Jahre`
                    : campaignData.target_age_min
                    ? `Ab ${campaignData.target_age_min} Jahren`
                    : campaignData.target_age_max
                    ? `Bis ${campaignData.target_age_max} Jahre`
                    : 'Alle Altersgruppen'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Geschlecht</span>
                <span className="text-white capitalize">
                  {campaignData.target_gender || 'Alle'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Zeitraum</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-400 block text-sm">Startdatum</span>
                <span className="text-white">{formatDate(campaignData.start_date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-400 block text-sm">Enddatum</span>
                <span className="text-white">{formatDate(campaignData.end_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Table */}
        {stats.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Tägliche Statistiken</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Datum</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Abgeschlossen</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Watch Time</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Ausgegeben</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat: any) => (
                    <tr key={stat.date} className="border-b border-slate-700/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(stat.date).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 px-4 text-right text-white">{stat.views_count || 0}</td>
                      <td className="py-3 px-4 text-right text-white">{stat.completed_views_count || 0}</td>
                      <td className="py-3 px-4 text-right text-white">{stat.total_watch_time || 0}s</td>
                      <td className="py-3 px-4 text-right text-white">€{Number(stat.rewards_paid || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-white">{stat.unique_viewers || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
