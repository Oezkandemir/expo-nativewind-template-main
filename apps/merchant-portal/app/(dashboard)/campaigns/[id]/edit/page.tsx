'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, Loader2, Upload } from 'lucide-react'

const INTERESTS = [
  'Technology',
  'Fitness',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Wellness',
  'Automotive',
  'Beverages',
  'Luxury',
  'Sports',
  'Entertainment',
  'Education',
  'Health',
  'Beauty',
]

const CONTENT_TYPES = [
  { value: 'image', label: 'Bild' },
  { value: 'video', label: 'Video' },
  { value: 'interactive', label: 'Interaktiv' },
]

const GENDERS = [
  { value: 'all', label: 'Alle' },
  { value: 'male', label: 'Männlich' },
  { value: 'female', label: 'Weiblich' },
  { value: 'other', label: 'Andere' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'active', label: 'Aktiv' },
  { value: 'paused', label: 'Pausiert' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Abgebrochen' },
]

// Paket-Optionen: Views pro Monat basierend auf 5 Views pro Tag
const PACKAGES = [
  { months: 1, views: 150, price: 150, label: '1 Monat (150 Views)' },
  { months: 2, views: 300, price: 300, label: '2 Monate (300 Views)' },
  { months: 3, views: 450, price: 450, label: '3 Monate (450 Views)' },
]

// Fester Preis pro View: 1€
const FIXED_PRICE_PER_VIEW = 1.00
// Feste Dauer: 5 Sekunden
const FIXED_DURATION_SECONDS = 5

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [spentBudget, setSpentBudget] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
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
    status: 'draft',
    start_date: '',
    end_date: '',
  })

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Fehler beim Laden der Kampagne')
        }

        const campaign = data.campaign
        
        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (dateString: string | null) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        }

        const currentBudget = Number(campaign.total_budget) || 0
        const spent = Number(campaign.spent_budget) || 0
        setSpentBudget(spent)

        // Find matching package based on current budget
        const matchingPackage = PACKAGES.find(pkg => pkg.price === currentBudget) || null
        setSelectedPackage(matchingPackage)

        const contentUrl = campaign.content_url || ''
        const isImage = campaign.content_type === 'image'
        
        setFormData({
          name: campaign.name || '',
          title: campaign.title || '',
          description: campaign.description || '',
          content_type: campaign.content_type || 'image',
          content_url: contentUrl,
          target_interests: campaign.target_interests || [],
          target_age_min: campaign.target_age_min?.toString() || '',
          target_age_max: campaign.target_age_max?.toString() || '',
          target_gender: campaign.target_gender || 'all',
          total_budget: currentBudget.toString(),
          status: campaign.status || 'draft',
          start_date: formatDate(campaign.start_date),
          end_date: formatDate(campaign.end_date),
        })

        // Set uploaded image URL if it's an image
        if (isImage && contentUrl) {
          setUploadedImageUrl(contentUrl)
        }
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der Kampagne')
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId])

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      target_interests: prev.target_interests.includes(interest)
        ? prev.target_interests.filter(i => i !== interest)
        : [...prev.target_interests, interest]
    }))
  }

  const handlePackageSelect = (pkg: typeof PACKAGES[0]) => {
    if (pkg.price < spentBudget) {
      return // Don't allow selecting package with budget below spent
    }
    
    setSelectedPackage(pkg)
    
    // Automatisch Enddatum neu berechnen basierend auf Startdatum
    const startDate = formData.start_date ? new Date(formData.start_date) : new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + pkg.months)
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }
    
    setFormData(prev => ({
      ...prev,
      end_date: formatDate(endDate),
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only allow images
    if (!file.type.startsWith('image/')) {
      setError('Nur Bilddateien sind erlaubt')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei ist zu groß. Maximale Größe: 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Hochladen')
      }

      setUploadedImageUrl(data.url)
      setFormData(prev => ({ ...prev, content_url: data.url }))
      setFormData(prev => ({ ...prev, content_type: 'image' }))
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hochladen der Datei')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.title || !selectedPackage) {
        throw new Error('Bitte füllen Sie alle Pflichtfelder aus und wählen Sie ein Paket.')
      }

      // For images, require uploaded image or URL
      if (formData.content_type === 'image' && !formData.content_url) {
        throw new Error('Bitte laden Sie ein Bild hoch oder geben Sie eine Bild-URL ein.')
      }

      // For other types, require URL
      if (formData.content_type !== 'image' && !formData.content_url) {
        throw new Error('Bitte geben Sie eine Content-URL ein.')
      }

      // Validate budget: can't reduce below spent amount
      if (selectedPackage.price < spentBudget) {
        throw new Error(`Das Budget kann nicht unter €${spentBudget.toFixed(2)} gesenkt werden, da bereits dieser Betrag ausgegeben wurde.`)
      }

      // Prepare campaign data
      const campaignData = {
        name: formData.name,
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        content_url: formData.content_url,
        target_interests: formData.target_interests.length > 0 ? formData.target_interests : [],
        target_age_min: formData.target_age_min ? parseInt(formData.target_age_min) : null,
        target_age_max: formData.target_age_max ? parseInt(formData.target_age_max) : null,
        target_gender: formData.target_gender === 'all' ? null : formData.target_gender,
        duration_seconds: FIXED_DURATION_SECONDS, // Immer 5 Sekunden fest
        reward_per_view: FIXED_PRICE_PER_VIEW, // Immer 1€ fest
        total_budget: selectedPackage.price, // Budget basierend auf Paket
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren der Kampagne')
      }

      // Redirect to campaigns page
      router.push('/campaigns')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fehler beim Aktualisieren der Kampagne')
    } finally {
      setSaving(false)
    }
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Kampagne bearbeiten</h1>
          <p className="text-gray-400">Bearbeiten Sie die Details Ihrer Werbekampagne</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Grundinformationen</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Kampagnenname <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="z.B. Sommer Sale 2024"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Titel <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kurzer Titel für die Anzeige"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Beschreibung
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Detaillierte Beschreibung der Kampagne"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Inhalt</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="content_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Inhaltstyp <span className="text-red-400">*</span>
                </label>
                <select
                  id="content_type"
                  required
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.content_type === 'image' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bild hochladen <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg text-white hover:border-purple-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Wird hochgeladen...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>{uploadedImageUrl ? 'Bild ändern' : 'Bild auswählen'}</span>
                        </>
                      )}
                    </button>
                    {uploadedImageUrl && (
                      <div className="relative">
                        <img
                          src={uploadedImageUrl}
                          alt="Vorschau"
                          className="w-full h-64 object-contain rounded-lg border border-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImageUrl(null)
                            setFormData(prev => ({ ...prev, content_url: '' }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {formData.content_url && !uploadedImageUrl && (
                      <div className="relative">
                        <img
                          src={formData.content_url}
                          alt="Aktuelles Bild"
                          className="w-full h-64 object-contain rounded-lg border border-slate-600"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Unterstützte Formate: JPEG, PNG, GIF, WebP (max. 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="content_url" className="block text-sm font-medium text-gray-300 mb-2">
                    Content URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    id="content_url"
                    required
                    value={formData.content_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={formData.content_type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/content'}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    URL zum {formData.content_type === 'video' ? 'Video' : 'interaktiven Inhalt'}
                  </p>
                </div>
              )}

              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dauer (fest)
                </label>
                <p className="text-lg font-semibold text-white">{FIXED_DURATION_SECONDS} Sekunden</p>
                <p className="text-xs text-gray-400 mt-1">
                  Die Dauer ist fest auf {FIXED_DURATION_SECONDS} Sekunden gesetzt und kann nicht geändert werden.
                </p>
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Zielgruppen-Targeting</h2>
            
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
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        formData.target_interests.includes(interest)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">Wählen Sie die Interessen Ihrer Zielgruppe</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target_age_min" className="block text-sm font-medium text-gray-300 mb-2">
                    Mindestalter
                  </label>
                  <input
                    type="number"
                    id="target_age_min"
                    min="13"
                    max="100"
                    value={formData.target_age_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_age_min: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="18"
                  />
                </div>

                <div>
                  <label htmlFor="target_age_max" className="block text-sm font-medium text-gray-300 mb-2">
                    Maximalalter
                  </label>
                  <input
                    type="number"
                    id="target_age_max"
                    min="13"
                    max="100"
                    value={formData.target_age_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_age_max: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="65"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="target_gender" className="block text-sm font-medium text-gray-300 mb-2">
                  Geschlecht
                </label>
                <select
                  id="target_gender"
                  value={formData.target_gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_gender: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {GENDERS.map(gender => (
                    <option key={gender.value} value={gender.value}>{gender.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Paket-Auswahl */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Paket-Auswahl</h2>
            
            <div className="space-y-4">
              {/* Kosten pro View - Fest */}
              <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Kosten pro View (fest)
                </label>
                <p className="text-lg font-semibold text-white">€{FIXED_PRICE_PER_VIEW.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Dieser Preis ist fest und kann nicht geändert werden. Der Nutzer erhält 0.067€ pro Kampagne.
                </p>
              </div>

              {/* Paket-Auswahl */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wählen Sie ein Paket <span className="text-red-400">*</span>
                  {spentBudget > 0 && (
                    <span className="text-xs text-yellow-400 ml-2">
                      (Bereits ausgegeben: €{spentBudget.toFixed(2)})
                    </span>
                  )}
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {PACKAGES.map((pkg) => {
                    const isDisabled = pkg.price < spentBudget
                    return (
                      <button
                        key={pkg.months}
                        type="button"
                        onClick={() => !isDisabled && handlePackageSelect(pkg)}
                        disabled={isDisabled}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedPackage?.months === pkg.months
                            ? 'border-purple-500 bg-purple-500/10'
                            : isDisabled
                            ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{pkg.label}</h3>
                          {selectedPackage?.months === pkg.months && (
                            <span className="text-purple-400">✓</span>
                          )}
                          {isDisabled && (
                            <span className="text-xs text-red-400">Nicht möglich</span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">€{pkg.price}</p>
                        <p className="text-xs text-gray-400">
                          {pkg.views} Views • {pkg.months} Monat{pkg.months > 1 ? 'e' : ''}
                        </p>
                        {isDisabled && (
                          <p className="text-xs text-red-400 mt-2">
                            Budget bereits ausgegeben
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedPackage && (
                  <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                    <p className="text-sm text-white">
                      <span className="font-semibold">Ausgewählt:</span> {selectedPackage.label} für €{selectedPackage.price}
                    </p>
                    {spentBudget > 0 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        Bereits ausgegeben: €{spentBudget.toFixed(2)} • Verbleibend: €{(selectedPackage.price - spentBudget).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates - Automatisch basierend auf Paket */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Zeitraum</h2>
            
            {selectedPackage ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                  <p className="text-sm text-purple-300 mb-2">
                    ⚡ Enddatum wird automatisch basierend auf dem ausgewählten Paket berechnet
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-300 mb-2">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      value={formData.start_date}
                      onChange={(e) => {
                        const newStartDate = new Date(e.target.value)
                        const newEndDate = new Date(newStartDate)
                        newEndDate.setMonth(newEndDate.getMonth() + selectedPackage.months)
                        
                        setFormData(prev => ({
                          ...prev,
                          start_date: e.target.value,
                          end_date: newEndDate.toISOString().split('T')[0],
                        }))
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-300 mb-2">
                      Enddatum (automatisch berechnet)
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={formData.end_date}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedPackage.months} Monat{selectedPackage.months > 1 ? 'e' : ''} nach Startdatum
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠️ Bitte wählen Sie zuerst ein Paket aus, um den Zeitraum zu berechnen.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/campaigns"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
