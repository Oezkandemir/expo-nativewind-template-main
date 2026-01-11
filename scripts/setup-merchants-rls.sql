-- RLS Policies for merchants table
-- This ensures merchants can only access their own data

-- Enable RLS on merchants table (if not already enabled)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Merchants can insert own profile" ON merchants;
DROP POLICY IF EXISTS "Merchants can view own data" ON merchants;
DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;
DROP POLICY IF EXISTS "Public can insert merchants during registration" ON merchants;

-- Policy: Allow merchants to view their own data
-- This checks if the business_email matches the authenticated user's email
CREATE POLICY "Merchants can view own data" ON merchants
  FOR SELECT
  USING (
    business_email = auth.jwt()->>'email'
    OR auth_user_id = auth.uid()
  );

-- Policy: Allow merchants to update their own data
CREATE POLICY "Merchants can update own data" ON merchants
  FOR UPDATE
  USING (
    business_email = auth.jwt()->>'email'
    OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    business_email = auth.jwt()->>'email'
    OR auth_user_id = auth.uid()
  );

-- Policy: Allow authenticated users to insert their own merchant profile during registration
-- This allows new merchants to create their profile after signing up
-- Note: The API route uses service role key to bypass this, but this policy
-- allows direct inserts if needed
CREATE POLICY "Merchants can insert own profile" ON merchants
  FOR INSERT
  WITH CHECK (
    business_email = auth.jwt()->>'email'
    OR auth_user_id = auth.uid()
  );

-- Note: For registration, we use the API route with service role key
-- which bypasses RLS. This policy is a fallback for direct inserts.
