# iOS Fastlane Build Error Fix

## Problem

Build failed with:
```
Failed to read entitlements
Creating Gymfile
Error: The "Run fastlane" step failed with an unknown error.
```

This error specifically indicates a **code signing/entitlements issue**. The provisioning profile doesn't match the app's entitlements (like push notifications).

## Common Causes & Solutions

### 1. Missing iOS Credentials (Most Common) ⚠️ **THIS IS YOUR ISSUE**

The "Failed to read entitlements" error means your app has capabilities (like push notifications from `expo-notifications` plugin) but the provisioning profile doesn't include them.

**Solution:**
```bash
# Set up iOS credentials - THIS IS REQUIRED
eas credentials -p ios
```

**Select:**
1. Platform: `iOS` (i)
2. Build Profile: `development` (d) - for simulator builds
3. Action: `Set up credentials` or `Configure credentials`
4. Choose: **Automatic provisioning** (recommended)

EAS will automatically:
- Create/update the provisioning profile with correct entitlements
- Include push notification capabilities
- Set up the distribution certificate

**IMPORTANT:** Even simulator builds need proper credentials when using plugins like `expo-notifications`!

### 2. Metro Config Warning (False Positive)

The warning about metro.config.js is usually a false positive if you're using `getDefaultConfig`. However, to silence it:

**Check:** Your `metro.config.js` should start with:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const baseConfig = getDefaultConfig(projectRoot);
```

If it does, the warning can be ignored. The config is correct.

### 3. New Architecture Compatibility

If `newArchEnabled: true` is causing issues, try temporarily disabling it:

**In `app.json`:**
```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

**Or in `eas.json` for specific profiles:**
```json
{
  "build": {
    "development": {
      "ios": {
        "simulator": true,
        "newArchEnabled": false
      }
    }
  }
}
```

### 4. Xcode Version Compatibility

EAS uses the latest stable Xcode. If you're using newer React Native features, ensure compatibility.

**Check SDK version:**
- Your app uses Expo SDK 53.0.0
- Ensure all dependencies are compatible with SDK 53

### 5. Missing Dependencies or Pods

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules
npm install

# If you have an ios folder (after prebuild)
cd ios
pod deintegrate
pod install
cd ..
```

### 6. Code Signing Issues

For simulator builds, code signing should be automatic, but sometimes needs manual setup.

**Solution:**
```bash
eas credentials -p ios
# Select: development → Set up credentials
# Choose: Automatic provisioning
```

## Quick Fix Steps (For "Failed to read entitlements")

### Step 1: Set up iOS Credentials (REQUIRED)

```bash
eas credentials -p ios
```

**Follow these exact steps:**
1. Select platform: Press `i` for **iOS**
2. Select build profile: Press `d` for **development**
3. What would you like to do: Choose **"Set up credentials"** or **"Configure credentials"**
4. How would you like to set up credentials: Choose **"Automatic"** (let EAS handle it)

EAS will:
- Create a provisioning profile with push notification entitlements
- Set up the distribution certificate
- Configure everything automatically

### Step 2: Retry Build

After credentials are set up:

```bash
eas build --platform ios --profile development --non-interactive
```

### Step 3: If Still Failing

Check the detailed build logs:
- Visit: https://expo.dev/accounts/demiroo/projects/spotx/builds/784d2090-950d-4931-8311-0c57a00e8506
- Look at "Xcode Logs" section for specific errors

## Alternative: Use Preview Profile

If development profile continues to fail, try preview profile:

```bash
eas build --platform ios --profile preview --non-interactive
```

Preview builds work on real devices and may have better error messages.

## Check Build Logs

The build logs URL is:
```
https://expo.dev/accounts/demiroo/projects/spotx/builds/784d2090-950d-4931-8311-0c57a00e8506
```

Check the "Xcode Logs" section for detailed error messages.

## Prevention

1. Always set up credentials before first build:
   ```bash
   eas credentials -p ios
   ```

2. Run prebuild checks:
   ```bash
   npm run prebuild
   ```

3. Test locally first (if you have Xcode):
   ```bash
   npx expo prebuild
   cd ios
   pod install
   cd ..
   npx expo run:ios
   ```

## Related Issues

- See `PUSH_CREDENTIALS_FIX.md` for push notification setup
- See `APNS_CREDENTIALS_SETUP.md` for APNs credentials
- See `BUILD.md` for general build troubleshooting
