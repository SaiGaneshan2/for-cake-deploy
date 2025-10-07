-- =====================================================
-- SUPABASE AUTHENTICATION TABLES SETUP
-- For Teacher Authentication System
-- =====================================================

-- =====================================================
-- 1. TEACHERS PROFILE TABLE
-- Stores additional information about teachers
-- Links to auth.users via user_id
-- =====================================================

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  school_name TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one profile per auth user
  CONSTRAINT teachers_user_id_key UNIQUE (user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- =====================================================

-- Enable Row Level Security
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

-- =====================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- Automatically creates a teacher profile when user signs up
-- =====================================================

-- Function to create teacher profile
CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_teacher();

-- =====================================================
-- 4. UPDATED_AT TIMESTAMP TRIGGER
-- Automatically updates the updated_at field
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. HELPFUL VIEWS (OPTIONAL)
-- Makes it easier to query teacher data
-- =====================================================

-- View combining auth.users and teachers profile
CREATE OR REPLACE VIEW public.teachers_with_auth AS
SELECT 
  t.id,
  t.user_id,
  t.email,
  t.full_name,
  t.school_name,
  t.subject,
  t.created_at,
  t.updated_at,
  u.email_confirmed_at,
  u.last_sign_in_at,
  u.created_at as auth_created_at
FROM public.teachers t
LEFT JOIN auth.users u ON t.user_id = u.id;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- Ensures authenticated users can access the tables
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.teachers TO authenticated;
GRANT SELECT ON public.teachers_with_auth TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- =====================================================

-- Check if teachers table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'teachers';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'teachers';

-- Check triggers
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'teachers';

-- View all teachers (run after some users sign up)
-- SELECT * FROM public.teachers;

-- View teachers with auth data
-- SELECT * FROM public.teachers_with_auth;

-- =====================================================
-- NOTES:
-- 1. auth.users is managed by Supabase - DO NOT modify it
-- 2. The trigger automatically creates a teacher profile on signup
-- 3. RLS policies ensure users can only see their own data
-- 4. You can add more fields to the teachers table as needed
-- =====================================================
