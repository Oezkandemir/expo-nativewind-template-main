#!/bin/bash

# Script zum manuellen Hochladen der AAB-Datei zur Google Play Console
# 
# Voraussetzungen:
# 1. Google Play Console API Service Account Key (JSON-Datei)
# 2. AAB-Datei heruntergeladen von EAS Build
#
# Verwendung:
# ./scripts/upload-to-play-console.sh /path/to/app.aab /path/to/service-account-key.json

set -e

AAB_FILE=$1
SERVICE_ACCOUNT_KEY=$2

if [ -z "$AAB_FILE" ] || [ -z "$SERVICE_ACCOUNT_KEY" ]; then
    echo "Usage: $0 <path-to-aab-file> <path-to-service-account-key.json>"
    echo ""
    echo "Beispiel:"
    echo "  $0 ./app-release.aab ./google-play-service-account.json"
    exit 1
fi

if [ ! -f "$AAB_FILE" ]; then
    echo "Fehler: AAB-Datei nicht gefunden: $AAB_FILE"
    exit 1
fi

if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    echo "Fehler: Service Account Key nicht gefunden: $SERVICE_ACCOUNT_KEY"
    exit 1
fi

# Prüfe ob fastlane installiert ist
if ! command -v fastlane &> /dev/null; then
    echo "Fastlane ist nicht installiert."
    echo "Installiere mit: gem install fastlane"
    echo ""
    echo "ODER verwende die manuelle Methode:"
    echo "1. Gehe zu: https://play.google.com/console"
    echo "2. Wähle deine App aus"
    echo "3. Gehe zu: Release > Production (oder Testing)"
    echo "4. Klicke auf 'Create new release'"
    echo "5. Lade die AAB-Datei hoch: $AAB_FILE"
    exit 1
fi

# Package Name aus app.json oder build.gradle
PACKAGE_NAME="com.exponativewindtemplate.app"

echo "📦 Lade AAB-Datei zur Play Console hoch..."
echo "   AAB: $AAB_FILE"
echo "   Package: $PACKAGE_NAME"
echo ""

# Verwende fastlane zum Hochladen
fastlane supply \
    --aab "$AAB_FILE" \
    --json_key "$SERVICE_ACCOUNT_KEY" \
    --package_name "$PACKAGE_NAME" \
    --skip_upload_metadata \
    --skip_upload_images \
    --skip_upload_screenshots

echo ""
echo "✅ AAB-Datei erfolgreich hochgeladen!"
