-- -- 1. Crea-- 1. Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  quiz_title VARCHAR(255),
  teacher_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  quiz_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);ssions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  quiz_title VARCHAR(255),
  teacher_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  quiz_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);Database Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Create quiz_sessions table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  quiz_title VARCHAR(255),
  teacher_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for quiz_sessions (skip if already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'quiz_sessions' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies (drop if exists, then create)
DROP POLICY IF EXISTS "Teachers can manage their sessions" ON quiz_sessions;
CREATE POLICY "Teachers can manage their sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Anyone can read active sessions" ON quiz_sessions;
CREATE POLICY "Anyone can read active sessions" ON quiz_sessions
  FOR SELECT USING (is_active = true);

-- 2. Create students_in_session table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS students_in_session (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  level_progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_room_code' AND table_name = 'students_in_session'
    ) THEN
        ALTER TABLE students_in_session 
        ADD CONSTRAINT fk_room_code 
        FOREIGN KEY (room_code) REFERENCES quiz_sessions(room_code) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS for students_in_session (skip if already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'students_in_session' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE students_in_session ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies (drop if exists, then create)
DROP POLICY IF EXISTS "Anyone can read students in active sessions" ON students_in_session;
CREATE POLICY "Anyone can read students in active sessions" ON students_in_session
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE quiz_sessions.room_code = students_in_session.room_code 
      AND quiz_sessions.is_active = true
    )
  );

DROP POLICY IF EXISTS "Students can insert themselves" ON students_in_session;
CREATE POLICY "Students can insert themselves" ON students_in_session
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Students can update their own progress" ON students_in_session;
CREATE POLICY "Students can update their own progress" ON students_in_session
  FOR UPDATE USING (true);

-- 3. Create student_overall_scores table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS student_overall_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(100) UNIQUE NOT NULL,
  total_score INTEGER DEFAULT 0,
  num_quizzes_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for student_overall_scores (skip if already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'student_overall_scores' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE student_overall_scores ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies (drop if exists, then create)
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON student_overall_scores;
CREATE POLICY "Anyone can read leaderboard" ON student_overall_scores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can update scores" ON student_overall_scores;
CREATE POLICY "System can update scores" ON student_overall_scores
  FOR ALL USING (true);

-- 4. Insert some demo data for testing
INSERT INTO quiz_sessions (room_code, quiz_title, is_active) VALUES 
('ABC123', 'Math Quiz - Grade 5', true),
('XYZ789', 'Science Quiz - Biology', true);

INSERT INTO student_overall_scores (student_name, total_score, num_quizzes_completed) VALUES 
('Alice Johnson', 850, 5),
('Bob Smith', 720, 4),
('Carol Davis', 910, 6),
('David Wilson', 680, 3),
('Emma Brown', 790, 4);