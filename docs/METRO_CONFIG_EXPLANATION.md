# Why We Use a Custom Metro Config

## TL;DR

**We ARE using Expo's Metro config** - we're **extending** it, not replacing it. The EAS warning is a **false positive**. Our customizations are **necessary** for:
1. **NativeWind** (Tailwind CSS for React Native)
2. **Monorepo structure** (excluding merchant-portal from bundling)
3. **react-native-worklets** alias resolution

## The Config DOES Extend Expo Metro

Looking at `metro.config.js`:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const baseConfig = getDefaultConfig(projectRoot);  // ✅ Extends Expo's config
const config = withNativeWind(baseConfig, { ... }); // ✅ Wraps Expo's config
```

**We start with Expo's default config** and then add necessary customizations.

## Why We Need Customizations

### 1. **NativeWind Integration** (Required)

```javascript
const { withNativeWind } = require("nativewind/metro");
const config = withNativeWind(baseConfig, { input: "./global.css" });
```

**Why:** NativeWind (Tailwind CSS for React Native) requires Metro to process CSS files and transform Tailwind classes into React Native styles. Without this wrapper, Tailwind classes won't work.

**Can we remove it?** ❌ No - the entire UI is built with NativeWind/Tailwind classes.

### 2. **Monorepo: Block Merchant Portal** (Required)

```javascript
// Block merchant-portal (Next.js) from Metro bundling
const blockList = [new RegExp(`^${merchantPortalPath}/.*`)];
config.resolver.blockList = [...existingBlockList, ...blockList];
```

**Why:** This is a monorepo with:
- Mobile app (React Native/Expo) - should be bundled by Metro
- Merchant Portal (Next.js) - should NOT be bundled by Metro

Without blocking, Metro would try to bundle Next.js server-side code, causing errors.

**Can we remove it?** ❌ No - Metro would try to bundle Next.js code and fail.

### 3. **react-native-worklets Alias** (Required)

```javascript
config.resolver.extraNodeModules = {
  "react-native-worklets": require.resolve("react-native-worklets-core"),
};
```

**Why:** Some dependencies reference `react-native-worklets`, but the actual package is `react-native-worklets-core`. This alias ensures correct resolution.

**Can we remove it?** ❌ No - dependencies would fail to resolve.

## Why EAS Shows the Warning

EAS uses **static analysis** to detect if Metro config extends `@expo/metro-config`. It looks for:
- Direct use of `getDefaultConfig` ✅ (we have this)
- But also checks if the final config structure matches exactly ❌ (we wrap it)

Because we wrap Expo's config with `withNativeWind()` and add customizations, EAS's static analysis can't detect that we're still extending Expo's config.

**This is a known limitation** - EAS's detection is conservative and flags any customization, even when it's still based on Expo's config.

## Is This Safe?

✅ **Yes!** Our config:
1. ✅ Starts with Expo's `getDefaultConfig()` 
2. ✅ Preserves Expo's transformer and serializer
3. ✅ Only adds necessary customizations
4. ✅ Maintains compatibility with Expo's build system

## What Happens If We Remove Customizations?

If we tried to use pure Expo Metro config:

1. **Remove NativeWind wrapper:**
   - ❌ All Tailwind classes would break
   - ❌ UI components wouldn't render correctly
   - ❌ App would crash

2. **Remove merchant-portal blocking:**
   - ❌ Metro would try to bundle Next.js code
   - ❌ Build would fail with module resolution errors
   - ❌ Bundle size would be huge

3. **Remove worklets alias:**
   - ❌ Dependencies would fail to resolve
   - ❌ Build would fail

## Conclusion

**The customizations are necessary and correct.** The EAS warning is a false positive - we ARE using Expo's Metro config, just with required extensions for:
- NativeWind (Tailwind CSS)
- Monorepo structure
- Package aliases

**Action:** Continue answering "no" to the EAS prompt - the build will succeed because our config is correct.

## References

- [NativeWind Metro Config](https://www.nativewind.dev/install/metro)
- [Expo Metro Config](https://docs.expo.dev/guides/customizing-metro/)
- [EAS Build Metro Detection](https://docs.expo.dev/build-reference/metro-config/)
