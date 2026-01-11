'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'

export default function MakeAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Nicht eingeloggt')
      }

      // Update user metadata to make them admin
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          is_admin: true,
          role: 'admin'
        }
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 2000)

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Fehler beim Erstellen des Admin-Users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Admin-Zugriff aktivieren</h1>
            <p className="text-gray-400 mt-2 text-sm">
              Aktivieren Sie Admin-Zugriff für Ihren aktuellen Account
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400 font-semibold">✅ Erfolg!</p>
              <p className="text-green-300 text-sm mt-1">
                Admin-Zugriff wurde aktiviert. Sie werden weitergeleitet...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 font-semibold">❌ Fehler</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aktueller Account
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-gray-400 text-xs mt-2">
                ⚠️ Diese Seite macht den aktuell eingeloggten User zum Admin.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Wird aktiviert...' : success ? 'Aktiviert!' : 'Admin-Zugriff aktivieren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/admin" 
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              ← Zum Admin-Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
