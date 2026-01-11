-- Add notification_time column to campaigns table
-- This allows admins to set preferred notification times for campaign notifications

-- Add notification_time column (TIME type, stores HH:MM format)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS notification_time TIME;

-- Add comment to explain the column
COMMENT ON COLUMN campaigns.notification_time IS 'Preferred time for sending push notifications about this campaign (HH:MM format)';

-- Create index for faster queries when filtering by notification time
CREATE INDEX IF NOT EXISTS idx_campaigns_notification_time 
ON campaigns(notification_time) 
WHERE notification_time IS NOT NULL;
