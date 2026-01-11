-- RLS Policies for campaigns table
-- This ensures merchants can only create/manage their own campaigns

-- Enable RLS on campaigns table (if not already enabled)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Merchants can insert own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Merchants can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Merchants can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Merchants can delete own campaigns" ON campaigns;

-- Policy: Merchants can insert campaigns for their own merchant_id
-- This policy checks that the merchant_id belongs to a merchant with matching email
CREATE POLICY "Merchants can insert own campaigns" ON campaigns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = campaigns.merchant_id
      AND (
        merchants.business_email = auth.jwt()->>'email'
        OR merchants.auth_user_id = auth.uid()
      )
    )
  );

-- Policy: Merchants can view their own campaigns
CREATE POLICY "Merchants can view own campaigns" ON campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = campaigns.merchant_id
      AND (
        merchants.business_email = auth.jwt()->>'email'
        OR merchants.auth_user_id = auth.uid()
      )
    )
  );

-- Policy: Merchants can update their own campaigns
CREATE POLICY "Merchants can update own campaigns" ON campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = campaigns.merchant_id
      AND (
        merchants.business_email = auth.jwt()->>'email'
        OR merchants.auth_user_id = auth.uid()
      )
    )
  );

-- Policy: Merchants can delete their own campaigns
CREATE POLICY "Merchants can delete own campaigns" ON campaigns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = campaigns.merchant_id
      AND (
        merchants.business_email = auth.jwt()->>'email'
        OR merchants.auth_user_id = auth.uid()
      )
    )
  );

-- Also allow users (mobile app users) to view active campaigns
DROP POLICY IF EXISTS "Users can view active campaigns" ON campaigns;
CREATE POLICY "Users can view active campaigns" ON campaigns
  FOR SELECT
  USING (status = 'active');
