#!/bin/bash

# Script to set up iOS development credentials for EAS builds
# This fixes the "Failed to read entitlements" error

set -e

echo "🔧 Setting up iOS Development Credentials for EAS Builds"
echo "=================================================="
echo ""
echo "This script will help you set up iOS credentials for development builds."
echo "You'll need to interact with the EAS CLI prompts."
echo ""
echo "⚠️  IMPORTANT: You need an Apple Developer account for this."
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed."
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check if logged in
echo "Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS."
    echo "Please run: eas login"
    exit 1
fi

echo "✅ Logged in to EAS"
echo ""

echo "📋 Instructions:"
echo "----------------"
echo "1. When prompted, select: iOS (press 'i')"
echo "2. Select build profile: development (press 'd')"
echo "3. Choose: 'Set up credentials' or 'Configure credentials'"
echo "4. Choose: 'Automatic' (let EAS handle everything)"
echo ""
echo "EAS will automatically:"
echo "  ✅ Create a provisioning profile with push notification entitlements"
echo "  ✅ Set up the distribution certificate"
echo "  ✅ Configure all required capabilities"
echo ""
read -p "Press Enter to continue..."

# Run credentials setup
echo ""
echo "🚀 Starting credentials setup..."
eas credentials -p ios

echo ""
echo "✅ Credentials setup complete!"
echo ""
echo "Next steps:"
echo "1. Retry your build:"
echo "   eas build --platform ios --profile development --non-interactive"
echo ""
echo "2. The build should now succeed without the entitlements error."
