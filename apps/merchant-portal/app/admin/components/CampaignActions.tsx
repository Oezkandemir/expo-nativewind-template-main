'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Pause, Play, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  status: string
}

export default function CampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    setLoading(newStatus)
    setError('')

    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Status')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fehler beim Aktualisieren')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie die Kampagne "${campaign.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    setLoading('delete')
    setError('')

    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-red-400 text-xs">{error}</span>
      )}
      
      <Link
        href={`/admin/campaigns/${campaign.id}/edit`}
        className="p-2 hover:bg-slate-700 rounded transition-colors"
        title="Bearbeiten"
      >
        <Edit className="w-4 h-4 text-blue-400" />
      </Link>

      {campaign.status === 'active' && (
        <button
          onClick={() => handleStatusChange('paused')}
          disabled={loading === 'paused'}
          className="p-2 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          title="Pausieren"
        >
          {loading === 'paused' ? (
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          ) : (
            <Pause className="w-4 h-4 text-yellow-400" />
          )}
        </button>
      )}

      {campaign.status === 'paused' && (
        <button
          onClick={() => handleStatusChange('active')}
          disabled={loading === 'active'}
          className="p-2 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          title="Aktivieren"
        >
          {loading === 'active' ? (
            <Loader2 className="w-4 h-4 animate-spin text-green-400" />
          ) : (
            <Play className="w-4 h-4 text-green-400" />
          )}
        </button>
      )}

      {campaign.status !== 'cancelled' && (
        <button
          onClick={() => handleStatusChange('cancelled')}
          disabled={loading === 'cancelled'}
          className="p-2 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          title="Abbrechen"
        >
          {loading === 'cancelled' ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading === 'delete'}
        className="p-2 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
        title="Löschen"
      >
        {loading === 'delete' ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
        ) : (
          <Trash2 className="w-4 h-4 text-red-400" />
        )}
      </button>
    </div>
  )
}
