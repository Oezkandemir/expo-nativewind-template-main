-- Diagnostic script for demiroezkan205@gmail.com login issue
-- Run this in Supabase SQL Editor to see the full picture

-- 1. Check if user exists in auth.users
SELECT 
    'AUTH USERS CHECK' as section,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
        ELSE '✅ Email confirmed'
    END as email_status
FROM auth.users 
WHERE email = 'demiroezkan205@gmail.com';

-- 2. Check if user exists in public.users (mobile app)
SELECT 
    'PUBLIC USERS CHECK' as section,
    id,
    email,
    name,
    onboarding_complete,
    created_at
FROM public.users 
WHERE email = 'demiroezkan205@gmail.com';

-- 3. Check if merchant exists
SELECT 
    'MERCHANTS CHECK' as section,
    id,
    user_id,
    company_name,
    business_email,
    status,
    verified,
    created_at
FROM public.merchants 
WHERE business_email = 'demiroezkan205@gmail.com';

-- 4. Summary
SELECT 
    'SUMMARY' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demiroezkan205@gmail.com') 
        THEN '✅ Auth account exists'
        ELSE '❌ No auth account - user never registered'
    END as auth_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'demiroezkan205@gmail.com' AND email_confirmed_at IS NOT NULL) 
        THEN '✅ Email confirmed'
        ELSE '⚠️ Email not confirmed - this blocks login'
    END as confirmation_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.merchants WHERE business_email = 'demiroezkan205@gmail.com') 
        THEN '✅ Merchant profile exists'
        ELSE '❌ No merchant profile'
    END as merchant_status;
