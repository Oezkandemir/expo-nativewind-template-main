'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

interface Merchant {
  id: string
  company_name: string
  business_email: string
  status: 'pending' | 'approved' | 'suspended'
}

export default function MerchantActions({ merchant }: { merchant: Merchant }) {
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(merchant.status)

  const updateStatus = async (newStatus: 'pending' | 'approved' | 'suspended') => {
    if (currentStatus === newStatus) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/merchants/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: merchant.id,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Aktualisieren')
      }

      setCurrentStatus(newStatus)
      
      // Reload page to show updated status
      window.location.reload()
    } catch (error: any) {
      alert(`Fehler: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {currentStatus !== 'approved' && (
        <button
          onClick={() => updateStatus('approved')}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          title="Genehmigen"
        >
          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Genehmigen</span>
        </button>
      )}
      
      {currentStatus !== 'suspended' && (
        <button
          onClick={() => updateStatus('suspended')}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          title="Sperren"
        >
          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Sperren</span>
        </button>
      )}
      
      {currentStatus !== 'pending' && (
        <button
          onClick={() => updateStatus('pending')}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          title="Auf Ausstehend setzen"
        >
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Zurückstellen</span>
        </button>
      )}
    </div>
  )
}
