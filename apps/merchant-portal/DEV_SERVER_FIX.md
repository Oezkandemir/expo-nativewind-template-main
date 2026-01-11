# Fix: Tailwind CSS Resolution Error

## Problem

Error: `Can't resolve 'tailwindcss' in '/Users/dmr/Desktop/expo-nativewind-template-main/apps'`

This happens when Turbopack tries to resolve `tailwindcss` from the wrong directory in the monorepo.

## Solution

### 1. Ensure dependencies are installed

```bash
cd apps/merchant-portal
npm install
```

### 2. Run dev server from merchant-portal directory

**IMPORTANT:** Always run the dev server from the `apps/merchant-portal` directory:

```bash
cd apps/merchant-portal
npm run dev
# or
bun run dev
```

**DO NOT** run from the root directory or `/apps` directory.

### 3. If error persists

The `next.config.ts` is configured to use `process.cwd()` as the Turbopack root, which should work when running from the merchant-portal directory.

If you still see the error:
1. Stop the dev server
2. Delete `.next` folder: `rm -rf .next`
3. Restart from `apps/merchant-portal` directory

## Why this happens

Turbopack resolves modules relative to its root directory. When run from the wrong directory, it looks for `tailwindcss` in `/apps/node_modules` instead of `apps/merchant-portal/node_modules`.

## Verification

After restarting, you should see:
- ✅ No "Can't resolve 'tailwindcss'" errors
- ✅ Tailwind CSS styles working correctly
- ✅ Dev server running on http://localhost:3000
