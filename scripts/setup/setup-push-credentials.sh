#!/bin/bash

# Script zum Einrichten von APNs Credentials für iOS Push-Benachrichtigungen

echo "🚀 APNs Credentials Setup für iOS Push-Benachrichtigungen"
echo "=========================================================="
echo ""
echo "Dieses Script führt dich durch die Einrichtung der APNs Credentials."
echo ""

# Prüfe ob EAS CLI installiert ist
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI ist nicht installiert."
    echo "Installiere es mit: npm install -g eas-cli"
    exit 1
fi

echo "✅ EAS CLI gefunden: $(eas --version)"
echo ""

# Prüfe ob eingeloggt
echo "Prüfe Login-Status..."
if eas whoami &> /dev/null; then
    USER=$(eas whoami)
    echo "✅ Eingeloggt als: $USER"
else
    echo "❌ Nicht eingeloggt. Bitte einloggen mit: eas login"
    exit 1
fi

echo ""
echo "📱 Starte Credentials Setup..."
echo ""
echo "Bitte folge diesen Schritten:"
echo ""
echo "1. Wähle: iOS"
echo "2. Wähle: production (oder development für Tests)"
echo "3. Wähle: Push Notifications: Set up"
echo "4. Wähle: Generate new APNs Key (empfohlen)"
echo ""
echo "EAS wird dann automatisch die Credentials generieren und hochladen."
echo ""
read -p "Drücke Enter um fortzufahren..."

# Starte interaktiven Credentials-Befehl
eas credentials

echo ""
echo "✅ Credentials Setup abgeschlossen!"
echo ""
echo "⚠️  WICHTIG: Du musst jetzt einen neuen Build erstellen:"
echo ""
echo "   eas build --platform ios --profile production"
echo ""
echo "Nach dem Build sollten Push-Benachrichtigungen funktionieren!"
