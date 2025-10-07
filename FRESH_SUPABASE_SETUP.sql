-- =====================================================
-- FRESH SUPABASE SETUP FOR TEACHER AUTHENTICATION
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE TEACHERS TABLE
-- =====================================================

CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_email ON public.teachers(email);

COMMENT ON TABLE public.teachers IS 'Teacher profiles linked to auth.users';

-- =====================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.teachers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.teachers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.teachers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.teachers
  FOR DELETE
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service role (needed for triggers to work)
CREATE POLICY "Service role can manage all profiles"
  ON public.teachers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 3: AUTO-CREATE TEACHER PROFILE TRIGGER
-- =====================================================

-- Function to automatically create teacher profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create teacher profile automatically
  INSERT INTO public.teachers (user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'Could not create teacher profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger fires after new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_teacher();

-- =====================================================
-- STEP 4: AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger updates updated_at when teacher profile is modified
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 5: AUTO-CONFIRM EMAIL (FOR DEVELOPMENT)
-- =====================================================

-- Function to auto-confirm user emails (skip email verification)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Automatically confirm email when user is created
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmation_token = NULL;
  NEW.confirmation_sent_at = NULL;
  RETURN NEW;
END;
$$;

-- Trigger to auto-confirm emails on signup
CREATE TRIGGER auto_confirm_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.teachers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT SELECT ON public.teachers TO anon;

-- Grant sequence permissions (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Verify table was created
SELECT 
  'Teachers table: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'teachers'
  ) THEN '✅ CREATED' ELSE '❌ NOT FOUND' END AS status;

-- Verify trigger was created
SELECT 
  'Profile creation trigger: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN '✅ CREATED' ELSE '❌ NOT FOUND' END AS status;

-- Verify auto-confirm trigger
SELECT 
  'Auto-confirm trigger: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'auto_confirm_users_trigger'
  ) THEN '✅ CREATED' ELSE '❌ NOT FOUND' END AS status;

-- Verify RLS is enabled
SELECT 
  'Row Level Security: ' || 
  CASE WHEN relrowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END AS status
FROM pg_class
WHERE relname = 'teachers';

-- Count policies
SELECT 
  'Security policies: ' || COUNT(*) || ' ✅' AS status
FROM pg_policies
WHERE tablename = 'teachers';

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'teachers'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- 
-- Your database is now ready for teacher authentication!
-- 
-- Next steps:
-- 1. Restart your dev server: npm run dev
-- 2. Go to: http://localhost:5174/teacher/register
-- 3. Register a new teacher account
-- 4. Login should work immediately (auto-confirmed)
-- 
-- =====================================================
