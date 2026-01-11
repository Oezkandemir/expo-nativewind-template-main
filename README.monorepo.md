# SpotX Monorepo

This is a monorepo containing the SpotX mobile app (React Native/Expo) and the Merchant Portal (Next.js).

## 📁 Project Structure

```
spotx-monorepo/
├── apps/
│   ├── native/              # React Native mobile app (Expo)
│   └── merchant-portal/     # Next.js web portal for merchants
├── packages/
│   └── shared-config/       # Shared Supabase configuration
├── package.json             # Root package.json with workspaces
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install all dependencies
npm install

# or install specific workspace
npm install --workspace=apps/merchant-portal
npm install --workspace=apps/native
```

### Development

```bash
# Run merchant portal (Next.js)
npm run dev:portal

# Run native app (Expo)
npm run dev:native
```

### Build

```bash
# Build merchant portal for production
npm run build:portal

# Build native apps
npm run build:native:ios
npm run build:native:android
```

## 📱 Apps

### Native App (apps/native)
- React Native with Expo
- NativeWind (Tailwind CSS)
- Supabase integration
- Push notifications
- Ad viewing and rewards

**Deploy:** EAS Build
```bash
cd apps/native
npm run build:production:android
npm run build:production:ios
```

### Merchant Portal (apps/merchant-portal)
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase integration
- Campaign management
- Analytics dashboard

**Deploy:** Vercel
```bash
cd apps/merchant-portal
npm run build
```

## 📦 Packages

### shared-config (packages/shared-config)
- Supabase configuration
- TypeScript types
- Shared utilities

## 🔧 Scripts

```bash
# Development
npm run dev:portal          # Start merchant portal
npm run dev:native          # Start native app

# Build
npm run build:portal        # Build merchant portal
npm run build:native:ios    # Build iOS app
npm run build:native:android # Build Android app

# Maintenance
npm run lint                # Lint all workspaces
npm run typecheck           # Type check all workspaces
npm run clean               # Clean all node_modules
```

## 🌍 Deployment

### Merchant Portal → Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Framework:** Next.js
   - **Root Directory:** `apps/merchant-portal`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
3. Add environment variables in Vercel dashboard
4. Deploy!

### Native App → EAS

```bash
cd apps/native
eas build --platform all --profile production
eas submit --platform all
```

## 🔐 Environment Variables

### Merchant Portal (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Native App (apps/native/.env)
Already configured in `lib/supabase/config.local.ts`

## 📚 Documentation

- [Merchant System Complete](./docs/MERCHANT_SYSTEM_COMPLETE.md)
- [Merchant Portal Guide](./docs/MERCHANT_PORTAL_GUIDE.md)
- [Implementation Summary](./docs/MERCHANT_IMPLEMENTATION_README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## 📄 License

MIT
