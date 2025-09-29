-- Disable email confirmation for development
-- Run this SQL in your Supabase SQL Editor

-- This will allow users to sign in immediately after registration without email confirmation

-- Update auth.users to confirm all existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Note: You can also disable email confirmation in the Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Scroll down to "User Signups" section
-- 3. Turn OFF "Enable email confirmations"
-- 4. Click "Save"

-- Alternative: If you want to keep email confirmation enabled but auto-confirm specific test users
-- You can manually confirm specific test accounts:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'your-test-email@example.edu';