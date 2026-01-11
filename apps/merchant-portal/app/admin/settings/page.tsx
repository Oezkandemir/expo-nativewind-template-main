import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import Link from 'next/link'
import { ArrowLeft, Settings, Database, Shield, Bell, Globe } from 'lucide-react'

export default async function AdminSettingsPage() {
  await requireAdmin()
  
  const supabase = await createClient()
  
  // Get environment info (without exposing secrets)
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasAdminEmail = !!process.env.ADMIN_EMAIL || !!process.env.NEXT_PUBLIC_ADMIN_EMAIL
  
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">Einstellungen</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">System-Konfiguration</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* System Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">System-Status</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <div className="text-white font-medium text-sm">Supabase URL</div>
                <div className="text-gray-400 text-xs mt-1">Datenbank-Verbindung</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasSupabaseUrl
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {hasSupabaseUrl ? 'Konfiguriert' : 'Nicht konfiguriert'}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <div className="text-white font-medium text-sm">Service Role Key</div>
                <div className="text-gray-400 text-xs mt-1">Admin-Operationen</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasServiceRoleKey
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {hasServiceRoleKey ? 'Konfiguriert' : 'Nicht konfiguriert'}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div>
                <div className="text-white font-medium text-sm">Admin E-Mail</div>
                <div className="text-gray-400 text-xs mt-1">Admin-Zugriff</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasAdminEmail
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {hasAdminEmail ? 'Konfiguriert' : 'Optional'}
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Sicherheit</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Row Level Security (RLS)</div>
              <div className="text-gray-400 text-xs">
                RLS ist aktiviert auf allen Tabellen. User können nur ihre eigenen Daten sehen.
              </div>
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Admin-Zugriff</div>
              <div className="text-gray-400 text-xs">
                Admin-Zugriff wird über User-Metadata gesteuert. Verwenden Sie `/admin/make-admin` um Admin-Zugriff zu aktivieren.
              </div>
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Service Role Key</div>
              <div className="text-gray-400 text-xs">
                Wird nur serverseitig verwendet und umgeht RLS für Admin-Operationen. Niemals im Client-Code verwenden!
              </div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Datenbank-Informationen</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-white font-medium text-sm mb-2">Tabellen</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>• users</div>
                <div>• merchants</div>
                <div>• campaigns</div>
                <div>• ad_views</div>
                <div>• rewards</div>
                <div>• user_stats</div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-white font-medium text-sm mb-1">Views</div>
              <div className="text-gray-400 text-xs">
                • user_total_rewards
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Schnellzugriff</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/make-admin"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">Admin-Zugriff aktivieren</div>
              <div className="text-gray-400 text-xs mt-1">Für neuen User</div>
            </Link>
            
            <Link
              href="/admin/system"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">System-Dashboard</div>
              <div className="text-gray-400 text-xs mt-1">System-Übersicht</div>
            </Link>
            
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">Supabase Dashboard</div>
              <div className="text-gray-400 text-xs mt-1">Datenbank verwalten</div>
            </a>
            
            <Link
              href="/admin/users"
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              <div className="text-white font-semibold text-sm">User-Verwaltung</div>
              <div className="text-gray-400 text-xs mt-1">Alle User anzeigen</div>
            </Link>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Dokumentation</h2>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            <div>• Admin-Dashboard: Übersicht aller Merchants</div>
            <div>• User-Verwaltung: Alle User und deren Aktivitäten</div>
            <div>• App Analytics: User-Statistiken und Online-Status</div>
            <div>• Kampagnen: Alle Kampagnen von allen Merchants</div>
            <div>• Rewards: Alle Reward-Transaktionen</div>
            <div>• Activity-Logs: Alle System-Aktivitäten</div>
            <div>• System-Dashboard: System-weite Metriken</div>
          </div>
        </div>
      </div>
    </div>
  )
}
