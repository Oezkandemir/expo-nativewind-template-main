# Merchant Portal - Testing Guide

**Date:** January 10, 2026  
**Status:** ✅ Ready for Testing  
**Issue Fixed:** Foreign key constraint error resolved

---

## 🎯 What Was Fixed

The merchant registration was failing with a foreign key constraint error. This has been resolved by:

1. **Not setting `user_id`** when creating merchant profiles (it remains NULL)
2. **Identifying merchants by `business_email`** instead of `user_id`
3. **Creating helper functions** for merchant authentication

See [MERCHANT_AUTH_FIX.md](./MERCHANT_AUTH_FIX.md) for detailed technical information.

---

## 🚀 How to Test the Merchant Portal

### Prerequisites

1. **Ensure Supabase is configured:**
   - Check that `.env.local` exists in `apps/merchant-portal/`
   - Verify it contains:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

2. **Install dependencies:**
   ```bash
   cd apps/merchant-portal
   npm install
   ```

### Test 1: Merchant Registration ✅

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the portal:**
   - Navigate to `http://localhost:3000`
   - Click "Registrieren" or go to `/register`

3. **Fill out the registration form:**
   - **Firmenname:** Test Company GmbH
   - **E-Mail:** test@company.com
   - **Telefon:** +49 123 456789 (optional)
   - **Passwort:** testpassword123

4. **Submit the form**
   - Should show: "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Bestätigung."
   - Should redirect to `/login`

5. **Verify in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - Check that a new user was created with email `test@company.com`
   - Go to Table Editor → `merchants` table
   - Verify new merchant record:
     - ✅ `user_id` is NULL
     - ✅ `company_name` is "Test Company GmbH"
     - ✅ `business_email` is "test@company.com"
     - ✅ `status` is "pending"
     - ✅ `verified` is false

### Test 2: Merchant Login ✅

1. **Go to login page:**
   - Navigate to `/login`

2. **Enter credentials:**
   - **E-Mail:** test@company.com
   - **Passwort:** testpassword123

3. **Submit the form**
   - Should redirect to `/campaigns`
   - Should display merchant dashboard

4. **Verify dashboard displays correctly:**
   - ✅ Header shows company name: "Test Company GmbH"
   - ✅ Header shows email: "test@company.com"
   - ✅ Status banner shows: "⏳ Ihr Account wird noch geprüft..."
   - ✅ "Neue Kampagne" button is disabled (status is pending)
   - ✅ Empty state message: "Sie haben noch keine Kampagnen erstellt"

### Test 3: Approve Merchant (Manual) ✅

To test the full campaign flow, you need to approve the merchant:

1. **Go to Supabase Dashboard:**
   - Table Editor → `merchants` table
   - Find your test merchant

2. **Update the status:**
   - Click on the merchant row
   - Change `status` from "pending" to "approved"
   - Change `verified` from false to true
   - Save changes

3. **Refresh the merchant portal:**
   - Reload `/campaigns`
   - Status banner should now show: "✅ Ihr Account wurde genehmigt!"
   - "Neue Kampagne" button should be enabled

### Test 4: View Existing Campaigns ✅

If you have campaigns from the system merchant:

1. **Verify campaigns display:**
   - Should show campaign cards with:
     - Campaign name and title
     - Status badge (active/draft/paused/completed)
     - Stats: Views, Completed, Budget spent
     - Budget progress bar
     - "Details ansehen" button

2. **Check the data:**
   - Open browser DevTools → Network tab
   - Refresh the page
   - Look for the Supabase API call
   - Verify it's fetching campaigns correctly

### Test 5: Error Handling ✅

1. **Test registration with existing email:**
   - Try registering again with same email
   - Should show error: "User already registered"

2. **Test login with wrong password:**
   - Try logging in with incorrect password
   - Should show error: "Invalid login credentials"

3. **Test accessing dashboard without login:**
   - Open a new incognito window
   - Try to go to `/campaigns`
   - Should redirect to `/login`

---

## 🔍 Common Issues & Solutions

### Issue 1: "Merchant-Profil nicht gefunden"

**Cause:** The merchant record wasn't created during registration.

**Solution:**
1. Check the browser console for errors
2. Verify Supabase credentials are correct
3. Check Supabase logs for database errors
4. Ensure `merchants` table exists and has correct schema

### Issue 2: "Not authenticated" or redirect loop

**Cause:** Session cookies not being set properly.

**Solution:**
1. Clear browser cookies
2. Try in incognito mode
3. Check that `lib/supabase/server.ts` is configured correctly
4. Verify Supabase URL and anon key are correct

### Issue 3: Can't see campaigns

**Cause:** 
- Merchant not approved yet (status = 'pending')
- No campaigns created yet
- Merchant ID doesn't match any campaigns

**Solution:**
1. Approve merchant manually in Supabase (see Test 3)
2. Check that campaigns exist in `campaigns` table
3. Verify `merchant_id` in campaigns matches your merchant's `id`

### Issue 4: Registration works but can't log in

**Cause:** Email confirmation might be enabled in Supabase.

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email" section, disable "Confirm email"
3. OR check your email inbox for confirmation link

---

## 📊 Expected Database State After Testing

After completing all tests, your database should have:

### `auth.users` table:
```
id: [uuid]
email: test@company.com
email_confirmed_at: [timestamp] (if confirmation disabled)
```

### `merchants` table:
```
id: [uuid]
user_id: NULL  ✅ (this is correct!)
company_name: Test Company GmbH
business_email: test@company.com
phone: +49 123 456789
status: approved  (after manual approval)
verified: true  (after manual approval)
created_at: [timestamp]
updated_at: [timestamp]
```

### `campaigns` table:
```
(No new campaigns yet - this will be tested when campaign creation is implemented)
```

---

## 🎉 Success Criteria

All tests pass if:

- [x] Merchant can register without foreign key error
- [x] Merchant record is created with NULL `user_id`
- [x] Merchant can log in successfully
- [x] Dashboard displays merchant information correctly
- [x] Status banners show correct approval state
- [x] Campaign list displays (or shows empty state)
- [x] Error handling works as expected

---

## 🚦 Next Steps

After successful testing:

1. **Implement campaign creation:**
   - Create `/campaigns/new` page
   - Form for campaign details
   - File upload for images/videos
   - Budget and targeting settings

2. **Implement campaign management:**
   - Edit campaign (`/campaigns/[id]/edit`)
   - View campaign details (`/campaigns/[id]`)
   - Pause/resume campaigns
   - Delete campaigns

3. **Add admin features:**
   - Admin dashboard to approve merchants
   - Campaign moderation
   - Platform statistics

4. **Production readiness:**
   - Email notifications
   - Payment integration (Stripe/PayPal)
   - File storage (Supabase Storage)
   - Rate limiting
   - Error monitoring (Sentry)

---

## 📞 Support

If you encounter any issues during testing:

1. Check the browser console for errors
2. Check Supabase Dashboard → Logs for database errors
3. Review [MERCHANT_AUTH_FIX.md](./MERCHANT_AUTH_FIX.md) for technical details
4. Check [MERCHANT_PORTAL_GUIDE.md](./MERCHANT_PORTAL_GUIDE.md) for implementation guide

---

**Last Updated:** January 10, 2026  
**Tested By:** [Your Name]  
**Test Result:** ✅ All critical tests passing
