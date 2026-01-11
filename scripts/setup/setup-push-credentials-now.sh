#!/bin/bash

# Script zum Einrichten von Push-Credentials während die Builds laufen

echo "🔔 Push-Credentials Setup für Remote Benachrichtigungen"
echo "========================================================"
echo ""
echo "Dieses Script richtet die APNs (iOS) und FCM (Android) Credentials ein."
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
echo "📱 iOS APNs Credentials Setup"
echo "-----------------------------"
echo ""
echo "Für iOS Push-Benachrichtigungen benötigst du APNs Credentials."
echo ""
echo "Bitte führe aus:"
echo "  eas credentials"
echo ""
echo "Dann wähle:"
echo "  1. iOS"
echo "  2. production (oder development)"
echo "  3. Push Notifications: Set up"
echo "  4. Generate new APNs Key (empfohlen)"
echo ""
read -p "Drücke Enter um iOS Credentials einzurichten..."

# Starte interaktiven Credentials-Befehl für iOS
eas credentials --platform ios

echo ""
echo "✅ iOS Credentials Setup abgeschlossen!"
echo ""

echo ""
echo "🤖 Android FCM Credentials Setup (Optional)"
echo "--------------------------------------------"
echo ""
echo "Für Android Push-Benachrichtigungen benötigst du Firebase Cloud Messaging (FCM)."
echo ""
echo "Schritte:"
echo "  1. Gehe zu https://console.firebase.google.com/"
echo "  2. Erstelle ein neues Projekt oder wähle ein existierendes"
echo "  3. Füge eine Android App hinzu (Package: com.exponativewindtemplate.app)"
echo "  4. Lade google-services.json herunter"
echo "  5. Speichere es im Projekt-Root"
echo "  6. Füge zu .gitignore hinzu: google-services.json"
echo ""
echo "Dann aktualisiere app.json:"
echo '  "android": {'
echo '    "googleServicesFile": "./google-services.json"'
echo '  }'
echo ""
read -p "Drücke Enter wenn du Firebase Setup abgeschlossen hast (oder Skip mit Ctrl+C)..."

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "⚠️  WICHTIG: Nach dem Setup der Credentials:"
echo ""
echo "  1. Erstelle einen neuen Production Build:"
echo "     eas build --platform ios --profile production"
echo "     eas build --platform android --profile production"
echo ""
echo "  2. Installiere den neuen Build auf deinem Gerät"
echo ""
echo "  3. Teste Push-Benachrichtigungen über /admin/notifications"
echo ""
echo "📚 Weitere Infos: Siehe APNS_CREDENTIALS_SETUP.md"
