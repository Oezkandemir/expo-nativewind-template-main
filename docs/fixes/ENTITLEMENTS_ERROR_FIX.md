# "Failed to read entitlements" Error Fix

## Problem

```
Failed to read entitlements
Creating Gymfile
Error: The "Run fastlane" step failed with an unknown error.
```

## Root Cause

Your app uses the `expo-notifications` plugin which requires **push notification entitlements** in the provisioning profile. The current provisioning profile doesn't include these entitlements, causing the build to fail.

## Solution (5 minutes)

### Step 1: Set Up iOS Credentials

**This is REQUIRED - you cannot skip this step!**

```bash
eas credentials -p ios
```

**Interactive steps:**
1. **Select platform:** Press `i` for iOS
2. **Select build profile:** Press `d` for development
3. **What would you like to do:** Choose `Set up credentials` or `Configure credentials`
4. **How would you like to set up credentials:** Choose `Automatic` (let EAS handle everything)

EAS will automatically:
- ✅ Create a provisioning profile with push notification entitlements
- ✅ Set up the distribution certificate
- ✅ Configure all required capabilities

### Step 2: Verify Credentials

After setup, verify credentials are configured:

```bash
eas credentials -p ios
# Select: development
# Choose: "View credentials" or "Show credentials"
```

You should see:
- ✅ Distribution Certificate: Configured
- ✅ Provisioning Profile: Configured (with push notifications)

### Step 3: Retry Build

```bash
eas build --platform ios --profile development --non-interactive
```

## Why This Happens

1. **Your app.json includes:**
   ```json
   "plugins": [
     ["expo-notifications", { ... }]
   ]
   ```

2. **This requires entitlements:**
   - Push Notifications capability
   - Background Modes (remote-notification)

3. **Without proper credentials:**
   - EAS can't create a provisioning profile with these entitlements
   - Xcode fails to read entitlements during build
   - Build fails at fastlane step

## Alternative: Remove Push Notifications (Not Recommended)

If you don't need push notifications right now, you can temporarily remove the plugin:

**In `app.json`:**
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-dev-client",
      ["expo-splash-screen", { ... }]
      // Remove expo-notifications temporarily
    ]
  }
}
```

**Then rebuild:**
```bash
eas build --platform ios --profile development --non-interactive
```

**⚠️ Warning:** This will disable push notifications. You'll need to set up credentials later anyway.

## Prevention

Always set up credentials before your first build:

```bash
# Before first build
eas credentials -p ios
# Set up for all profiles you'll use: development, preview, production
```

## Related Issues

- See `PUSH_CREDENTIALS_FIX.md` for push notification setup
- See `APNS_CREDENTIALS_SETUP.md` for APNs credentials
- See `IOS_FASTLANE_BUILD_FIX.md` for general iOS build issues

## Still Having Issues?

1. Check build logs: https://expo.dev/accounts/demiroo/projects/spotx/builds/[BUILD_ID]
2. Look for specific error messages in "Xcode Logs"
3. Try preview profile instead:
   ```bash
   eas build --platform ios --profile preview --non-interactive
   ```
