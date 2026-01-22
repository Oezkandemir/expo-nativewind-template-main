const { withDangerousMod, withInfoPlist, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to ensure CFBundleIconName is set in Info.plist
 * 
 * IMPORTANT: This plugin does NOT modify the asset catalog.
 * Expo's built-in icon generation handles creating all icon sizes and Contents.json.
 * We only ensure CFBundleIconName is set so Xcode knows which icon set to use.
 */
const withIosIcons = (config) => {
  // Ensure CFBundleIconName is in Info.plist
  // This tells Xcode which icon set from Images.xcassets to use
  return withInfoPlist(config, (config) => {
    if (!config.modResults.CFBundleIconName) {
      config.modResults.CFBundleIconName = 'AppIcon';
      console.log('[withIosIcons] ✅ Set CFBundleIconName to "AppIcon" in Info.plist');
    } else {
      console.log('[withIosIcons] ✅ CFBundleIconName already set in Info.plist');
    }
    return config;
  });
};

module.exports = withIosIcons;
