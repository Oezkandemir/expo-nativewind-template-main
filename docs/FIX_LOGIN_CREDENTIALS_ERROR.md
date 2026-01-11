# Fix Login Issue for demiroezkan205@gmail.com

**Error:** `AuthApiError: Invalid login credentials`  
**Status:** Login failing at merchant portal

---

## 🎯 **Quick Fixes (Try These in Order)**

### Fix 1: Confirm Email Manually (Most Common Issue)

**The Problem:** Email confirmation is likely blocking login.

**The Solution:**

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
   ```

2. **Find the user:**
   - Look for `demiroezkan205@gmail.com` in the users list

3. **Check email status:**
   - If you see `email_confirmed_at: null` → Email NOT confirmed ❌
   - If you see a date → Email already confirmed ✅

4. **Manually confirm the email:**
   - Click on the user row
   - Look for "Confirm Email" button or link
   - Click it
   - You should see `email_confirmed_at` get a timestamp

5. **Try logging in again** at http://localhost:3000/login

---

### Fix 2: Reset Password

**If Fix 1 didn't work, the password might be wrong.**

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
   ```

2. **Find your user** (demiroezkan205@gmail.com)

3. **Click on the user**

4. **Look for "Reset Password" or similar option**

5. **Set a new password:**
   - Choose a simple password for testing: `password123`
   - Save it

6. **Try logging in again:**
   - Email: demiroezkan205@gmail.com
   - Password: password123

---

### Fix 3: Check Account Exists

**Run diagnostic to see what's wrong:**

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new
   ```

2. **Copy and paste this:**
   ```sql
   -- Check all aspects of the account
   SELECT 
       'AUTH' as type,
       id,
       email,
       email_confirmed_at,
       created_at
   FROM auth.users 
   WHERE email = 'demiroezkan205@gmail.com'
   
   UNION ALL
   
   SELECT 
       'MERCHANT' as type,
       id::text,
       business_email,
       NULL as email_confirmed_at,
       created_at
   FROM public.merchants 
   WHERE business_email = 'demiroezkan205@gmail.com';
   ```

3. **Click "Run"**

4. **Check results:**
   - If AUTH row exists: User is registered ✅
   - If email_confirmed_at is NULL: Email needs confirmation ⚠️
   - If MERCHANT row exists: Merchant profile created ✅
   - If no AUTH row: User never registered ❌ (skip to Fix 4)

---

### Fix 4: Create Account From Scratch

**If the account doesn't exist at all:**

1. **Confirm user doesn't exist:**
   - Run diagnostic from Fix 3
   - If no AUTH row appears → Account doesn't exist

2. **Register fresh:**
   - Go to: http://localhost:3000/register
   - Fill in form:
     - Company: Demir Company
     - Email: demiroezkan205@gmail.com
     - Password: password123
   - Submit

3. **Immediately confirm email:**
   - Go to Supabase Dashboard → Auth → Users
   - Find your user
   - Click "Confirm Email"

4. **Try logging in**

---

## 🔧 **Advanced: Direct SQL Fixes**

### If you want to do everything via SQL:

**Complete Fix Script (Run all at once):**

```sql
-- Step 1: Confirm email if user exists
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'demiroezkan205@gmail.com' 
  AND email_confirmed_at IS NULL;

-- Step 2: Create merchant profile if doesn't exist
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
ON CONFLICT (business_email) 
DO UPDATE SET
    status = 'approved',
    verified = true,
    updated_at = NOW();

-- Step 3: Verify everything is correct
SELECT 
    'Status' as check_type,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
        ELSE '❌ Email NOT confirmed'
    END as auth_status,
    CASE 
        WHEN m.status = 'approved' THEN '✅ Merchant approved'
        ELSE '⚠️ Merchant pending'
    END as merchant_status
FROM auth.users au
LEFT JOIN public.merchants m ON m.business_email = au.email
WHERE au.email = 'demiroezkan205@gmail.com';
```

---

## 🎬 **Step-by-Step Visual Guide**

### Method A: Via Supabase Dashboard (No SQL needed)

1. **Go to Authentication:**
   - Dashboard → Authentication → Users
   - Find: demiroezkan205@gmail.com

2. **Click on the user row**

3. **You should see a user detail panel with:**
   - User ID
   - Email
   - Created date
   - Email confirmed date

4. **Look for these buttons/links:**
   - "Confirm Email" → **Click this!**
   - "Send Password Reset Email" → Use if password is wrong
   - "Update User" → Can set new password directly

5. **Confirm the email:**
   - Click "Confirm Email"
   - Status should change from "unconfirmed" to "confirmed"

6. **Try login again:**
   - http://localhost:3000/login
   - Email: demiroezkan205@gmail.com
   - Password: (your password)

---

## 🐛 **Common Issues & Solutions**

### Issue: "User not found"
**Solution:** User never registered. Go to `/register` and create account.

### Issue: "Email not confirmed"
**Solution:** Follow Fix 1 above - manually confirm in Supabase.

### Issue: "Wrong password"
**Solution:** Follow Fix 2 above - reset password in Supabase.

### Issue: "Can login but see 'Merchant not found'"
**Solution:** Merchant profile doesn't exist. Run this SQL:
```sql
INSERT INTO public.merchants (
    business_email, company_name, status, verified
) VALUES (
    'demiroezkan205@gmail.com', 'Demir Company', 'approved', true
);
```

### Issue: "Invalid login credentials" persists
**Checklist:**
1. ✅ Email is confirmed in auth.users
2. ✅ Using correct password
3. ✅ No typos in email
4. ✅ Account actually exists in auth.users
5. ✅ Try incognito mode (clear cache)

---

## 🎯 **Recommended Solution (Fastest)**

Based on the error, here's what I recommend:

### **Do This Now (2 minutes):**

1. **Open:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users

2. **Find:** demiroezkan205@gmail.com

3. **If user exists:**
   - Click on it
   - Click "Confirm Email" 
   - Set a test password: `Test123456`
   - Save

4. **If user doesn't exist:**
   - Go to http://localhost:3000/register
   - Register with:
     - Email: demiroezkan205@gmail.com
     - Password: Test123456
     - Company: Demir Company
   - Then immediately confirm email in Supabase (step 3 above)

5. **Create merchant profile:**
   - Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/sql/new
   - Run:
     ```sql
     INSERT INTO public.merchants (
         business_email, company_name, status, verified
     ) VALUES (
         'demiroezkan205@gmail.com', 'Demir Company', 'approved', true
     )
     ON CONFLICT (business_email) DO NOTHING;
     ```

6. **Login:**
   - Go to: http://localhost:3000/login
   - Email: demiroezkan205@gmail.com
   - Password: Test123456

**This should work!** ✅

---

## 📞 **Still Not Working?**

If login still fails after all fixes:

### Debug Steps:

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Try logging in**
4. **Look for errors**
5. **Take a screenshot of:**
   - The error message
   - Network tab (filter by "auth")
   - Console errors

### Check Database State:

Run the diagnostic script:
```bash
cat scripts/diagnose-login-issue.sql
```

Copy it into Supabase SQL Editor and run it. Share the results.

---

## ✅ **Success Criteria**

Login is successful when:
- ✅ No error in browser console
- ✅ Redirects from `/login` to `/campaigns`
- ✅ Dashboard shows "Demir Company"
- ✅ Can see campaigns page
- ✅ "Neue Kampagne" button visible

---

**Created:** January 10, 2026  
**Issue:** Invalid login credentials  
**Most Likely Cause:** Email not confirmed  
**Quick Fix:** Manually confirm email in Supabase Dashboard
