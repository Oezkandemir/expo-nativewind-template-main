#!/bin/bash

# Vercel Deployment Script mit Umgebungsvariablen
# Usage: ./deploy.sh [production|preview]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="apps/merchant-portal"

echo "🚀 Deploying Merchant Portal to Vercel ($ENVIRONMENT)..."
echo ""

# Prüfe ob Vercel CLI installiert ist
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI ist nicht installiert!"
    echo "Installiere mit: npm install -g vercel"
    exit 1
fi

# Prüfe ob wir im Root-Verzeichnis sind
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Bitte führe dieses Script vom Root-Verzeichnis aus!"
    exit 1
fi

# Prüfe ob Projekt mit Vercel verlinkt ist
cd "$PROJECT_DIR"
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Projekt ist nicht mit Vercel verlinkt..."
    echo "Bitte führe zuerst aus: vercel link"
    echo ""
    echo "Oder führe dieses Script erneut aus, nachdem du verlinkt hast."
    exit 1
fi

# Lade Umgebungsvariablen aus .env.local falls vorhanden
if [ -f "$PROJECT_DIR/.env.local" ]; then
    echo "📝 Lade Umgebungsvariablen aus .env.local..."
    export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
fi

# Setze Standard-Werte falls nicht gesetzt
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://mxdpiqnkowcxbujgrfom.supabase.co"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-""}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-""}

# Prüfe ob notwendige Variablen gesetzt sind
if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY ist nicht gesetzt!"
    echo "Bitte setze die Umgebungsvariablen:"
    echo "  export NEXT_PUBLIC_SUPABASE_ANON_KEY='dein-anon-key'"
    echo "  export SUPABASE_SERVICE_ROLE_KEY='dein-service-role-key' (optional)"
    exit 1
fi

echo "✅ Umgebungsvariablen gefunden"
echo ""

# Setze Umgebungsvariablen in Vercel
echo "🔧 Setze Umgebungsvariablen in Vercel..."

cd "$PROJECT_DIR"

# Setze Umgebungsvariablen für Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL" 2>/dev/null || \
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes 2>/dev/null && \
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY" 2>/dev/null || \
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>/dev/null && \
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null || \
    vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes 2>/dev/null && \
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
fi

# Setze auch für Preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$NEXT_PUBLIC_SUPABASE_URL" 2>/dev/null || \
vercel env rm NEXT_PUBLIC_SUPABASE_URL preview --yes 2>/dev/null && \
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$NEXT_PUBLIC_SUPABASE_URL"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY" 2>/dev/null || \
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview --yes 2>/dev/null && \
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null || \
    vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes 2>/dev/null && \
    vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "🚀 Deploye zu Vercel ($ENVIRONMENT)..."

# Deploye zu Vercel
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo "1. Prüfe die Deployment-URL in der Vercel-Konsole"
echo "2. Setze NEXT_PUBLIC_BASE_URL auf deine Production-URL"
echo "3. Teste die Anwendung"
