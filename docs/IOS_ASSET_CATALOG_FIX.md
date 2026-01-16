# iOS Asset Catalog Compilation Fix

## Problem
Build fails with `CompileAssetCatalogVariant` error:
```
▸ CompileAssetCatalogVariant thinned ... /Images.xcassets (in target 'spotx' from project 'spotx')
▸ ** ARCHIVE FAILED **
Exit status: 65
```

## Root Cause
The asset catalog (`Images.xcassets/AppIcon.appiconset/Contents.json`) references icon files that don't exist or are invalid when Xcode tries to compile the asset catalog during archive.

## Solution Implemented

### 1. Enhanced Plugin Validation
Updated `plugins/withIosIcons.js` to:
- ✅ Validate icon file exists before updating Contents.json
- ✅ Check icon file is not empty
- ✅ Provide clear error messages if icon is missing
- ✅ Attempt to find icon in alternative locations

### 2. Plugin Execution Order
The plugin runs **last** in the plugin list (after Expo's icon generation plugins) to ensure:
- Expo generates the icon files first
- Our plugin validates and updates the asset catalog after

### 3. Error Detection
The plugin now fails fast during prebuild if:
- Icon file doesn't exist
- Icon file is empty or corrupted
- Asset catalog structure is invalid

## Verification

### Before Building
Run the validation script:
```bash
npm run validate:ios
```

This checks:
- ✅ Icon file exists and is valid
- ✅ Asset catalog has all required sizes
- ✅ CFBundleIconName is set in Info.plist

### During Build
The plugin will log:
- `[withIosIcons] ✅ Icon file exists and is valid (X bytes)` - Success
- `[withIosIcons] ❌ ERROR: Icon file not found` - Will fail prebuild (fail fast)

## Troubleshooting

### Icon File Missing
If you see: `Icon file App-Icon-1024x1024@1x.png not found`

**Solution:**
1. Ensure `expo-icon` or Expo's icon generation runs before our plugin
2. Check that `assets/images/icon.png` exists and is 1024x1024
3. Run `npx expo prebuild --platform ios` locally to verify icon generation

### Asset Catalog Invalid
If asset catalog compilation still fails:

1. **Check icon file exists:**
   ```bash
   ls -la ios/spotx/Images.xcassets/AppIcon.appiconset/
   ```

2. **Verify icon file is valid:**
   ```bash
   file ios/spotx/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png
   ```

3. **Check Contents.json:**
   ```bash
   cat ios/spotx/Images.xcassets/AppIcon.appiconset/Contents.json
   ```

4. **Regenerate iOS project:**
   ```bash
   rm -rf ios
   npx expo prebuild --platform ios
   ```

## Prevention

### Always Run Validation Before Building
```bash
npm run validate:ios
```

### Use Production Build Script
The production build script includes validation:
```bash
npm run build:production:ios
```

This runs:
1. `npm run prebuild` (typecheck + lint)
2. `npm run validate:ios` (iOS config validation)
3. `eas build --platform ios --profile production`

## Related Files
- `plugins/withIosIcons.js` - Enhanced plugin with validation
- `scripts/fix-ios-icons-after-prebuild.js` - Post-prebuild fix script (for manual use)
- `scripts/validate-ios-config.sh` - Validation script
- `app.json` - Plugin configuration (plugin order matters!)

## Notes
- The plugin must run **after** Expo's icon generation plugins
- Icon file validation happens during prebuild (fail fast)
- Asset catalog is updated with all required icon sizes
- CFBundleIconName is set in Info.plist
