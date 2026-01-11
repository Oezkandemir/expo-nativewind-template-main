# Supabase Setup - SpotX App

## ✅ Completed Setup

### 📊 Database Tables Created

#### 1. **users** (extends auth.users)
Stores user profiles and preferences
- `id` - UUID (references auth.users)
- `email` - TEXT (unique)
- `name` - TEXT
- `interests` - TEXT[] (for personalized ads)
- `age`, `gender`, `location`, `country` - Demographics
- `notifications_enabled` - BOOLEAN
- `ad_frequency_preference` - TEXT
- `history_widget_enabled` - BOOLEAN
- `onboarding_complete` - BOOLEAN
- `created_at`, `updated_at` - TIMESTAMPTZ

#### 2. **ad_views**
Tracks user ad interactions
- `id` - UUID
- `user_id` - UUID (references users)
- `ad_slot_id` - TEXT
- `campaign_id` - TEXT
- `video_url` - TEXT
- `watched_duration` - INTEGER
- `completed` - BOOLEAN
- `reward_earned` - DECIMAL
- `viewed_at`, `created_at` - TIMESTAMPTZ

#### 3. **rewards**
Tracks user earnings
- `id` - UUID
- `user_id` - UUID (references users)
- `amount` - DECIMAL
- `type` - TEXT (ad_view, bonus, referral, etc.)
- `description` - TEXT
- `ad_view_id` - UUID (references ad_views)
- `created_at` - TIMESTAMPTZ

#### 4. **user_stats**
Daily statistics per user
- `id` - UUID
- `user_id` - UUID (references users)
- `date` - DATE
- `ads_watched` - INTEGER
- `ads_completed` - INTEGER
- `rewards_earned` - DECIMAL
- `created_at`, `updated_at` - TIMESTAMPTZ

### 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only read/write their own data
- Automatic user profile creation on signup (trigger)
- Auto-updating timestamps

### 📝 Database Functions & Triggers

- `handle_new_user()` - Automatically creates user profile on signup
- `handle_updated_at()` - Automatically updates timestamps
- `user_total_rewards` - View for total user earnings

### 🔑 Project Credentials

**Project URL:** `https://mxdpiqnkowcxbujgrfom.supabase.co`

**Anon Key:** (See `lib/supabase/client.ts`)

## 🚀 How to Use

### 1. Install Dependencies

```bash
npm install
```

Required packages (already added to package.json):
- `@supabase/supabase-js` - Supabase client
- `react-native-url-polyfill` - URL polyfill for React Native

### 2. Authentication

The app now uses **real Supabase authentication** instead of dummy data.

**Sign Up:**
```typescript
const { register } = useAuth();
await register(email, password, name);
```

**Sign In:**
```typescript
const { login } = useAuth();
await login(email, password);
```

**Sign Out:**
```typescript
const { logout } = useAuth();
await logout();
```

### 3. User Profile

Update user data:
```typescript
const { updateUser } = useAuth();
await updateUser({
  interests: ['tech', 'sports'],
  demographics: {
    age: 25,
    gender: 'prefer-not-to-say',
  },
});
```

### 4. Development Mode

For quick testing during development, the auth screen allows empty fields and auto-generates credentials:
- Click "Account erstellen" without entering data
- System creates: `user_[timestamp]@spotx.app` with auto-password
- Then select interests → Complete → App

## 📱 Auth Flow

```
Welcome → Auth Screen → Interests → Complete → Main App
            ↓              ↓            ↓
      (Click Weiter)  (Account    (Select min.
                      erstellen)   1 interest)
```

**Sign Up:**
1. User clicks "Account erstellen" (no input needed for dev)
2. Supabase creates auth user + profile
3. Select interests (for personalized ads)
4. Mark onboarding complete
5. Redirect to app

**Sign In:**
1. User enters email/password
2. Supabase validates credentials
3. Check onboarding status
4. If incomplete → Interests screen
5. If complete → Main app

## 🔧 Files Modified/Created

### New Files:
- `lib/supabase/client.ts` - Supabase client configuration
- `lib/supabase/types.ts` - TypeScript database types
- `lib/supabase/auth-service.ts` - Real authentication service
- `docs/SUPABASE_SETUP.md` - This file

### Modified Files:
- `contexts/AuthContext.tsx` - Uses Supabase instead of dummy auth
- `app/(onboarding)/auth.tsx` - Supabase registration/login
- `app/(onboarding)/interests.tsx` - Saves to Supabase
- `package.json` - Added Supabase dependencies

## 🎯 Next Steps

### For Production:
1. **Environment Variables** - Move credentials to `.env`
2. **Email Validation** - Enable email confirmation in Supabase
3. **Password Reset** - Implement forgot password flow
4. **Social Auth** - Add Google/Apple sign-in (optional)

### For Testing:
```bash
npm install
npm start
```

Then test:
- Sign up with auto-generated account
- Select interests
- Complete onboarding
- App should work with real database!

## 📊 Monitoring

Check your Supabase dashboard:
- **Authentication** - See registered users
- **Table Editor** - View/edit data
- **Database** - Check queries/performance
- **Logs** - Debug issues

## 🆘 Troubleshooting

**Issue:** "User creation failed"
- Check Supabase project is running
- Verify credentials in `lib/supabase/client.ts`

**Issue:** "Failed to fetch user profile"
- Check RLS policies are enabled
- Verify trigger `on_auth_user_created` fired

**Issue:** Network error
- Run: `npm install react-native-url-polyfill`
- Restart Metro bundler

## ✨ Features

✅ Real authentication with Supabase  
✅ Automatic user profile creation  
✅ Interests tracking for personalized ads  
✅ Row Level Security enabled  
✅ Session management  
✅ Auto-generated dev accounts  
✅ Clean migration from dummy data  

All data is now stored in **real PostgreSQL database** on Supabase! 🎉
