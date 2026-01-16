#!/bin/bash

# iOS Configuration Validation Script
# Validates iOS app configuration before EAS build to catch errors early

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🔍 Validating iOS Configuration..."
echo "📁 Working directory: $PROJECT_ROOT"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Function to check and report
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# 1. Check app.json exists
echo "📋 Checking app.json..."
if [ ! -f "app.json" ]; then
    echo -e "${RED}✗${NC} app.json not found!"
    exit 1
fi
check "app.json exists"

# 2. Check CFBundleIconName in app.json
echo ""
echo "🔍 Checking CFBundleIconName in app.json..."
if grep -q '"CFBundleIconName": "AppIcon"' app.json; then
    check "CFBundleIconName is set in app.json"
else
    echo -e "${RED}✗${NC} CFBundleIconName missing in app.json ios.infoPlist"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check icon file exists and is 1024x1024
echo ""
echo "🖼️  Checking icon file..."
# Try to get icon from ios.icon first, then fall back to expo.icon
ICON_PATH=$(node -e "const config = require('./app.json'); const path = config.expo.ios?.icon || config.expo.icon || ''; console.log(path.replace(/^\.\//, ''));" | tr -d '"')
if [ -z "$ICON_PATH" ] || [ ! -f "$ICON_PATH" ]; then
    # Fallback: try simple grep for first icon entry
    ICON_PATH=$(grep '"icon":' app.json | head -1 | grep -o '".*"' | tr -d '"' | sed 's|^\./||')
fi
if [ -f "$ICON_PATH" ]; then
    check "Icon file exists: $ICON_PATH"
    
    # Check icon dimensions
    ICON_DIMS=$(sips -g pixelWidth -g pixelHeight "$ICON_PATH" 2>/dev/null | grep -E "pixelWidth|pixelHeight" | awk '{print $2}')
    WIDTH=$(echo "$ICON_DIMS" | head -1)
    HEIGHT=$(echo "$ICON_DIMS" | tail -1)
    
    if [ "$WIDTH" = "1024" ] && [ "$HEIGHT" = "1024" ]; then
        check "Icon is 1024x1024 pixels"
    else
        echo -e "${RED}✗${NC} Icon is ${WIDTH}x${HEIGHT}, should be 1024x1024"
        echo -e "${YELLOW}   Fix with: sips -z 1024 1024 $ICON_PATH${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Icon file not found: $ICON_PATH"
    ERRORS=$((ERRORS + 1))
fi

# 4. Run expo prebuild to generate iOS project
echo ""
echo "🔨 Running expo prebuild (clean) to generate iOS project..."
if [ -d "ios" ]; then
    echo -e "${YELLOW}⚠️  ios/ directory exists, cleaning...${NC}"
    rm -rf ios
fi

npx expo prebuild --platform ios --clean 2>&1 | tee /tmp/expo-prebuild.log
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    check "expo prebuild completed successfully"
else
    echo -e "${RED}✗${NC} expo prebuild failed"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check Info.plist has CFBundleIconName
echo ""
echo "📱 Checking generated Info.plist..."
INFO_PLIST="ios/spotx/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    check "Info.plist exists"
    
    if grep -q "<key>CFBundleIconName</key>" "$INFO_PLIST" && grep -q "<string>AppIcon</string>" "$INFO_PLIST"; then
        check "CFBundleIconName is set in Info.plist"
    else
        echo -e "${RED}✗${NC} CFBundleIconName missing in Info.plist"
        echo -e "${YELLOW}   Check: $INFO_PLIST${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Info.plist not found at $INFO_PLIST"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check AppIcon asset catalog
echo ""
echo "🎨 Checking AppIcon asset catalog..."
ASSET_CATALOG="ios/spotx/Images.xcassets/AppIcon.appiconset/Contents.json"
if [ -f "$ASSET_CATALOG" ]; then
    check "AppIcon asset catalog exists"
    
    # Check if it has required icon sizes
    REQUIRED_SIZES=("120x120" "152x152" "167x167" "1024x1024")
    for size in "${REQUIRED_SIZES[@]}"; do
        if grep -q "\"size\": \"$size\"" "$ASSET_CATALOG"; then
            echo -e "  ${GREEN}✓${NC} Icon size $size configured"
        else
            echo -e "  ${YELLOW}⚠️${NC} Icon size $size not found in asset catalog"
        fi
    done
else
    echo -e "${RED}✗${NC} AppIcon asset catalog not found"
    ERRORS=$((ERRORS + 1))
fi

# 7. Check build number
echo ""
echo "🔢 Checking build number..."
BUILD_NUMBER=$(grep -A 1 '"buildNumber":' app.json | grep -o '[0-9]*' | head -1)
if [ -n "$BUILD_NUMBER" ]; then
    echo -e "${GREEN}✓${NC} Build number in app.json: $BUILD_NUMBER"
else
    echo -e "${YELLOW}⚠️${NC} Build number not found in app.json"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All iOS configuration checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Build with: eas build --platform ios --profile production"
    echo "  2. Submit with: eas submit --platform ios --latest"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Always use '--latest' when submitting to ensure you submit the newest build!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) in iOS configuration!${NC}"
    echo ""
    echo "Please fix the errors above before building."
    exit 1
fi
