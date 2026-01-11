const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

// Get project root - must be absolute path for Expo serializer
const projectRoot = path.resolve(__dirname);

/** @type {import('expo/metro-config').MetroConfig} */
// Call getDefaultConfig with projectRoot to ensure it's set correctly
const baseConfig = getDefaultConfig(projectRoot);

// Verify global.css exists
const cssPath = path.resolve(projectRoot, "global.css");
if (!fs.existsSync(cssPath)) {
  throw new Error(`CSS file not found: ${cssPath}`);
}

// Apply NativeWind first - this should preserve the config structure
const config = withNativeWind(baseConfig, { input: "./global.css" });

// CRITICAL: Ensure projectRoot is explicitly set after NativeWind
// Expo's serializer uses this to compute relative paths for modules
// If this is undefined, path.relative() will fail
if (!config.projectRoot) {
  config.projectRoot = projectRoot;
}

// Exclude merchant-portal and other server-side code from Metro bundling
// This prevents Metro from trying to bundle Next.js/server-side code
const merchantPortalPath = path.resolve(projectRoot, "apps", "merchant-portal");
const blockList = [];

if (fs.existsSync(merchantPortalPath)) {
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = merchantPortalPath.replace(/\\/g, "/");
  // Escape special regex characters and create pattern
  const escapedPath = normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  blockList.push(new RegExp(`^${escapedPath}/.*`));
}

// Also block any node_modules in merchant-portal
if (fs.existsSync(merchantPortalPath)) {
  const merchantPortalNodeModules = path.resolve(merchantPortalPath, "node_modules");
  if (fs.existsSync(merchantPortalNodeModules)) {
    const normalizedPath = merchantPortalNodeModules.replace(/\\/g, "/");
    const escapedPath = normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    blockList.push(new RegExp(`^${escapedPath}/.*`));
  }
}

if (blockList.length > 0) {
  if (!config.resolver) {
    config.resolver = {};
  }
  const existingBlockList = Array.isArray(config.resolver.blockList) 
    ? config.resolver.blockList 
    : [];
  config.resolver.blockList = [...existingBlockList, ...blockList];
}

// Ensure watchFolders doesn't include merchant-portal
// This prevents Metro from watching files in merchant-portal
if (!config.watchFolders) {
  config.watchFolders = [projectRoot];
} else {
  // Filter out merchant-portal from watchFolders if it exists
  config.watchFolders = config.watchFolders.filter((folder) => {
    const normalizedFolder = folder.replace(/\\/g, "/");
    const normalizedMerchantPortal = merchantPortalPath.replace(/\\/g, "/");
    return !normalizedFolder.includes(normalizedMerchantPortal);
  });
}

// Double-check projectRoot is set (critical for path.relative() to work)
config.projectRoot = projectRoot;

module.exports = config;
