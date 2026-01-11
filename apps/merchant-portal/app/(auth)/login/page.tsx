'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { checkIsAdmin } from '@/lib/auth/admin-helpers-client'
import { Megaphone } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Handle specific error cases
        if (authError.message.includes('Email not confirmed')) {
          throw new Error(
            'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. ' +
            'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. ' +
            'Prüfen Sie auch Ihren Spam-Ordner.'
          )
        }
        throw authError
      }

      if (!data.user) {
        throw new Error('Login fehlgeschlagen')
      }

      // Check if user is admin FIRST - admins can always login
      const isAdminUser = checkIsAdmin(data.user)

      if (isAdminUser) {
        // Admin can always login, skip all other checks
        console.log('Admin login detected, bypassing merchant checks')
        router.push('/admin')
        router.refresh()
        return
      }

      // For non-admin users, check if they are app users
      const { data: appUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()

      if (appUser && !checkError) {
        // User is an app user, not a merchant - block access
        await supabase.auth.signOut()
        setError(
          'Diese E-Mail-Adresse ist als App-Benutzer registriert. ' +
          'App-Benutzer können sich nicht im Merchant Portal anmelden. ' +
          'Bitte kontaktieren Sie uns unter support@spotx.app, wenn Sie ein Merchant-Konto benötigen.'
        )
        showToast(
          'Sie sind bereits als App-Benutzer registriert. Bitte kontaktieren Sie uns für ein Merchant-Konto.',
          'error',
          8000
        )
        setLoading(false)
        return
      }

      // Check if user has a merchant profile
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id, status')
        .eq('business_email', email)
        .maybeSingle()

      if (!merchant) {
        // User authenticated but no merchant profile
        await supabase.auth.signOut()
        setError(
          'Kein Merchant-Konto gefunden. ' +
          'Bitte registrieren Sie sich zuerst als Merchant oder kontaktieren Sie den Support.'
        )
        showToast('Kein Merchant-Konto gefunden. Bitte registrieren Sie sich zuerst.', 'error', 5000)
        setLoading(false)
        return
      }

      // Regular merchant - redirect to campaigns
      router.push('/campaigns')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login fehlgeschlagen')
      showToast(err.message || 'Login fehlgeschlagen', 'error', 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Megaphone className="w-10 h-10 text-purple-500" />
            <span className="text-3xl font-bold text-white">SpotX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Merchant Portal</h1>
          <p className="text-gray-400 mt-2">Melden Sie sich an, um fortzufahren</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400">
              Noch kein Konto?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300">
                Jetzt registrieren
              </Link>
            </p>
            <p className="text-gray-400 text-sm">
              <a href="https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-purple-400 hover:text-purple-300">
                Problem beim Login? → Supabase Dashboard öffnen
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
