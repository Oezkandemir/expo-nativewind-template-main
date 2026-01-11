#!/bin/bash

# Script zum automatischen Setup von APNs Credentials mit EAS Access Token
# Verwendung: ./setup-eas-credentials.sh

set -e

EAS_TOKEN="${EAS_TOKEN:-KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d}"

echo "🔐 EAS Credentials Setup mit Access Token"
echo "=========================================="
echo ""

# Prüfe ob EAS CLI installiert ist
if ! command -v eas &> /dev/null; then
    echo "📦 EAS CLI wird installiert..."
    npm install -g eas-cli
fi

# Setze den Access Token als Umgebungsvariable
export EXPO_TOKEN="$EAS_TOKEN"
export EAS_TOKEN="$EAS_TOKEN"

echo "✅ EAS Access Token gesetzt"
echo ""

# Authentifiziere mit dem Token
echo "🔑 Authentifiziere mit EAS..."
eas whoami --non-interactive || {
    echo "⚠️  Automatische Authentifizierung fehlgeschlagen"
    echo "   Versuche manuelle Authentifizierung..."
    echo ""
    echo "Bitte führe manuell aus:"
    echo "  export EXPO_TOKEN=\"$EAS_TOKEN\""
    echo "  eas whoami"
    echo ""
    read -p "Drücke Enter, wenn du authentifiziert bist..."
}

echo ""
echo "📱 Setup von APNs Credentials für iOS..."
echo ""
echo "Wähle in den folgenden Prompts:"
echo "  1. Platform: iOS (i)"
echo "  2. Build Profile: production (p) oder preview (für Tests)"
echo "  3. Action: Push Notifications: Set up"
echo "  4. Option: Generate new APNs Key (empfohlen)"
echo ""

# Starte interaktives Credentials Setup
eas credentials --non-interactive || eas credentials

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📦 Nächste Schritte:"
echo "  1. Erstelle einen neuen Build:"
echo "     eas build --platform ios --profile production"
echo ""
echo "  2. Oder für Preview (Test auf echten Geräten):"
echo "     eas build --platform ios --profile preview"
echo ""
echo "  3. Nach dem Build installieren und Push-Benachrichtigungen testen"
echo ""
