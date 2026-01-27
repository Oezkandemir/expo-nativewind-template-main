#!/bin/bash

# Script zum Verifizieren, welcher Upload-Key wirklich benötigt wird
# Dieses Script hilft dir, die Situation zu klären

set -e

echo "🔍 Android Upload-Key Verifizierung"
echo "===================================="
echo ""

echo "📋 WICHTIG: Es gibt zwei verschiedene Keys!"
echo ""
echo "1. Upload Key (den DU verwendest):"
echo "   - Mit diesem signierst du dein App Bundle"
echo "   - Muss zu EAS hochgeladen werden"
echo ""
echo "2. App Signing Key (von Google verwaltet):"
echo "   - Wird von Google Play verwendet"
echo "   - Wird automatisch verwaltet"
echo ""

echo "🔍 Schritt 1: Prüfe Google Play Console"
echo "========================================"
echo ""
echo "Bitte öffne: https://play.google.com/console"
echo ""
echo "Dann:"
echo "1. Wähle deine App aus"
echo "2. Gehe zu: Setup → App signing"
echo "3. Suche nach 'Upload key certificate'"
echo "4. Notiere den SHA1 Fingerabdruck"
echo ""
read -p "Gib den SHA1 Fingerabdruck aus Google Play Console ein (oder drücke Enter zum Überspringen): " GOOGLE_PLAY_SHA1

if [ -n "$GOOGLE_PLAY_SHA1" ]; then
    echo ""
    echo "✅ Google Play erwartet: $GOOGLE_PLAY_SHA1"
    echo ""
    
    # Normalisiere für Vergleich
    NORMALIZED_GOOGLE=$(echo "$GOOGLE_PLAY_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ' ' | tr -d ':')
    NORMALIZED_REQUIRED=$(echo "AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24" | tr '[:lower:]' '[:upper:]' | tr -d ' ' | tr -d ':')
    
    if [ "$NORMALIZED_GOOGLE" = "$NORMALIZED_REQUIRED" ]; then
        echo "✅ ✅ ✅ ÜBEREINSTIMMUNG!"
        echo "   Der SHA1 aus Google Play stimmt mit dem erforderlichen überein."
        echo "   Du musst den Keystore mit diesem SHA1 zu EAS hochladen."
    else
        echo "⚠️  UNTERSCHIEDLICH!"
        echo "   Google Play erwartet: $GOOGLE_PLAY_SHA1"
        echo "   Fehlermeldung sagt:   AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24"
        echo ""
        echo "   → Verwende den SHA1 aus Google Play Console!"
    fi
else
    echo ""
    echo "⚠️  Bitte prüfe Google Play Console manuell"
    echo "   Der SHA1 dort ist der, den du wirklich brauchst!"
fi

echo ""
echo "🔍 Schritt 2: Prüfe EAS Credentials"
echo "===================================="
echo ""

if command -v eas &> /dev/null; then
    echo "Prüfe aktuelle EAS Credentials..."
    echo ""
    echo "Führe aus: eas credentials -p android --profile production"
    echo ""
    echo "Dann wähle 'View credentials' und prüfe den SHA1 Fingerabdruck"
    echo ""
    read -p "Gib den SHA1 aus EAS ein (oder drücke Enter zum Überspringen): " EAS_SHA1
    
    if [ -n "$EAS_SHA1" ] && [ -n "$GOOGLE_PLAY_SHA1" ]; then
        echo ""
        NORMALIZED_EAS=$(echo "$EAS_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ' ' | tr -d ':')
        NORMALIZED_GOOGLE=$(echo "$GOOGLE_PLAY_SHA1" | tr '[:lower:]' '[:upper:]' | tr -d ' ' | tr -d ':')
        
        if [ "$NORMALIZED_EAS" = "$NORMALIZED_GOOGLE" ]; then
            echo "✅ ✅ ✅ EAS und Google Play stimmen überein!"
            echo "   Der richtige Key ist bereits in EAS hochgeladen."
            echo ""
            echo "   → Erstelle einfach einen neuen Build:"
            echo "     eas build --platform android --profile production"
        else
            echo "❌ UNTERSCHIEDLICH!"
            echo "   EAS verwendet:      $EAS_SHA1"
            echo "   Google Play will:  $GOOGLE_PLAY_SHA1"
            echo ""
            echo "   → Du musst den Keystore mit SHA1 $GOOGLE_PLAY_SHA1 zu EAS hochladen!"
        fi
    fi
else
    echo "⚠️  EAS CLI nicht gefunden"
    echo "   Installiere mit: npm install -g eas-cli"
fi

echo ""
echo "🔍 Schritt 3: Hast du den Keystore?"
echo "==================================="
echo ""

read -p "Hast du einen Keystore mit dem korrekten SHA1? (j/n): " HAS_KEYSTORE

if [ "$HAS_KEYSTORE" = "j" ] || [ "$HAS_KEYSTORE" = "J" ] || [ "$HAS_KEYSTORE" = "y" ] || [ "$HAS_KEYSTORE" = "Y" ]; then
    echo ""
    read -p "Gib den Pfad zum Keystore ein: " KEYSTORE_PATH
    
    if [ -f "$KEYSTORE_PATH" ]; then
        read -p "Gib den Key-Alias ein: " KEY_ALIAS
        
        echo ""
        echo "🔍 Prüfe SHA1 Fingerabdruck..."
        
        if [ -f "scripts/check-keystore-sha1.sh" ]; then
            chmod +x scripts/check-keystore-sha1.sh
            scripts/check-keystore-sha1.sh "$KEYSTORE_PATH" "$KEY_ALIAS"
        else
            echo "Prüfe manuell mit:"
            echo "keytool -list -v -keystore \"$KEYSTORE_PATH\" -alias \"$KEY_ALIAS\""
        fi
    else
        echo "❌ Keystore nicht gefunden: $KEYSTORE_PATH"
    fi
else
    echo ""
    echo "⚠️  Du musst den Keystore finden oder einen neuen erstellen"
    echo ""
    echo "Optionen:"
    echo "1. Prüfe sichere Speicher (1Password, LastPass, Cloud, etc.)"
    echo "2. Prüfe Backup-Festplatten"
    echo "3. Falls wirklich verloren: Kontaktiere Google Play Support"
fi

echo ""
echo "📝 Zusammenfassung"
echo "=================="
echo ""
echo "Nächste Schritte:"
echo "1. Prüfe Google Play Console → Setup → App signing"
echo "2. Finde den Keystore mit dem korrekten SHA1"
echo "3. Lade den Keystore zu EAS hoch:"
echo "   eas credentials -p android --profile production"
echo "4. Erstelle neuen Build:"
echo "   eas build --platform android --profile production"
echo ""
