#!/bin/bash

# Script zum Prüfen des SHA1 Fingerabdrucks eines Keystores
# Verwendung: ./check-keystore-sha1.sh /path/to/keystore.jks alias

set -e

if [ $# -lt 2 ]; then
    echo "❌ Fehler: Keystore-Pfad und Alias erforderlich"
    echo ""
    echo "Verwendung:"
    echo "  ./check-keystore-sha1.sh /path/to/keystore.jks alias"
    echo ""
    echo "Beispiel:"
    echo "  ./check-keystore-sha1.sh android/app/release.keystore spotx-release"
    exit 1
fi

KEYSTORE_PATH="$1"
KEY_ALIAS="$2"

# Erforderlicher SHA1 Fingerabdruck
REQUIRED_SHA1="AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"

echo "🔍 Prüfe Keystore SHA1 Fingerabdruck"
echo "===================================="
echo ""
echo "Keystore: $KEYSTORE_PATH"
echo "Alias: $KEY_ALIAS"
echo ""

# Prüfe ob Keystore existiert
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Fehler: Keystore nicht gefunden: $KEYSTORE_PATH"
    exit 1
fi

# Frage nach Passwort
read -sp "Keystore-Passwort: " KEYSTORE_PASSWORD
echo ""

# Extrahiere SHA1 Fingerabdruck
SHA1_OUTPUT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Lesen des Keystores"
    echo "   Prüfe Passwort und Alias"
    exit 1
fi

# Extrahiere SHA1 aus der Ausgabe
ACTUAL_SHA1=$(echo "$SHA1_OUTPUT" | grep -i "SHA1:" | head -1 | sed 's/.*SHA1: *//' | tr -d ' ')

if [ -z "$ACTUAL_SHA1" ]; then
    echo "❌ Konnte SHA1 Fingerabdruck nicht finden"
    echo ""
    echo "Vollständige Ausgabe:"
    echo "$SHA1_OUTPUT"
    exit 1
fi

echo "✅ SHA1 Fingerabdruck gefunden:"
echo "   $ACTUAL_SHA1"
echo ""

# Normalisiere für Vergleich (entferne Doppelpunkte und konvertiere zu Großbuchstaben)
NORMALIZED_ACTUAL=$(echo "$ACTUAL_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ':')
NORMALIZED_REQUIRED=$(echo "$REQUIRED_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ':')

if [ "$NORMALIZED_ACTUAL" = "$NORMALIZED_REQUIRED" ]; then
    echo "✅ ✅ ✅ KORREKTER KEYSTORE!"
    echo "   Der SHA1 Fingerabdruck stimmt mit dem erforderlichen überein."
    echo ""
    echo "Nächste Schritte:"
    echo "  1. Lade diesen Keystore zu EAS hoch:"
    echo "     eas credentials -p android --profile production"
    echo "  2. Erstelle einen neuen Build:"
    echo "     eas build --platform android --profile production"
    exit 0
else
    echo "❌ FALSCHER KEYSTORE!"
    echo "   Der SHA1 Fingerabdruck stimmt NICHT überein."
    echo ""
    echo "Erforderlich:"
    echo "   $REQUIRED_SHA1"
    echo ""
    echo "Aktuell:"
    echo "   $ACTUAL_SHA1"
    echo ""
    echo "Du musst den Keystore mit dem korrekten SHA1 Fingerabdruck finden oder hochladen."
    exit 1
fi
