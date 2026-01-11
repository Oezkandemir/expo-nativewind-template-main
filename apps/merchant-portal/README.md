# SpotX Merchant Portal

A Next.js web application for businesses to create and manage advertising campaigns on the SpotX platform.

## 🎯 Features

- ✅ Merchant registration and authentication
- ✅ Campaign management dashboard
- ✅ Real-time campaign statistics
- ✅ Budget tracking and monitoring
- 🚧 Campaign creation (coming soon)
- 🚧 Analytics dashboard (coming soon)

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

Run the setup script to configure environment variables and install dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the merchant portal.

## 📚 Testing

Follow the comprehensive testing guide:

1. Read `../../docs/MERCHANT_PORTAL_TESTING.md` for step-by-step testing instructions
2. Test merchant registration at `/register`
3. Test merchant login at `/login`
4. View campaigns dashboard at `/campaigns`

## 🏗️ Project Structure

```
apps/merchant-portal/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── campaigns/    # Campaign management
│   │   └── layout.tsx    # Dashboard layout with auth check
│   └── page.tsx          # Landing page
├── lib/
│   ├── auth/             # Authentication utilities
│   │   └── merchant-helpers.ts  # Merchant auth helpers
│   ├── supabase/         # Supabase client configuration
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server-side client
│   └── utils.ts          # Utility functions
└── setup.sh              # Automated setup script
```

## 🔐 Authentication Flow

1. **Registration:**
   - Merchant fills registration form
   - Creates Supabase Auth user
   - Creates merchant profile (with NULL `user_id`)
   - Status set to "pending" by default

2. **Login:**
   - Merchant enters credentials
   - Supabase Auth validates
   - Merchant profile fetched by `business_email`
   - Redirects to dashboard

3. **Dashboard Access:**
   - Protected by `getCurrentMerchant()` helper
   - Fetches merchant data by email (not `user_id`)
   - Shows approval status and campaigns

## 🔧 Key Technical Details

### Why is `user_id` NULL?

The `merchants` table has a `user_id` field that references the `public.users` table (mobile app users). However, merchants authenticate via `auth.users` (Supabase Auth), not the mobile app's user system.

**Solution:** Leave `user_id` as NULL and identify merchants by `business_email`.

See `../../docs/MERCHANT_AUTH_FIX.md` for detailed explanation.

### Merchant Helper Functions

Located in `lib/auth/merchant-helpers.ts`:

```typescript
// Get current authenticated merchant (or redirect to login)
const merchant = await getCurrentMerchant()

// Check if merchant is approved
const isApproved = await isMerchantApproved()
```

## 📊 Database Schema

### `merchants` table

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY,
  user_id UUID,  -- NULL for merchants (references public.users, not auth.users)
  company_name TEXT,
  business_email TEXT UNIQUE,
  phone TEXT,
  website TEXT,
  status TEXT,  -- 'pending', 'approved', 'suspended'
  verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🎯 Next Steps

### For Testing
1. Complete all tests in `MERCHANT_PORTAL_TESTING.md`
2. Verify merchant registration works
3. Test dashboard access and display
4. Manually approve test merchant in Supabase

### For Development
1. **Campaign Creation** - Implement `/campaigns/new` page
2. **Campaign Editing** - Add edit functionality
3. **Analytics** - Build analytics dashboard
4. **File Upload** - Integrate Supabase Storage for campaign assets
5. **Payment** - Add Stripe/PayPal integration

## 📖 Documentation

- [Testing Guide](../../docs/MERCHANT_PORTAL_TESTING.md) - Comprehensive testing instructions
- [Auth Fix Details](../../docs/MERCHANT_AUTH_FIX.md) - Technical details of the foreign key fix
- [Implementation Guide](../../docs/MERCHANT_PORTAL_GUIDE.md) - Full implementation guide
- [Merchant System Overview](../../docs/MERCHANT_SYSTEM_COMPLETE.md) - Overall system architecture

## 🐛 Troubleshooting

### "Merchant-Profil nicht gefunden"
- Check that merchant was created during registration
- Verify `business_email` matches logged-in user's email
- Check Supabase Dashboard → Table Editor → `merchants`

### Environment Variables Not Loaded
- Ensure `.env.local` exists in `apps/merchant-portal/`
- Restart development server after creating `.env.local`
- Verify variables start with `NEXT_PUBLIC_` for client-side access

### Can't See Campaigns
- Merchant needs to be approved first (status = 'approved')
- Check Supabase Dashboard → Table Editor → Update merchant status
- Verify campaigns exist and have correct `merchant_id`

## 🚢 Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

See `vercel.json` for deployment configuration.

## 📝 License

Part of the SpotX monorepo. See main README for license information.

---

**Built with:**
- Next.js 15+ (App Router)
- Supabase (Auth + Database)
- TypeScript
- Tailwind CSS
- Lucide React Icons
