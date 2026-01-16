#!/usr/bin/env node

/**
 * Fix missing .settings folders in node_modules Android directories
 * This prevents IDE errors about missing Gradle project configuration folders
 */

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// List of packages that have Android directories that need .settings folders
const packagesWithAndroid = [
  '@react-native-async-storage/async-storage',
  '@react-native-community/netinfo',
  '@react-native/gradle-plugin',
  '@react-native/gradle-plugin/shared-testutil',
  '@react-native/gradle-plugin/react-native-gradle-plugin',
  '@react-native/gradle-plugin/settings-plugin',
  '@react-native/gradle-plugin/shared',
];

function createSettingsFolder(packagePath) {
  // Check if this package path has an android directory
  const packageDir = path.join(nodeModulesPath, packagePath);
  const androidDir = path.join(packageDir, 'android');
  
  // If no android directory exists, check if the package itself needs a .settings folder
  // (some Gradle plugins have .settings at the root)
  if (!fs.existsSync(androidDir)) {
    // Check if this is a Gradle plugin that needs .settings at root
    const settingsPath = path.join(packageDir, '.settings');
    if (fs.existsSync(packageDir) && !fs.existsSync(settingsPath)) {
      try {
        fs.mkdirSync(settingsPath, { recursive: true });
        console.log(`✓ Created .settings folder for ${packagePath}`);
        return true;
      } catch (error) {
        console.warn(`⚠ Could not create .settings folder for ${packagePath}:`, error.message);
        return false;
      }
    }
    return false;
  }
  
  // Create .settings in android directory
  const androidSettingsPath = path.join(androidDir, '.settings');
  if (!fs.existsSync(androidSettingsPath)) {
    try {
      fs.mkdirSync(androidSettingsPath, { recursive: true });
      console.log(`✓ Created .settings folder for ${packagePath}/android`);
      return true;
    } catch (error) {
      console.warn(`⚠ Could not create .settings folder for ${packagePath}:`, error.message);
      return false;
    }
  }
  return false;
}

// Find all Android directories in node_modules
function findAndroidDirs(dir, relativePath = '') {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === 'android') {
          results.push(relPath);
        } else if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          results.push(...findAndroidDirs(fullPath, relPath));
        }
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return results;
}

console.log('🔧 Fixing Gradle .settings folders...\n');

// Fix known packages
let fixed = 0;
for (const pkg of packagesWithAndroid) {
  if (createSettingsFolder(pkg)) {
    fixed++;
  }
}

// Also create .settings in root of Gradle plugin packages (they need it at root level)
const gradlePluginPackages = [
  '@react-native/gradle-plugin',
  '@react-native/gradle-plugin/shared-testutil',
  '@react-native/gradle-plugin/react-native-gradle-plugin',
  '@react-native/gradle-plugin/settings-plugin',
  '@react-native/gradle-plugin/shared',
];

for (const pkg of gradlePluginPackages) {
  const packageDir = path.join(nodeModulesPath, pkg);
  const settingsPath = path.join(packageDir, '.settings');
  if (fs.existsSync(packageDir) && !fs.existsSync(settingsPath)) {
    try {
      fs.mkdirSync(settingsPath, { recursive: true });
      console.log(`✓ Created root .settings folder for ${pkg}`);
      fixed++;
    } catch (error) {
      console.warn(`⚠ Could not create root .settings folder for ${pkg}:`, error.message);
    }
  }
}

// Find and fix other Android directories in @react-native packages
const reactNativePath = path.join(nodeModulesPath, '@react-native');
if (fs.existsSync(reactNativePath)) {
  const androidDirs = findAndroidDirs(reactNativePath, '@react-native');
  for (const androidDir of androidDirs) {
    const parentDir = path.dirname(androidDir);
    if (createSettingsFolder(parentDir)) {
      fixed++;
    }
  }
}

console.log(`\n✅ Fixed ${fixed} Gradle .settings folder(s)`);
