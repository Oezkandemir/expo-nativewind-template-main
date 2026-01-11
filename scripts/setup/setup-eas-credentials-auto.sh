#!/bin/bash

# Automatisches Setup von APNs Credentials mit EAS Access Token
# Dieses Script verwendet den bereitgestellten Access Token

set -e

EAS_TOKEN="KF6oD4icHCiNsWUJzGGQiSxKW1vIVBcST_5ISN5d"

echo "🔐 EAS Credentials Setup mit Access Token"
echo "=========================================="
echo ""

# Setze den Access Token
export EXPO_TOKEN="$EAS_TOKEN"
export EAS_TOKEN="$EAS_TOKEN"

# Prüfe ob EAS CLI installiert ist
if ! command -v eas &> /dev/null; then
    echo "📦 EAS CLI wird installiert..."
    npm install -g eas-cli || {
        echo "❌ Fehler beim Installieren von EAS CLI"
        echo "   Bitte manuell installieren: npm install -g eas-cli"
        exit 1
    }
fi

echo "✅ EAS Access Token gesetzt: ${EAS_TOKEN:0:20}..."
echo ""

# Authentifiziere mit dem Token
echo "🔑 Authentifiziere mit EAS..."
eas whoami --non-interactive 2>/dev/null || {
    echo "⚠️  Automatische Authentifizierung..."
    # Versuche mit Token zu authentifizieren
    echo "$EAS_TOKEN" | eas login --non-interactive 2>/dev/null || {
        echo "ℹ️  Bitte authentifiziere dich manuell:"
        echo "   export EXPO_TOKEN=\"$EAS_TOKEN\""
        echo "   eas whoami"
        echo ""
        read -p "Drücke Enter, wenn du bereit bist, fortzufahren..."
    }
}

echo ""
echo "📱 Setup von APNs Credentials für iOS..."
echo ""
echo "⚠️  WICHTIG: Wähle in den folgenden Prompts:"
echo "  1. Platform: iOS (drücke 'i')"
echo "  2. Build Profile: production (drücke 'p') ODER preview (für Tests auf echten Geräten)"
echo "     ⚠️  NICHT 'development' wählen - das funktioniert nicht für Push Notifications!"
echo "  3. Action: Push Notifications: Set up"
echo "  4. Option: Generate new APNs Key (empfohlen) - EAS generiert dann automatisch alles"
echo ""

# Starte interaktives Credentials Setup
# Der Token ist bereits gesetzt, also sollte EAS ihn verwenden
eas credentials

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📦 Nächste Schritte:"
echo ""
echo "1. Erstelle einen neuen Build:"
echo "   cd /Users/dmr/Desktop/expo-nativewind-template-main"
echo "   eas build --platform ios --profile production"
echo ""
echo "2. Oder für Preview (Test auf echten Geräten ohne App Store):"
echo "   eas build --platform ios --profile preview"
echo ""
echo "3. Nach dem Build:"
echo "   - Installiere den Build auf deinem Gerät"
echo "   - Öffne die App und melde dich an"
echo "   - Aktiviere Benachrichtigungen"
echo "   - Teste Push-Benachrichtigungen über /admin/notifications"
echo ""
echo "🎉 Push-Benachrichtigungen sollten jetzt funktionieren!"
