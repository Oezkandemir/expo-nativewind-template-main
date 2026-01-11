import { requireAdmin } from '@/lib/auth/admin-helpers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/admin-login')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  )
}
