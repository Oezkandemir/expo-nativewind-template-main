import Link from 'next/link'
import { ArrowRight, BarChart3, Megaphone, Shield, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur-sm bg-slate-900/50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">SpotX</span>
            <span className="text-sm text-purple-400">Merchant Portal</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/admin-login"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
            <Link 
              href="/register"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Registrieren
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Erreichen Sie Ihre Zielgruppe
          <br />
          <span className="text-purple-400">mit SpotX</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Erstellen und verwalten Sie Werbekampagnen, die echte Nutzer erreichen. 
          Transparente Preise, detaillierte Analysen und maximale Reichweite.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/register"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
          >
            Jetzt starten
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            Anmelden
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Megaphone className="w-8 h-8 text-purple-400" />}
            title="Einfache Kampagnen-Erstellung"
            description="Erstellen Sie in Minuten Ihre erste Werbekampagne mit unserem intuitiven Editor."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
            title="Detaillierte Analysen"
            description="Verfolgen Sie Views, Conversion-Raten und ROI in Echtzeit."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-purple-400" />}
            title="Zielgruppen-Targeting"
            description="Erreichen Sie genau die Nutzer, die Sie suchen - nach Interessen, Alter und mehr."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title="100% Transparent"
            description="Volle Kostenkontrolle und detaillierte Reportings für jede Kampagne."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit, Ihre erste Kampagne zu starten?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Registrieren Sie sich kostenlos und erstellen Sie Ihre erste Kampagne in wenigen Minuten.
          </p>
          <Link 
            href="/register"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
          >
            Kostenlos registrieren
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2026 SpotX Merchant Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
