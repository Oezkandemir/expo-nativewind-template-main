'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Clock, Users, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string | null
  notifications_enabled: boolean
}

interface Campaign {
  id: string
  name: string
  title: string
  status: string
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Notification form state
  const [notificationType, setNotificationType] = useState<'all' | 'selected'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationBody, setNotificationBody] = useState('')
  
  // Time preferences state
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [campaignNotificationTime, setCampaignNotificationTime] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersRes = await fetch('/api/admin/users')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      } else {
        const errorData = await usersRes.json()
        throw new Error(errorData.error || 'Fehler beim Laden der User')
      }
      
      // Fetch campaigns
      const campaignsRes = await fetch('/api/admin/campaigns')
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json()
        setCampaigns(campaignsData.campaigns || [])
        
        // Fetch notification time preferences
        const timePrefsRes = await fetch('/api/admin/notifications/time-preference')
        if (timePrefsRes.ok) {
          const prefsData = await timePrefsRes.json()
          setCampaignNotificationTime(prefsData.preferences || {})
        }
      } else {
        const errorData = await campaignsRes.json()
        throw new Error(errorData.error || 'Fehler beim Laden der Kampagnen')
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: error.message || 'Fehler beim Laden der Daten' })
    } finally {
      setLoading(false)
    }
  }

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      setMessage({ type: 'error', text: 'Bitte Titel und Nachricht eingeben' })
      return
    }

    if (notificationType === 'selected' && selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Bitte mindestens einen User auswählen' })
      return
    }

    try {
      setSending(true)
      setMessage(null)

      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: notificationType,
          userIds: notificationType === 'selected' ? selectedUsers : undefined,
          campaignId: selectedCampaign || undefined,
          title: notificationTitle,
          body: notificationBody,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Senden der Benachrichtigung')
      }

      setMessage({ 
        type: 'success', 
        text: `Benachrichtigung erfolgreich an ${data.sentCount || 0} User gesendet` 
      })
      
      // Reset form
      setNotificationTitle('')
      setNotificationBody('')
      setSelectedUsers([])
      setSelectedCampaign('')
    } catch (error: any) {
      console.error('Error sending notification:', error)
      setMessage({ type: 'error', text: error.message || 'Fehler beim Senden der Benachrichtigung' })
    } finally {
      setSending(false)
    }
  }

  const handleSaveNotificationTime = async (campaignId: string, time: string) => {
    try {
      const response = await fetch('/api/admin/notifications/time-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          notificationTime: time,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern der Zeit')
      }

      setCampaignNotificationTime({
        ...campaignNotificationTime,
        [campaignId]: time,
      })

      setMessage({ type: 'success', text: 'Benachrichtigungszeit gespeichert' })
    } catch (error: any) {
      console.error('Error saving notification time:', error)
      setMessage({ type: 'error', text: error.message || 'Fehler beim Speichern' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-white">Laden...</div>
      </div>
    )
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
            <h1 className="text-xl sm:text-2xl font-bold text-white">Push-Benachrichtigungen</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Benachrichtigungen senden und Zeitpräferenzen verwalten</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Send Notification Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Benachrichtigung senden
          </h2>

          <div className="space-y-4">
            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kampagne (optional)
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Keine Kampagne</option>
                {campaigns.filter(c => c.status === 'active').map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} - {campaign.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="z.B. Neue Kampagne verfügbar"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Notification Body */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nachricht *
              </label>
              <textarea
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="z.B. Entdecken Sie aktuelle Angebote und interessante Neuigkeiten."
                rows={4}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Recipient Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Empfänger
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="all"
                    checked={notificationType === 'all'}
                    onChange={(e) => setNotificationType(e.target.value as 'all' | 'selected')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">Alle User ({users.length})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="selected"
                    checked={notificationType === 'selected'}
                    onChange={(e) => setNotificationType(e.target.value as 'all' | 'selected')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">Ausgewählte User ({selectedUsers.length})</span>
                </label>
              </div>
            </div>

            {/* User Selection */}
            {notificationType === 'selected' && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    User auswählen
                  </label>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {selectedUsers.length === users.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm">{user.name || user.email}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                      {user.notifications_enabled ? (
                        <Bell className="w-4 h-4 text-green-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-gray-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Senden...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Benachrichtigung senden</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification Time Preferences */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Benachrichtigungszeiten für Kampagnen
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Legen Sie fest, zu welcher Uhrzeit User Benachrichtigungen für Kampagnen erhalten sollen.
          </p>

          {campaigns.filter(c => c.status === 'active').length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Keine aktiven Kampagnen vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.filter(c => c.status === 'active').map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{campaign.name}</h3>
                      <p className="text-gray-400 text-sm">{campaign.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={campaignNotificationTime[campaign.id] || notificationTime}
                        onChange={(e) => {
                          setCampaignNotificationTime({
                            ...campaignNotificationTime,
                            [campaign.id]: e.target.value,
                          })
                        }}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleSaveNotificationTime(
                          campaign.id,
                          campaignNotificationTime[campaign.id] || notificationTime
                        )}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
