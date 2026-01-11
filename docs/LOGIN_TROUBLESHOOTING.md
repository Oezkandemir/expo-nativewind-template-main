# 🔧 Login Issues Troubleshooting

## Issue: "Duplicate key value violates unique constraint"

### What This Means
✅ **Good news!** Your registration was **successful** the first time.  
❌ You're getting this error because you're trying to register again with the same email.

### Quick Fix: Just Log In
1. Go to: http://localhost:3000/login
2. Enter your credentials:
   - **Email:** demiroezkan205@gmail.com
   - **Password:** (the password you used when registering)
3. Click "Anmelden"

**You should be able to log in immediately!**

---

## Issue: "Email not confirmed" or Can't Log In

If you're seeing an error about email confirmation, or the login isn't working:

### Fix 1: Manually Confirm in Supabase (2 minutes)

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
   ```

2. **Find your user:**
   - Look for: `demiroezkan205@gmail.com`
   - You should see a row with your email

3. **Confirm the email:**
   - Click on the user row
   - If there's a "Confirm Email" button → Click it
   - If `email_confirmed_at` has a date → Already confirmed! ✅

4. **Try logging in again**

### Fix 2: Disable Email Confirmation (For Development)

1. **Go to Supabase Settings:**
   ```
   https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/providers
   ```

2. **Find Email settings:**
   - Scroll to "Email" section
   - Look for "Confirm email" toggle
   - Set it to **OFF** (disabled)

3. **Save and try logging in again**

### Fix 3: Check Email Spam Folder

Sometimes the confirmation email goes to spam:
- Check spam/junk folder
- Look for email from: `noreply@mail.app.supabase.io`
- Subject: "Confirm Your Email" or similar
- Click the confirmation link

---

## Issue: Forgot Password

If you don't remember your password:

### Option A: Use Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
2. Find your user (demiroezkan205@gmail.com)
3. Click on it
4. You can manually set a new password there

### Option B: Implement Password Reset (Not Yet Available)
Password reset functionality is not yet implemented in the merchant portal.  
Use Option A above to manually reset your password.

---

## Issue: Wrong Password

If you're sure your email is confirmed but login fails:

1. **Check your password carefully:**
   - Passwords are case-sensitive
   - Check if Caps Lock is on
   - Make sure there are no extra spaces

2. **Reset password in Supabase:**
   - Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
   - Click on your user
   - Set a new password

---

## Quick Reference

### Your Account Details
- **Email:** demiroezkan205@gmail.com
- **Status:** Already registered ✅
- **Action:** Just log in, don't register again

### Links
- **Login:** http://localhost:3000/login
- **Supabase Users:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
- **Supabase Settings:** https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/providers

### Merchant Approval
After logging in successfully, you'll see:
- ⏳ "Ihr Account wird noch geprüft" (pending status)

To approve your merchant account:
1. Go to: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/editor
2. Open table: `merchants`
3. Find your merchant (business_email = demiroezkan205@gmail.com)
4. Edit the row:
   - Change `status` from "pending" to "approved"
   - Change `verified` from false to true
5. Save
6. Refresh the merchant portal

Now you can create campaigns! 🎉

---

## Still Having Issues?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in again
4. Look for any error messages
5. Share the error message for more help

### Verify Database State
1. Go to Supabase Dashboard
2. Table Editor → `merchants` table
3. Check if your merchant exists:
   - business_email = demiroezkan205@gmail.com
   - If it exists → You're registered! ✅
   - If not → Contact support

### Clear Cookies & Cache
Sometimes old session data causes issues:
1. Open browser settings
2. Clear cookies and cache for localhost:3000
3. Close and reopen the browser
4. Try logging in again

---

## Summary

**Most Common Fix:**
Your account already exists! Just go to `/login` and enter your credentials.

**If Login Fails:**
Manually confirm email in Supabase Dashboard (see Fix 1 above).

**Need to Reset Password:**
Use Supabase Dashboard to set a new password (see "Forgot Password" section).

---

**Last Updated:** January 10, 2026  
**Your Status:** ✅ Already registered, ready to log in!
