#!/bin/bash
# Wrapper Script zum Senden von Push-Benachrichtigungen
# Verwendet das merchant-portal Verzeichnis, wo expo-server-sdk installiert ist

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MERCHANT_PORTAL_DIR="$ROOT_DIR/apps/merchant-portal"

# Wechsle ins merchant-portal Verzeichnis
cd "$MERCHANT_PORTAL_DIR" || exit 1

# Prüfe ob expo-server-sdk installiert ist
if [ ! -d "node_modules/expo-server-sdk" ]; then
  echo "❌ expo-server-sdk ist nicht installiert!"
  echo ""
  echo "Installiere es mit:"
  echo "  cd apps/merchant-portal"
  echo "  npm install expo-server-sdk"
  exit 1
fi

# Setze NODE_PATH damit require() das Modul findet
export NODE_PATH="$MERCHANT_PORTAL_DIR/node_modules:$NODE_PATH"

# Wechsle zurück ins Root-Verzeichnis für das Script (damit relative Pfade funktionieren)
cd "$ROOT_DIR"

# Führe das TypeScript Script aus (mit absolutem Pfad)
npx tsx "$ROOT_DIR/scripts/send-test-push.ts" "$@"
