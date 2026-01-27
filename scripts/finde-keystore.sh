#!/bin/bash

# Script zum Finden von Keystores auf dem System

set -e

REQUIRED_SHA1="AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"

echo "🔍 Suche nach Keystores..."
echo "=========================="
echo ""

echo "Erforderlicher SHA1: $REQUIRED_SHA1"
echo ""

# Suche nach .keystore und .jks Dateien
echo "📁 Suche nach Keystore-Dateien..."
KEYSTORES=$(find ~ -name "*.keystore" -o -name "*.jks" 2>/dev/null | grep -v node_modules | grep -v ".git" | head -20)

if [ -z "$KEYSTORES" ]; then
    echo "❌ Keine Keystore-Dateien gefunden"
    echo ""
    echo "Mögliche Orte zum Prüfen:"
    echo "  - Passwort-Manager (1Password, LastPass)"
    echo "  - Cloud-Speicher (Dropbox, Google Drive, iCloud)"
    echo "  - Backup-Festplatten"
    echo "  - E-Mails"
    echo ""
    echo "⚠️  Falls du den Keystore nicht findest:"
    echo "  1. Kontaktiere Google Play Support"
    echo "  2. Erkläre, dass du den Upload-Key verloren hast"
    echo "  3. Frage nach Hilfe beim Erstellen eines neuen Upload-Keys"
    exit 1
fi

echo "✅ Gefundene Keystores:"
echo "$KEYSTORES" | while read -r keystore; do
    echo "  - $keystore"
done

echo ""
echo "🔍 Prüfe SHA1 Fingerabdrücke..."
echo ""

FOUND_CORRECT=false

echo "$KEYSTORES" | while read -r keystore; do
    echo "Prüfe: $keystore"
    
    # Versuche verschiedene Aliases
    ALIASES=("upload-key" "upload" "release" "key" "android" "spotx-release" "spotx")
    
    for alias in "${ALIASES[@]}"; do
        SHA1_OUTPUT=$(keytool -list -v -keystore "$keystore" -alias "$alias" 2>&1 | grep -i "SHA1:" | head -1 | sed 's/.*SHA1: *//' | tr -d ' ')
        
        if [ -n "$SHA1_OUTPUT" ]; then
            # Normalisiere für Vergleich
            NORMALIZED_FOUND=$(echo "$SHA1_OUTPUT" | tr '[:lower:]' '[:upper:]' | tr -d ':')
            NORMALIZED_REQUIRED=$(echo "$REQUIRED_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ':')
            
            if [ "$NORMALIZED_FOUND" = "$NORMALIZED_REQUIRED" ]; then
                echo ""
                echo "✅ ✅ ✅ KORREKTER KEYSTORE GEFUNDEN!"
                echo "   Keystore: $keystore"
                echo "   Alias: $alias"
                echo "   SHA1: $SHA1_OUTPUT"
                echo ""
                echo "Nächste Schritte:"
                echo "  1. Lade diesen Keystore zu EAS hoch:"
                echo "     eas credentials -p android --profile production"
                echo "  2. Erstelle einen neuen Build:"
                echo "     eas build --platform android --profile production"
                FOUND_CORRECT=true
                break
            else
                echo "   Alias '$alias': SHA1 = $SHA1_OUTPUT (nicht korrekt)"
            fi
        fi
    done
    
    echo ""
done

if [ "$FOUND_CORRECT" = false ]; then
    echo "❌ Kein Keystore mit dem korrekten SHA1 gefunden"
    echo ""
    echo "⚠️  Du musst:"
    echo "  1. Weitere Orte prüfen (Cloud, Backups, etc.)"
    echo "  2. ODER Google Play Support kontaktieren"
    echo ""
    echo "Google Play Support kann dir helfen:"
    echo "  - Einen neuen Upload-Key zu registrieren"
    echo "  - Oder den alten Key wiederherzustellen"
fi
