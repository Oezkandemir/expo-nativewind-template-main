#!/bin/bash

# Script zum Beheben des Android Keystore Signatur-Fehlers
# Dieses Script führt dich durch den Prozess, den korrekten Keystore zu EAS hochzuladen

set -e

REQUIRED_SHA1="AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"
CURRENT_SHA1="5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25"

echo "🔐 Android Keystore Signatur-Fehler beheben"
echo "============================================"
echo ""
echo "Erforderlicher SHA1: $REQUIRED_SHA1"
echo "Aktueller SHA1:      $CURRENT_SHA1"
echo ""

# Prüfe ob EAS CLI installiert ist
if ! command -v eas &> /dev/null; then
    echo "📦 EAS CLI wird installiert..."
    npm install -g eas-cli
fi

echo "✅ EAS CLI gefunden"
echo ""

# Prüfe ob keytool verfügbar ist
if ! command -v keytool &> /dev/null; then
    echo "⚠️  Warnung: keytool nicht gefunden"
    echo "   keytool ist normalerweise Teil von Java JDK"
    echo "   Installiere Java JDK falls nötig"
    echo ""
fi

echo "📋 Schritt-für-Schritt Anleitung:"
echo ""
echo "1️⃣  Prüfe aktuelle EAS Credentials"
echo "   Führe aus: eas credentials -p android"
echo ""
read -p "Drücke Enter, wenn du die aktuellen Credentials geprüft hast..."

echo ""
echo "2️⃣  Hast du den Keystore mit dem korrekten SHA1 Fingerabdruck?"
echo ""
read -p "Hast du den korrekten Keystore? (j/n): " HAS_KEYSTORE

if [ "$HAS_KEYSTORE" = "j" ] || [ "$HAS_KEYSTORE" = "J" ] || [ "$HAS_KEYSTORE" = "y" ] || [ "$HAS_KEYSTORE" = "Y" ]; then
    echo ""
    read -p "Gib den Pfad zum Keystore ein: " KEYSTORE_PATH
    
    if [ ! -f "$KEYSTORE_PATH" ]; then
        echo "❌ Keystore nicht gefunden: $KEYSTORE_PATH"
        exit 1
    fi
    
    read -p "Gib den Key-Alias ein: " KEY_ALIAS
    
    echo ""
    echo "🔍 Prüfe SHA1 Fingerabdruck..."
    
    # Verwende das check-keystore-sha1.sh Script falls vorhanden
    if [ -f "scripts/check-keystore-sha1.sh" ]; then
        chmod +x scripts/check-keystore-sha1.sh
        scripts/check-keystore-sha1.sh "$KEYSTORE_PATH" "$KEY_ALIAS"
    else
        echo "⚠️  Prüfe manuell mit:"
        echo "   keytool -list -v -keystore \"$KEYSTORE_PATH\" -alias \"$KEY_ALIAS\""
        echo ""
        echo "Suche nach SHA1: $REQUIRED_SHA1"
    fi
    
    echo ""
    echo "3️⃣  Lade Keystore zu EAS hoch"
    echo "   Führe aus: eas credentials -p android --profile production"
    echo ""
    echo "   Wähle:"
    echo "   - Platform: Android (a)"
    echo "   - Build Profile: production (p)"
    echo "   - Action: Update credentials oder Set up new credentials"
    echo "   - Option: Upload existing keystore"
    echo ""
    read -p "Drücke Enter, wenn du den Keystore hochgeladen hast..."
    
else
    echo ""
    echo "⚠️  Du musst den korrekten Keystore finden oder erstellen."
    echo ""
    echo "Optionen:"
    echo "1. Prüfe Google Play Console → Setup → App signing"
    echo "   Dort findest du Informationen über den Upload-Key"
    echo ""
    echo "2. Falls du den Keystore verloren hast:"
    echo "   - Kontaktiere Google Play Support"
    echo "   - Oder erstelle einen neuen Upload-Key (kompliziert)"
    echo ""
    echo "3. Prüfe ob der Keystore in einem sicheren Speicher liegt"
    echo "   (1Password, LastPass, Cloud-Speicher, etc.)"
    echo ""
    exit 1
fi

echo ""
echo "4️⃣  Erstelle neuen Production Build"
echo ""
read -p "Möchtest du jetzt einen neuen Build erstellen? (j/n): " BUILD_NOW

if [ "$BUILD_NOW" = "j" ] || [ "$BUILD_NOW" = "J" ] || [ "$BUILD_NOW" = "y" ] || [ "$BUILD_NOW" = "Y" ]; then
    echo ""
    echo "🚀 Starte Build..."
    echo ""
    eas build --platform android --profile production
    echo ""
    echo "✅ Build gestartet!"
    echo "   Prüfe den Status mit: eas build:list"
else
    echo ""
    echo "📝 Erstelle später einen Build mit:"
    echo "   eas build --platform android --profile production"
fi

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "Nach dem Build:"
echo "1. Lade das App Bundle zu Google Play Console hoch"
echo "2. Prüfe ob der SHA1 Fingerabdruck jetzt korrekt ist"
echo ""
