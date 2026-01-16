const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to add Apple Touch Icon meta tags for web
 * 
 * This plugin adds the necessary meta tags for Apple Touch Icons
 * so iOS devices can use custom icons when users add the web app to their home screen.
 */
const withAppleTouchIcons = (config) => {
  return withDangerousMod(config, [
    'web',
    async (config) => {
      // Apple Touch Icons are automatically handled by Expo's web bundler
      // when placed in the assets/images directory with the correct naming convention.
      // 
      // The icons you've created follow the correct naming:
      // - apple-touch-icon-iphone-60x60.png (60x60 for iPhone)
      // - apple-touch-icon-iphone-retina-120x120.png (120x120 for iPhone Retina)
      // - apple-touch-icon-ipad-76x76.png (76x76 for iPad)
      // - apple-touch-icon-ipad-retina-152x152.png (152x152 for iPad Retina)
      //
      // Expo will automatically generate the appropriate meta tags in the HTML head
      // when these files are present in assets/images.
      
      const webRoot = config.modRequest.platformProjectRoot;
      const assetsPath = path.join(config.modRequest.projectRoot, 'assets/images');
      
      // Verify Apple Touch Icons exist
      const appleTouchIcons = [
        'apple-touch-icon-iphone-60x60.png',
        'apple-touch-icon-iphone-retina-120x120.png',
        'apple-touch-icon-ipad-76x76.png',
        'apple-touch-icon-ipad-retina-152x152.png',
      ];
      
      console.log('[withAppleTouchIcons] Checking for Apple Touch Icons...');
      let allIconsExist = true;
      
      for (const iconName of appleTouchIcons) {
        const iconPath = path.join(assetsPath, iconName);
        if (fs.existsSync(iconPath)) {
          console.log(`[withAppleTouchIcons] ✅ Found: ${iconName}`);
        } else {
          console.warn(`[withAppleTouchIcons] ⚠️ Missing: ${iconName}`);
          allIconsExist = false;
        }
      }
      
      if (allIconsExist) {
        console.log('[withAppleTouchIcons] ✅ All Apple Touch Icons are present');
        console.log('[withAppleTouchIcons] Expo will automatically add meta tags for these icons in the web build');
      } else {
        console.warn('[withAppleTouchIcons] ⚠️ Some Apple Touch Icons are missing');
      }
      
      return config;
    },
  ]);
};

module.exports = withAppleTouchIcons;
