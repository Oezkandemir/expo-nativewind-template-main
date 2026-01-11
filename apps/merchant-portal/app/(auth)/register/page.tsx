'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Megaphone, X, Mail } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestEmail, setRequestEmail] = useState('')
  const [requestCompanyName, setRequestCompanyName] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('companyName') as string
    const phone = formData.get('phone') as string

    try {
      const supabase = createClient()
      
      // Check if email is admin email - admins can always register
      const isAdminEmail = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
      
      if (isAdminEmail) {
        // Admin can register without restrictions
        console.log('Admin email detected, bypassing app user check')
      } else {
        // Check if user already exists in public.users table (app users)
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('email', email)
          .maybeSingle()

        if (existingUser && !checkError) {
          // User is an app user - show modal to request merchant access
          setRequestEmail(email)
          setRequestCompanyName(companyName)
          setShowRequestModal(true)
          showToast(
            'Sie sind bereits als App-Benutzer registriert. Bitte senden Sie uns eine Nachricht, um Ihr Merchant-Konto zu aktivieren.',
            'warning',
            8000
          )
          setLoading(false)
          return
        }
      }

      // Check if merchant profile already exists
      const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('id, business_email')
        .eq('business_email', email)
        .maybeSingle()

      if (existingMerchant) {
        const errorMsg = 'Diese E-Mail-Adresse ist bereits als Merchant registriert. Bitte melden Sie sich an.'
        setError(errorMsg)
        showToast(errorMsg, 'error', 5000)
        setLoading(false)
        return
      }

      // Get the base URL for email redirect
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      // 1. Create auth user with metadata and email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            user_type: 'merchant',
          },
          emailRedirectTo: `${baseUrl}/login?confirmed=true`,
        },
      })

      if (authError) {
        // Check if user already exists in auth.users
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('User already registered') ||
            authError.message?.includes('already been registered')) {
          const errorMsg = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.'
          setError(errorMsg)
          showToast(errorMsg, 'error', 5000)
          setLoading(false)
          return
        }
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('User creation failed')
      }
      
      console.log('Created auth user:', authData.user.id, authData.user.email)

      // 2. Create merchant profile via API route (bypasses RLS)
      const registerResponse = await fetch('/api/merchants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUserId: authData.user.id,
          companyName,
          email,
          phone: phone || null,
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        // Handle specific error cases
        if (registerResponse.status === 409) {
          const errorMsg = registerData.error || 'Diese E-Mail-Adresse ist bereits als Merchant registriert. Bitte melden Sie sich an.'
          setError(errorMsg)
          showToast(errorMsg, 'error', 5000)
          setLoading(false)
          return
        }
        
        const errorMsg = registerData.error || 'Fehler beim Erstellen des Merchant-Profils'
        throw new Error(errorMsg)
      }

      if (!registerData.success || !registerData.merchant) {
        throw new Error('Merchant-Profil wurde nicht erstellt. Bitte versuchen Sie es erneut.')
      }

      console.log('Merchant profile created successfully:', registerData.merchant)

      showToast(
        'Registrierung erfolgreich! Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.',
        'success',
        5000
      )
      router.push('/login')
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // Handle duplicate email error
      if (err.message?.includes('duplicate key') || err.message?.includes('already registered')) {
        const errorMsg = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.'
        setError(errorMsg)
        showToast(errorMsg, 'error', 5000)
      } else if (err.message?.includes('User already registered')) {
        const errorMsg = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.'
        setError(errorMsg)
        showToast(errorMsg, 'error', 5000)
      } else {
        const errorMsg = err.message || 'Registrierung fehlgeschlagen'
        setError(errorMsg)
        showToast(errorMsg, 'error', 5000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!requestEmail) {
      showToast('Bitte geben Sie Ihre E-Mail-Adresse ein.', 'error', 3000)
      return
    }

    setSendingRequest(true)
    try {
      const response = await fetch('/api/support/request-merchant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: requestEmail,
          companyName: requestCompanyName,
          message: requestMessage || 'Ich möchte mein App-Benutzerkonto zu einem Merchant-Konto aktivieren.',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast(
          'Ihre Anfrage wurde erfolgreich gesendet! Wir werden uns in Kürze bei Ihnen melden.',
          'success',
          6000
        )
        setShowRequestModal(false)
        setRequestEmail('')
        setRequestCompanyName('')
        setRequestMessage('')
      } else {
        showToast(
          data.error || 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es später erneut.',
          'error',
          5000
        )
      }
    } catch (error) {
      console.error('Error sending request:', error)
      showToast(
        'Fehler beim Senden der Anfrage. Bitte kontaktieren Sie uns direkt unter support@spotx.app',
        'error',
        6000
      )
    } finally {
      setSendingRequest(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Megaphone className="w-10 h-10 text-purple-500" />
            <span className="text-3xl font-bold text-white">SpotX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Merchant-Konto erstellen</h1>
          <p className="text-gray-400 mt-2">Starten Sie Ihre erste Kampagne</p>
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
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                Firmenname *
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ihre Firma GmbH"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="kontakt@ihre-firma.de"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort *
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Wird registriert...' : 'Konto erstellen'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Haben Sie bereits ein Konto?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Request Merchant Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-500" />
                Merchant-Konto aktivieren
              </h2>
              <button
                onClick={() => {
                  setShowRequestModal(false)
                  setRequestEmail('')
                  setRequestCompanyName('')
                  setRequestMessage('')
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  Sie sind bereits als App-Benutzer registriert. Um ein Merchant-Konto zu erhalten, 
                  senden Sie uns bitte eine Nachricht. Wir werden Ihr Konto aktivieren.
                </p>
              </div>

              <div>
                <label htmlFor="requestEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  id="requestEmail"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ihre@email.de"
                />
              </div>

              <div>
                <label htmlFor="requestCompanyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Firmenname
                </label>
                <input
                  type="text"
                  id="requestCompanyName"
                  value={requestCompanyName}
                  onChange={(e) => setRequestCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ihre Firma GmbH"
                />
              </div>

              <div>
                <label htmlFor="requestMessage" className="block text-sm font-medium text-gray-300 mb-2">
                  Nachricht (optional)
                </label>
                <textarea
                  id="requestMessage"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Teilen Sie uns mit, warum Sie ein Merchant-Konto benötigen..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setRequestEmail('')
                    setRequestCompanyName('')
                    setRequestMessage('')
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={sendingRequest || !requestEmail}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-semibold transition-colors"
                >
                  {sendingRequest ? 'Wird gesendet...' : 'Nachricht senden'}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Alternativ können Sie uns direkt kontaktieren:{' '}
                <a
                  href="mailto:support@spotx.app"
                  className="text-purple-400 hover:text-purple-300"
                >
                  support@spotx.app
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
