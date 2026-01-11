-- Script to convert an existing app user to a merchant
-- This creates a merchant profile for an existing user

-- 1. First, let's check if the user exists in auth.users and public.users
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    u.id as app_user_id,
    u.email as app_email,
    u.name as app_name
FROM auth.users au
LEFT JOIN public.users u ON u.email = au.email
WHERE au.email = 'demiroezkan205@gmail.com';

-- 2. Check if merchant already exists
SELECT * FROM public.merchants WHERE business_email = 'demiroezkan205@gmail.com';

-- 3. Create merchant profile for the existing user
-- Note: user_id stays NULL (as per our merchant auth architecture)
-- The user will use the same auth.users account for merchant portal
INSERT INTO public.merchants (
    business_email,
    company_name,
    status,
    verified,
    created_at,
    updated_at
) VALUES (
    'demiroezkan205@gmail.com',
    'Demir Company', -- You can change this
    'approved', -- Immediately approved
    true, -- Verified
    NOW(),
    NOW()
)
ON CONFLICT (business_email) DO UPDATE SET
    status = 'approved',
    verified = true,
    updated_at = NOW();

-- 4. Verify the merchant was created
SELECT 
    id,
    user_id,
    company_name,
    business_email,
    status,
    verified,
    created_at
FROM public.merchants 
WHERE business_email = 'demiroezkan205@gmail.com';

-- 5. Show summary
SELECT 
    'User can now:' as info,
    '1. Continue using mobile app as regular user' as mobile_app,
    '2. Log in to merchant portal at localhost:3000/login' as merchant_portal,
    '3. Create and manage campaigns' as capabilities;
