#!/usr/bin/env node

/**
 * Quick SQL Script to check and clean invalid campaigns for user "demir"
 * 
 * Run these SQL queries in your Supabase SQL Editor:
 */

-- =====================================================
-- STEP 1: Find user "demir"
-- =====================================================

SELECT id, email, name 
FROM users 
WHERE email ILIKE '%demir%';

-- Copy the user ID from the result above and use it in the queries below
-- Replace 'YOUR_USER_ID_HERE' with the actual ID


-- =====================================================
-- STEP 2: Check all ad_views for this user
-- =====================================================

SELECT 
  av.id,
  av.campaign_id,
  av.viewed_at,
  av.completed,
  av.reward_earned,
  -- Check if campaign_id is valid
  CASE 
    WHEN av.campaign_id IN (
      'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
      'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
    ) THEN '✅ Valid'
    ELSE '❌ INVALID'
  END as status
FROM ad_views av
WHERE av.user_id = 'YOUR_USER_ID_HERE'
ORDER BY av.viewed_at DESC;


-- =====================================================
-- STEP 3: Find ONLY invalid campaigns
-- =====================================================

SELECT 
  av.id,
  av.campaign_id,
  av.viewed_at,
  av.completed,
  av.reward_earned
FROM ad_views av
WHERE av.user_id = 'YOUR_USER_ID_HERE'
  AND av.campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  )
ORDER BY av.viewed_at DESC;


-- =====================================================
-- STEP 4A: DELETE invalid campaigns (WITH rewards)
-- =====================================================
-- ⚠️ WARNING: This will permanently delete the data!
-- Run STEP 3 first to see what will be deleted!

-- First delete associated rewards
DELETE FROM rewards
WHERE ad_view_id IN (
  SELECT av.id
  FROM ad_views av
  WHERE av.user_id = 'YOUR_USER_ID_HERE'
    AND av.campaign_id NOT IN (
      'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
      'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
    )
);

-- Then delete the ad_views
DELETE FROM ad_views
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  );


-- =====================================================
-- STEP 4B: UPDATE invalid campaign_id to a valid one
-- =====================================================
-- Alternative: Fix the campaign_id instead of deleting

-- Update to 'campaign_1' (Tech Campaign)
UPDATE ad_views
SET campaign_id = 'campaign_1'
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND campaign_id NOT IN (
    'campaign_1', 'campaign_2', 'campaign_3', 'campaign_4', 'campaign_5',
    'campaign_6', 'campaign_7', 'campaign_8', 'campaign_9', 'campaign_10'
  );


-- =====================================================
-- STEP 5: Verify the cleanup
-- =====================================================

SELECT 
  av.campaign_id,
  COUNT(*) as count,
  SUM(av.reward_earned) as total_rewards
FROM ad_views av
WHERE av.user_id = 'YOUR_USER_ID_HERE'
GROUP BY av.campaign_id
ORDER BY av.campaign_id;


-- =====================================================
-- Valid Campaign IDs Reference:
-- =====================================================
-- campaign_1  - Tech Campaign
-- campaign_2  - Fitness Campaign
-- campaign_3  - Fashion Campaign
-- campaign_4  - Food Campaign
-- campaign_5  - Travel Campaign
-- campaign_6  - Audio Campaign
-- campaign_7  - Wellness Campaign
-- campaign_8  - Automotive Campaign
-- campaign_9  - Beverage Campaign
-- campaign_10 - Luxury Campaign
