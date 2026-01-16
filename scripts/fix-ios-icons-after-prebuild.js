#!/usr/bin/env node

/**
 * Post-prebuild script to fix iOS icons
 * This runs AFTER expo prebuild to ensure our changes are not overwritten
 */

const fs = require('fs');
const path = require('path');

const iosDir = path.join(__dirname, '../ios');
const appName = 'spotx'; // Based on slug
const appIconPath = path.join(iosDir, appName, 'Images.xcassets/AppIcon.appiconset/Contents.json');
const infoPlistPath = path.join(iosDir, appName, 'Info.plist');

console.log('[fix-ios-icons] Starting iOS icon fix...');
console.log('[fix-ios-icons] iOS directory:', iosDir);
console.log('[fix-ios-icons] AppIcon path:', appIconPath);
console.log('[fix-ios-icons] Info.plist path:', infoPlistPath);

// Update AppIcon asset catalog
if (fs.existsSync(appIconPath)) {
  console.log('[fix-ios-icons] ✅ Found AppIcon asset catalog');
  
  const appIconDir = path.dirname(appIconPath);
  const icon1024Path = path.join(appIconDir, 'App-Icon-1024x1024@1x.png');
  
  // Verify the icon file exists
  if (!fs.existsSync(icon1024Path)) {
    console.error('[fix-ios-icons] ❌ ERROR: Icon file not found:', icon1024Path);
    console.error('[fix-ios-icons] This will cause CompileAssetCatalogVariant to fail!');
    process.exit(1);
  }
  
  // Verify the icon file is readable
  try {
    const stats = fs.statSync(icon1024Path);
    if (stats.size === 0) {
      console.error('[fix-ios-icons] ❌ ERROR: Icon file is empty:', icon1024Path);
      process.exit(1);
    }
    console.log('[fix-ios-icons] ✅ Icon file exists and is valid (size:', stats.size, 'bytes)');
  } catch (error) {
    console.error('[fix-ios-icons] ❌ ERROR: Cannot read icon file:', error.message);
    process.exit(1);
  }
  
  const contents = {
    images: [
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '60x60'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '60x60'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '120x120'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '120x120'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '1x',
        size: '76x76'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '2x',
        size: '76x76'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '2x',
        size: '83.5x83.5'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '1x',
        size: '152x152'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '2x',
        size: '152x152'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ipad',
        scale: '2x',
        size: '167x167'
      },
      {
        filename: 'App-Icon-1024x1024@1x.png',
        idiom: 'ios-marketing',
        platform: 'ios',
        scale: '1x',
        size: '1024x1024'
      }
    ],
    info: {
      version: 1,
      author: 'expo'
    }
  };

  fs.writeFileSync(appIconPath, JSON.stringify(contents, null, 2));
  console.log('[fix-ios-icons] ✅ Updated AppIcon asset catalog with all required sizes');
} else {
  console.warn('[fix-ios-icons] ⚠️ AppIcon asset catalog not found:', appIconPath);
  console.warn('[fix-ios-icons] This might cause build issues. Make sure expo prebuild ran successfully.');
}

// Update Info.plist
if (fs.existsSync(infoPlistPath)) {
  console.log('[fix-ios-icons] ✅ Found Info.plist');
  
  let plistContent = fs.readFileSync(infoPlistPath, 'utf8');
  
  if (!plistContent.includes('<key>CFBundleIconName</key>')) {
    // Add CFBundleIconName after CFBundleDisplayName
    plistContent = plistContent.replace(
      /(<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>)/,
      '$1\n    <key>CFBundleIconName</key>\n    <string>AppIcon</string>'
    );
    fs.writeFileSync(infoPlistPath, plistContent);
    console.log('[fix-ios-icons] ✅ Added CFBundleIconName to Info.plist');
  } else {
    console.log('[fix-ios-icons] ✅ CFBundleIconName already exists in Info.plist');
  }
} else {
  console.warn('[fix-ios-icons] ⚠️ Info.plist not found:', infoPlistPath);
}

console.log('[fix-ios-icons] ✅ iOS icon fix completed');
