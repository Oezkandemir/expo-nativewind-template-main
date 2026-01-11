import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, BarChart, LogOut, Edit, Shield } from 'lucide-react'
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'
import { isAdmin } from '@/lib/auth/admin-helpers'
import { redirect } from 'next/navigation'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  // Get current merchant (redirects if not authenticated)
  const merchant = await getCurrentMerchant()
  
  // Check if user is admin
  const adminStatus = await isAdmin()
  
  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Merchant-Profil nicht gefunden</h1>
          <p className="text-gray-400 mb-6">
            Es konnte kein Merchant-Profil für Ihren Account gefunden werden.
          </p>
          <Link 
            href="/register"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Jetzt registrieren
          </Link>
        </div>
      </div>
    )
  }

  // Get campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_stats (
        views_count,
        completed_views_count,
        rewards_paid
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{merchant.company_name}</h1>
              <p className="text-xs sm:text-sm text-gray-400">{merchant.business_email}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {adminStatus && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Badge */}
        {merchant.status === 'pending' && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-400">
              ⏳ Ihr Account wird noch geprüft. Sie können noch keine Kampagnen erstellen.
            </p>
          </div>
        )}

        {merchant.status === 'approved' && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400">
              ✅ Ihr Account wurde genehmigt! Sie können jetzt Kampagnen erstellen.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Meine Kampagnen</h2>
            <p className="text-gray-400 mt-2">Verwalten Sie Ihre Werbekampagnen</p>
          </div>
          {merchant.status === 'approved' && (
            <Link
              href="/campaigns/new"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Neue Kampagne
            </Link>
          )}
        </div>

        {/* Campaigns Grid */}
        {campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: any) => {
              const stats = campaign.campaign_stats?.[0] || {
                views_count: 0,
                completed_views_count: 0,
                rewards_paid: 0,
              }
              
              const budgetPercent = (Number(campaign.spent_budget) / Number(campaign.total_budget)) * 100

              return (
                <div
                  key={campaign.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                      <p className="text-sm text-gray-400">{campaign.title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                      campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Views</span>
                      <span className="text-white font-semibold">{stats.views_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Abgeschlossen</span>
                      <span className="text-white font-semibold">{stats.completed_views_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ausgegeben</span>
                      <span className="text-white font-semibold">
                        €{Number(campaign.spent_budget).toFixed(2)} / €{Number(campaign.total_budget).toFixed(2)}
                      </span>
                    </div>

                    {/* Budget Progress */}
                    <div className="pt-2">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {budgetPercent.toFixed(1)}% Budget genutzt
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                    <Link
                      href={`/campaigns/${campaign.id}/edit`}
                      className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Bearbeiten
                    </Link>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <BarChart className="w-4 h-4" />
                      Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700">
            <p className="text-gray-400 text-lg mb-4">
              Sie haben noch keine Kampagnen erstellt.
            </p>
            {merchant.status === 'approved' && (
              <Link
                href="/campaigns/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Erste Kampagne erstellen
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
