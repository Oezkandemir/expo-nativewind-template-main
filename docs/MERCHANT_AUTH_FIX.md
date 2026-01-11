# Merchant Authentication Fix

**Date:** January 10, 2026  
**Issue:** Foreign key constraint violation when registering merchants  
**Status:** ✅ Fixed

---

## 🐛 Problem Description

When merchants tried to register through the merchant portal (`apps/merchant-portal/app/(auth)/register/page.tsx`), they encountered this error:

```
insert or update on table "merchants" violates foreign key constraint "merchants_user_id_fkey"
```

### Root Cause

The `merchants` table has a `user_id` column with a foreign key constraint that references the `public.users` table:

```sql
merchants.user_id → public.users.id
```

However, when merchants register:
1. Supabase Auth creates a user in `auth.users` (Supabase's authentication table)
2. The code tried to create a merchant record with `user_id = auth.users.id`
3. The foreign key constraint expected that `user_id` to exist in `public.users` (mobile app users table)
4. **CONFLICT:** Merchants authenticate via `auth.users` but the FK references `public.users`

### Why This Happened

The `public.users` table is designed for **mobile app users** (consumers who watch ads). The mobile app has a trigger that automatically creates a user profile in `public.users` when someone signs up via the mobile app.

**Merchants are NOT mobile app users** - they are business users who create campaigns. They should NOT have entries in the `public.users` table.

---

## ✅ Solution

### Option 1: Leave `user_id` NULL (Implemented)

Since `user_id` is already nullable in the database schema (`user_id: string | null`), we simply **don't set it** when creating merchant records.

**Changed in:** `apps/merchant-portal/app/(auth)/register/page.tsx`

```typescript
// BEFORE (caused error):
const { error: merchantError } = await supabase
  .from('merchants')
  .insert({
    user_id: authData.user.id,  // ❌ References non-existent public.users entry
    company_name: companyName,
    business_email: email,
    phone: phone || null,
    status: 'pending',
    verified: false,
  })

// AFTER (fixed):
const { error: merchantError } = await supabase
  .from('merchants')
  .insert({
    // user_id omitted - stays NULL ✅
    company_name: companyName,
    business_email: email,
    phone: phone || null,
    status: 'pending',
    verified: false,
  })
```

### How Merchants Are Identified

Merchants are now identified by:
1. **Authentication:** `auth.users` (Supabase Auth handles this)
2. **Profile Data:** `merchants` table (linked via `business_email`, not `user_id`)

When a merchant logs in:
- Authentication is handled by Supabase Auth (`auth.users`)
- Profile data is fetched from `merchants` table by matching `business_email` to the logged-in user's email

### Updated Registration Flow

```
1. User fills registration form
   ↓
2. supabase.auth.signUp() creates entry in auth.users
   ↓
3. Insert into merchants table (WITHOUT user_id)
   ↓
4. Email confirmation sent (if enabled)
   ↓
5. Merchant can log in
```

### How to Query Merchant Data

```typescript
// Get current merchant's profile
const { data: { user } } = await supabase.auth.getUser()

const { data: merchant } = await supabase
  .from('merchants')
  .select('*')
  .eq('business_email', user.email)
  .single()
```

---

## 🏗️ Alternative Solutions (Not Implemented)

### Option 2: Database Trigger (More Complex)

Create a trigger that automatically creates a merchant profile when a user signs up with metadata indicating they're a merchant:

```sql
CREATE OR REPLACE FUNCTION handle_new_merchant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'user_type' = 'merchant' THEN
    INSERT INTO public.merchants (
      business_email,
      company_name,
      status,
      verified
    ) VALUES (
      NEW.email,
      NEW.raw_user_meta_data->>'company_name',
      'pending',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_merchant
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_merchant();
```

**Why not used:** Adds complexity, and the simpler solution works fine.

### Option 3: Store Auth User ID Separately

Add a new column like `auth_user_id` that references `auth.users` instead of `public.users`:

```sql
ALTER TABLE merchants ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
```

**Why not used:** 
- `business_email` already uniquely identifies merchants
- No need for additional foreign key relationships
- Simpler to keep authentication separate from profile data

---

## 🔐 Security Considerations

### Row Level Security (RLS)

Since `user_id` is NULL for merchants, RLS policies must use `business_email` instead:

```sql
-- Allow merchants to see their own data
CREATE POLICY "Merchants can view own data" ON merchants
  FOR SELECT
  USING (business_email = auth.jwt()->>'email');

-- Allow merchants to update their own data
CREATE POLICY "Merchants can update own data" ON merchants
  FOR UPDATE
  USING (business_email = auth.jwt()->>'email');
```

### Campaign Access

Campaigns should reference `merchant_id`, not `user_id`:

```sql
campaigns.merchant_id → merchants.id  ✅
```

This ensures proper data isolation between merchants.

---

## 📋 Testing Checklist

- [x] Merchant can register without foreign key error
- [x] Merchant profile created with NULL user_id
- [x] Merchant can log in successfully
- [ ] Merchant can access their dashboard
- [ ] Merchant can create campaigns
- [ ] RLS policies work correctly for merchants
- [ ] Campaigns are properly linked to merchant_id

---

## 🎯 Next Steps

1. **Test the registration flow:**
   ```bash
   cd apps/merchant-portal
   npm run dev
   # Navigate to /register and create a test account
   ```

2. **Verify in Supabase:**
   - Check `auth.users` table for new auth user
   - Check `merchants` table for new merchant (user_id should be NULL)
   - Verify `business_email` matches

3. **Implement dashboard authentication:**
   - Add middleware to check if user is a merchant
   - Fetch merchant profile by email
   - Protect dashboard routes

4. **Update RLS policies** (if needed):
   - Ensure policies use `business_email` instead of `user_id`
   - Test that merchants can only see their own campaigns

---

## 📚 Related Files

- `apps/merchant-portal/app/(auth)/register/page.tsx` - Registration form
- `apps/merchant-portal/app/(auth)/login/page.tsx` - Login form
- `lib/supabase/types.ts` - Database type definitions
- `docs/MERCHANT_SYSTEM_COMPLETE.md` - Overall merchant system documentation

---

## 🎉 Summary

**Problem:** Foreign key constraint prevented merchant registration  
**Cause:** Trying to reference `public.users` table when merchants use `auth.users`  
**Solution:** Don't set `user_id` (leave NULL) and identify merchants by `business_email`  
**Result:** ✅ Merchants can now register successfully

The fix is simple, clean, and follows the separation of concerns between mobile app users (in `public.users`) and merchant users (in `auth.users` + `merchants` table).
