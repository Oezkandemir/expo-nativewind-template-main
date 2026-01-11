#!/bin/bash

# Script zum Beheben des Android Install-Fehlers
# Fehler: INSTALL_FAILED_UPDATE_INCOMPATIBLE - Signaturen stimmen nicht überein

echo "🔧 Android Install-Fehler beheben"
echo "=================================="
echo ""

# Prüfe ob Emulator/Gerät verbunden ist
echo "📱 Prüfe verbundene Geräte..."
adb devices

echo ""
echo "🗑️  Deinstalliere alte App-Version..."
adb uninstall com.exponativewindtemplate.app

if [ $? -eq 0 ]; then
    echo "✅ Alte App erfolgreich deinstalliert"
else
    echo "⚠️  App konnte nicht deinstalliert werden (möglicherweise nicht installiert)"
fi

echo ""
echo "🧹 Bereinige Build-Cache..."
cd android
./gradlew clean
cd ..

echo ""
echo "✅ Fertig! Du kannst jetzt die App neu installieren:"
echo "   npx expo run:android"
echo ""
