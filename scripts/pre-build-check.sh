#!/bin/bash

# Pre-build check script for Expo/EAS
# Run this before deploying to catch errors early

set -e  # Exit on error

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Change to project root (one level up from scripts/)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🔍 Running pre-build checks..."
echo "📁 Working directory: $PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# TypeScript check
echo -e "\n${GREEN}✓${NC} Running TypeScript type check..."
if npm run typecheck; then
    echo -e "${GREEN}✓${NC} TypeScript check passed"
else
    echo -e "${RED}✗${NC} TypeScript check failed"
    exit 1
fi

# Lint check
echo -e "\n${GREEN}✓${NC} Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✓${NC} Lint check passed"
else
    echo -e "${YELLOW}⚠️  Lint check found issues (non-blocking)${NC}"
fi

# Expo Doctor
echo -e "\n${GREEN}✓${NC} Running Expo Doctor..."
if npx expo-doctor 2>&1 | grep -q "checks passed"; then
    echo -e "${GREEN}✓${NC} Expo Doctor check passed"
else
    echo -e "${YELLOW}⚠️  Expo Doctor found some issues (check output above)${NC}"
    echo -e "${YELLOW}   Run 'npx expo install --check' to fix dependency versions${NC}"
fi

# Check for common issues
echo -e "\n${GREEN}✓${NC} Checking for common issues..."

# Check if AsyncStorage is installed
if ! grep -q "@react-native-async-storage/async-storage" "$PROJECT_ROOT/package.json"; then
    echo -e "${RED}✗${NC} AsyncStorage not found in package.json"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI not installed. Install with: npm install -g eas-cli${NC}"
fi

echo -e "\n${GREEN}✅ All pre-build checks completed!${NC}"
echo -e "${GREEN}Ready to build with: eas build --platform <ios|android|all>${NC}"

