-- =====================================================
-- COMPLETE DATABASE RESET AND SETUP
-- Run this to start fresh!
-- =====================================================

-- =====================================================
-- STEP 1: DELETE EVERYTHING (Clean Slate)
-- =====================================================

-- Drop all existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_teacher() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS auto_confirm_user() CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can update own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.teachers;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.teachers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teachers;

-- Drop the table
DROP TABLE IF EXISTS public.teachers CASCADE;

-- =====================================================
-- STEP 2: CREATE TEACHERS TABLE (Simple Version)
-- =====================================================

CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_email ON public.teachers(email);

-- =====================================================
-- STEP 3: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.teachers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.teachers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.teachers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.teachers
  FOR DELETE
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service role (for triggers)
CREATE POLICY "Enable insert for service role"
  ON public.teachers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STEP 4: CREATE TRIGGER TO AUTO-CREATE TEACHER PROFILE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert teacher profile when user signs up
  INSERT INTO public.teachers (user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block signup
  RAISE LOG 'Failed to create teacher profile for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_teacher();

-- =====================================================
-- STEP 5: AUTO-UPDATE updated_at TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant schema access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.teachers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT SELECT ON public.teachers TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- STEP 7: AUTO-CONFIRM ALL USERS (FOR DEVELOPMENT)
-- =====================================================

-- Confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Create function to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-confirm email when user is created
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$;

-- Create trigger to auto-confirm
DROP TRIGGER IF EXISTS auto_confirm_users_trigger ON auth.users;
CREATE TRIGGER auto_confirm_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- =====================================================
-- STEP 8: VERIFICATION
-- =====================================================

-- Check if table exists
SELECT 
  'Teachers table created: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'teachers'
  ) THEN 'YES ✅' ELSE 'NO ❌' END AS table_status;

-- Check if trigger exists
SELECT 
  'Trigger created: ' || 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN 'YES ✅' ELSE 'NO ❌' END AS trigger_status;

-- Check RLS status
SELECT 
  'RLS enabled: ' || 
  CASE WHEN relrowsecurity THEN 'YES ✅' ELSE 'NO ❌' END AS rls_status
FROM pg_class
WHERE relname = 'teachers';

-- Count policies
SELECT 
  'Policies created: ' || COUNT(*) || ' ✅' AS policy_count
FROM pg_policies
WHERE tablename = 'teachers';

-- Show all users
SELECT 
  email,
  CASE WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED ✅' ELSE 'NOT CONFIRMED ❌' END AS status,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Show all teacher profiles
SELECT 
  email,
  full_name,
  school_name,
  created_at
FROM public.teachers
ORDER BY created_at DESC;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
