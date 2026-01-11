-- Add auth_user_id column to merchants table
-- This links merchants to their auth.users account

-- 1. Add auth_user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.merchants 
        ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added auth_user_id column to merchants table';
    ELSE
        RAISE NOTICE 'auth_user_id column already exists';
    END IF;
END $$;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id 
ON public.merchants(auth_user_id);

-- 3. Update existing merchants to link with auth.users by email
-- This is safe because business_email is unique
UPDATE public.merchants m
SET auth_user_id = (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = m.business_email
)
WHERE auth_user_id IS NULL 
  AND business_email IS NOT NULL;

-- 4. Verify the update
SELECT 
    id,
    auth_user_id,
    company_name,
    business_email,
    status,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Linked'
        ELSE '⚠️ Not linked'
    END as link_status
FROM public.merchants
ORDER BY created_at DESC;

-- 5. Show summary
SELECT 
    COUNT(*) as total_merchants,
    COUNT(auth_user_id) as linked_merchants,
    COUNT(*) - COUNT(auth_user_id) as unlinked_merchants
FROM public.merchants;
