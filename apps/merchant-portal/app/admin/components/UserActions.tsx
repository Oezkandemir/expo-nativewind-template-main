'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name?: string | null
}

export default function UserActions({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie den User "${user.email}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
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
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-red-400 text-xs">{error}</span>
      )}
      
      <Link
        href={`/admin/users/${user.id}`}
        className="p-2 hover:bg-slate-700 rounded transition-colors"
        title="Details anzeigen"
      >
        <Edit className="w-4 h-4 text-blue-400" />
      </Link>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
        title="Löschen"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
        ) : (
          <Trash2 className="w-4 h-4 text-red-400" />
        )}
      </button>
    </div>
  )
}
