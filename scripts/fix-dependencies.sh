#!/bin/bash

# Script to fix Expo dependency versions
# Run this after updating package.json

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🔧 Fixing Expo dependencies..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run expo install --check to fix any remaining issues
echo "🔍 Checking for dependency issues..."
npx expo install --check || echo "⚠️  Some dependencies may need manual fixing"

echo "✅ Dependency fix completed!"
echo "📋 Run 'npx expo-doctor' to verify all issues are resolved"


