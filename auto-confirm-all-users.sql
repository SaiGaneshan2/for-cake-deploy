-- ============================================
-- CONFIRM ALL USERS (AUTOMATICALLY)
-- ============================================
-- This will confirm all existing AND future users
-- Run this once and all users will be confirmed!

-- Step 1: Confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL
WHERE email_confirmed_at IS NULL;

-- Step 2: Create a trigger to auto-confirm future users
-- This will automatically confirm any new user that registers!

CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set email as confirmed when user is created
  NEW.email_confirmed_at = NOW();
  NEW.confirmation_token = NULL;
  NEW.confirmation_sent_at = NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS auto_confirm_users_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER auto_confirm_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Step 3: Verify all users are confirmed
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED ✅'
    ELSE 'NOT CONFIRMED ❌'
  END as status,
  created_at
FROM auth.users
ORDER BY created_at DESC;
