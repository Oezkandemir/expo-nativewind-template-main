#!/bin/bash

# Quick Fix: Setze EXPO_PUBLIC_API_URL automatisch
# Verwendung: ./quick-fix-env.sh

set -e

echo "🔧 EXPO_PUBLIC_API_URL Quick Fix"
echo "=================================="
echo ""

# Finde die Netzwerk-IP aus Expo (falls verfügbar)
# Standard: 192.168.0.163 (aus den Logs)
NETWORK_IP="${1:-192.168.0.163}"
API_URL="http://${NETWORK_IP}:3000"

echo "📝 Setze EXPO_PUBLIC_API_URL auf: $API_URL"
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "📄 Erstelle .env Datei..."
    touch .env
fi

# Entferne alte EXPO_PUBLIC_API_URL Einträge
if grep -q "EXPO_PUBLIC_API_URL" .env; then
    echo "🔄 Aktualisiere bestehende EXPO_PUBLIC_API_URL..."
    # Entferne alte Einträge
    sed -i.bak '/^EXPO_PUBLIC_API_URL=/d' .env
fi

# Füge neue Variable hinzu
echo "EXPO_PUBLIC_API_URL=$API_URL" >> .env

echo "✅ EXPO_PUBLIC_API_URL gesetzt!"
echo ""
echo "📋 Aktuelle .env Einträge:"
grep EXPO_PUBLIC_API_URL .env || echo "   (nicht gefunden)"
echo ""
echo "🔄 Nächste Schritte:"
echo "   1. Stoppe Expo (Ctrl+C)"
echo "   2. Starte neu: npx expo start --clear"
echo "   3. Lade Android App neu"
echo ""
echo "✅ Fertig!"
