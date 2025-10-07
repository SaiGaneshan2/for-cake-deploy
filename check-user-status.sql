-- Check the confirmation status of all users
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
