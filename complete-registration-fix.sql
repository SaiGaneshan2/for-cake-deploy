-- =====================================================
-- COMPLETE FIX FOR REGISTRATION ERROR
-- This addresses all potential issues with the trigger
-- =====================================================

-- Step 1: Ensure the teachers table exists
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  school_name TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);

-- Step 3: Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can update own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.teachers;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.teachers;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.teachers;

CREATE POLICY "Users can view own profile" 
  ON public.teachers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.teachers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.teachers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
  ON public.teachers FOR DELETE
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service role to insert (needed for trigger)
CREATE POLICY "Enable insert for service role"
  ON public.teachers FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Step 5: Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_teacher() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the teacher profile
  INSERT INTO public.teachers (user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Error creating teacher profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 6: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_teacher();

-- Step 7: Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.teachers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 8: Verify everything is set up correctly
SELECT 
  'Trigger exists: ' || COUNT(*)::text as trigger_status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'Teachers table exists: ' || COUNT(*)::text as table_status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'teachers';

SELECT 
  'RLS enabled: ' || (SELECT row_security::text FROM pg_tables WHERE tablename = 'teachers')
FROM pg_tables WHERE tablename = 'teachers';
