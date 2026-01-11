# Quick Fix: iOS Development Build - "Failed to read entitlements"

## Problem

```
Failed to read entitlements
Creating Gymfile
Error: The "Run fastlane" step failed with an unknown error.
```

## Root Cause

Your app uses `expo-notifications` plugin which requires push notification entitlements. The provisioning profile doesn't have these entitlements.

## Solution (2 minutes)

### Option 1: Automated Script (Easiest)

```bash
./scripts/setup-ios-dev-credentials.sh
```

Follow the prompts:
- Select: iOS (i)
- Select: development (d)
- Choose: Set up credentials
- Choose: Automatic

### Option 2: Manual Setup

```bash
eas credentials -p ios
```

**Follow these steps:**
1. **Select platform:** Press `i` for iOS
2. **Select build profile:** Press `d` for development
3. **What would you like to do:** Choose `Set up credentials` or `Configure credentials`
4. **How would you like to set up:** Choose `Automatic` (recommended)

EAS will automatically create a provisioning profile with the correct entitlements.

### Step 3: Retry Build

After credentials are set up:

```bash
eas build --platform ios --profile development --non-interactive
```

## Why This Works

- `expo-notifications` plugin requires push notification entitlements
- EAS needs a provisioning profile with these entitlements
- Setting up credentials creates the correct provisioning profile
- Build can now read entitlements successfully

## Verification

After setting up credentials, verify:

```bash
eas credentials -p ios
# Select: development
# Choose: View credentials
```

You should see:
- ✅ Distribution Certificate: Configured
- ✅ Provisioning Profile: Configured (with push notifications)

## Still Having Issues?

1. Check build logs: https://expo.dev/accounts/demiroo/projects/spotx/builds/[BUILD_ID]
2. Ensure you're logged in: `eas whoami`
3. Try preview profile: `eas build --platform ios --profile preview --non-interactive`
