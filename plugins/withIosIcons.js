const { withDangerousMod, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to ensure iOS AppIcon asset catalog has all required icon sizes
 * and CFBundleIconName is set in Info.plist
 */
const withIosIcons = (config) => {
  // First, ensure CFBundleIconName is in Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleIconName = 'AppIcon';
    return config;
  });

  // Then, update the asset catalog
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const appIconPath = path.join(
        platformRoot,
        'spotx/Images.xcassets/AppIcon.appiconset/Contents.json'
      );
      const infoPlistPath = path.join(platformRoot, 'spotx/Info.plist');

      // Update AppIcon asset catalog
      if (fs.existsSync(appIconPath)) {
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
        console.log('✅ Updated AppIcon asset catalog with all required sizes');
      }

      // Also ensure Info.plist has CFBundleIconName (backup check)
      if (fs.existsSync(infoPlistPath)) {
        const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
        if (!plistContent.includes('<key>CFBundleIconName</key>')) {
          // Add CFBundleIconName after CFBundleDisplayName
          const updatedContent = plistContent.replace(
            /(<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>)/,
            '$1\n    <key>CFBundleIconName</key>\n    <string>AppIcon</string>'
          );
          fs.writeFileSync(infoPlistPath, updatedContent);
          console.log('✅ Added CFBundleIconName to Info.plist');
        }
      }

      return config;
    },
  ]);
};

module.exports = withIosIcons;
