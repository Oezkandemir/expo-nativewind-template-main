'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const INTERESTS = [
  'Technology', 'Fitness', 'Fashion', 'Food', 'Travel', 'Music',
  'Wellness', 'Automotive', 'Beverages', 'Luxury', 'Sports',
  'Entertainment', 'Education', 'Health', 'Beauty',
]

const CONTENT_TYPES = [
  { value: 'image', label: 'Bild' },
  { value: 'video', label: 'Video' },
  { value: 'interactive', label: 'Interaktiv' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'active', label: 'Aktiv' },
  { value: 'paused', label: 'Pausiert' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
]

export default function AdminEditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    content_type: 'image',
    content_url: '',
    target_interests: [] as string[],
    target_age_min: '',
    target_age_max: '',
    target_gender: 'all',
    total_budget: '',
    spent_budget: '',
    status: 'draft',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await fetch(`/api/admin/campaigns/${campaignId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Fehler beim Laden der Kampagne')
        }

        const campaign = data.campaign
        setFormData({
          name: campaign.name || '',
          title: campaign.title || '',
          description: campaign.description || '',
          content_type: campaign.content_type || 'image',
          content_url: campaign.content_url || '',
          target_interests: campaign.target_interests || [],
          target_age_min: campaign.target_age_min?.toString() || '',
          target_age_max: campaign.target_age_max?.toString() || '',
          target_gender: campaign.target_gender || 'all',
          total_budget: campaign.total_budget?.toString() || '',
          spent_budget: campaign.spent_budget?.toString() || '',
          status: campaign.status || 'draft',
          start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
          end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        })
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const campaignData = {
        name: formData.name,
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        content_url: formData.content_url,
        target_interests: formData.target_interests,
        target_age_min: formData.target_age_min ? parseInt(formData.target_age_min) : null,
        target_age_max: formData.target_age_max ? parseInt(formData.target_age_max) : null,
        target_gender: formData.target_gender === 'all' ? null : formData.target_gender,
        total_budget: parseFloat(formData.total_budget),
        spent_budget: formData.spent_budget ? parseFloat(formData.spent_budget) : undefined,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren')
      }

      router.push('/admin/campaigns')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      target_interests: prev.target_interests.includes(interest)
        ? prev.target_interests.filter(i => i !== interest)
        : [...prev.target_interests, interest]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Lade Kampagne...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin/campaigns"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Zurück zu Kampagnen</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Kampagne bearbeiten</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Grundinformationen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content-Typ *
                </label>
                <select
                  required
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.content_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Budget & Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Budget & Status</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gesamt Budget (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.total_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_budget: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ausgegebenes Budget (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.spent_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, spent_budget: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Admin kann ausgegebenes Budget ändern</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enddatum
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Targeting</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interessen
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.target_interests.includes(interest)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mindestalter
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.target_age_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_age_min: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximalalter
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.target_age_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_age_max: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Geschlecht
                  </label>
                  <select
                    value={formData.target_gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_gender: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Alle</option>
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="other">Andere</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern
                </>
              )}
            </button>

            <Link
              href="/admin/campaigns"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
