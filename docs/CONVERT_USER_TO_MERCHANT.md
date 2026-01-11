# Convert App User to Merchant - Step-by-Step Guide

**User:** demiroezkan205@gmail.com  
**Goal:** Allow this existing mobile app user to also access the merchant portal

---

## 🎯 What This Does

This will allow `demiroezkan205@gmail.com` to:
- ✅ **Continue using the mobile app** as a regular user (watch ads, earn rewards)
- ✅ **Access the merchant portal** (create and manage campaigns)
- ✅ **Use the same login credentials** for both platforms

**Important:** The user will have TWO roles:
1. **Mobile App User** - Watches ads and earns rewards
2. **Merchant** - Creates advertising campaigns

---

## 📋 Method 1: Using Supabase Dashboard (Easiest - 2 minutes)

### Step 1: Open Supabase Table Editor

1. Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/editor
2. Click on the **`merchants`** table

### Step 2: Check if Merchant Already Exists

1. Look for a row with `business_email` = `demiroezkan205@gmail.com`
2. If it exists:
   - ✅ **Merchant already created!**
   - Just update: `status` → `approved`, `verified` → `true`
   - Skip to Step 4

### Step 3: Create New Merchant (If Doesn't Exist)

1. Click **"Insert"** button (top right)
2. Click **"Insert row"**
3. Fill in the form:
   ```
   id: [auto-generated - leave empty]
   user_id: [leave NULL/empty - very important!]
   company_name: Demir Company
   business_email: demiroezkan205@gmail.com
   phone: [optional]
   website: [optional]
   vat_id: [optional]
   business_address: [optional]
   status: approved
   verified: true
   created_at: [auto-generated - leave empty]
   updated_at: [auto-generated - leave empty]
   ```
4. Click **"Save"**

### Step 4: Verify Merchant Was Created

1. Go back to `merchants` table
2. Find row with `business_email` = `demiroezkan205@gmail.com`
3. Verify:
   - ✅ `status` = `approved`
   - ✅ `verified` = `true`
   - ✅ `user_id` = `NULL` (this is correct!)

### Step 5: Test the Login

1. Go to: http://localhost:3000/login
2. Enter credentials:
   - Email: `demiroezkan205@gmail.com`
   - Password: (same password used for mobile app)
3. Click "Anmelden"
4. Should redirect to `/campaigns` dashboard ✅

---

## 📋 Method 2: Using SQL Script (Advanced)

### Step 1: Run the SQL Script

1. Open Supabase SQL Editor:
   - Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new

2. Copy and paste this SQL:

```sql
-- Create merchant profile for existing user
INSERT INTO public.merchants (
    business_email,
    company_name,
    status,
    verified,
    created_at,
    updated_at
) VALUES (
    'demiroezkan205@gmail.com',
    'Demir Company',
    'approved',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (business_email) DO UPDATE SET
    status = 'approved',
    verified = true,
    updated_at = NOW();

-- Verify it was created
SELECT 
    id,
    company_name,
    business_email,
    status,
    verified
FROM public.merchants 
WHERE business_email = 'demiroezkan205@gmail.com';
```

3. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 2: Check Results

You should see output like:
```
id: [some-uuid]
company_name: Demir Company
business_email: demiroezkan205@gmail.com
status: approved
verified: true
```

### Step 3: Test Login

Same as Method 1, Step 5 above.

---

## 🔍 Verification Checklist

After completing either method, verify:

### In Supabase Dashboard:

1. **Check `auth.users` table:**
   - ✅ User exists with email `demiroezkan205@gmail.com`

2. **Check `public.users` table:**
   - ✅ User exists (mobile app profile)

3. **Check `public.merchants` table:**
   - ✅ Merchant exists with `business_email` = `demiroezkan205@gmail.com`
   - ✅ `user_id` = NULL (this is correct!)
   - ✅ `status` = 'approved'
   - ✅ `verified` = true

### In Merchant Portal:

1. **Login works:**
   - ✅ Can log in at http://localhost:3000/login

2. **Dashboard displays:**
   - ✅ Shows "Demir Company" at the top
   - ✅ Shows email: demiroezkan205@gmail.com
   - ✅ Shows green "Account genehmigt" banner
   - ✅ "Neue Kampagne" button is visible

3. **Mobile app still works:**
   - ✅ User can still use mobile app normally
   - ✅ Can watch ads and earn rewards
   - ✅ Profile data unchanged

---

## 🎨 Customize Company Name (Optional)

If you want to change the company name:

1. Go to Supabase Dashboard → Table Editor → `merchants`
2. Find the merchant row
3. Click to edit
4. Change `company_name` to whatever you want
5. Save

---

## 🏗️ Architecture Explanation

### How Dual Roles Work

```
demiroezkan205@gmail.com
│
├─ auth.users (Supabase Auth)
│  └─ Single authentication account
│
├─ public.users (Mobile App Profile)
│  ├─ User preferences
│  ├─ Interests
│  ├─ Demographics
│  └─ Onboarding status
│
└─ public.merchants (Merchant Profile)
   ├─ Company name
   ├─ Business info
   └─ Campaign management
```

### Why `user_id` is NULL

- Mobile app users: `user_id` references `public.users.id`
- Merchants: Don't need `user_id` because they're identified by `business_email`
- This cleanly separates the two roles

### Login Flow

**Same email, same password, different portals:**

1. **Mobile App Login:**
   - Authenticates via Supabase Auth
   - Loads profile from `public.users`
   - Shows consumer features (watch ads, earn rewards)

2. **Merchant Portal Login:**
   - Authenticates via Supabase Auth (same credentials!)
   - Loads profile from `public.merchants` (by email)
   - Shows business features (create campaigns, view analytics)

---

## 🚨 Important Notes

### Security
- ✅ Both roles use the same Supabase Auth account
- ✅ RLS policies ensure data isolation
- ✅ Merchants can only see their own campaigns
- ✅ Users can only see their own ad history

### Data Integrity
- ✅ Mobile app data unaffected
- ✅ Rewards and ad views preserved
- ✅ User preferences unchanged
- ✅ No data conflicts

### Reversibility
To remove merchant access (but keep mobile app access):
```sql
DELETE FROM public.merchants 
WHERE business_email = 'demiroezkan205@gmail.com';
```

---

## 🎉 Success!

Once completed, `demiroezkan205@gmail.com` can:

1. **Use Mobile App:**
   - Open the app
   - Watch ads
   - Earn rewards
   - View history
   - Manage profile

2. **Use Merchant Portal:**
   - Go to http://localhost:3000/login
   - Create campaigns
   - Set budgets and targeting
   - View campaign analytics
   - Manage business info

**Same login, two powerful platforms!** 🚀

---

## 📞 Troubleshooting

### "Merchant not found" after login
→ Check that merchant exists in `public.merchants` table

### Can't create campaigns
→ Verify `status` = 'approved' and `verified` = true

### Mobile app stopped working
→ Shouldn't happen! Mobile app is completely independent. Check `public.users` table.

### Want to test both roles
→ Use mobile app on phone/emulator, merchant portal in browser

---

**Created:** January 10, 2026  
**Status:** ✅ Ready to execute  
**Time Required:** 2-5 minutes
