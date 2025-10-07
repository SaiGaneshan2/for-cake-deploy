-- Quiz Game Database Setup - Updated Version
-- Run these commands in your Supabase SQL Editor

-- 1. Add quiz_data column to existing quiz_sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_sessions' AND column_name = 'quiz_data') THEN
    ALTER TABLE quiz_sessions ADD COLUMN quiz_data JSONB;
  END IF;
END $$;

-- 2. Create quiz_sessions table (IF NOT EXISTS) with quiz_data
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  quiz_title VARCHAR(255),
  teacher_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  quiz_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for quiz_sessions
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can manage their sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Anyone can read active sessions" ON quiz_sessions;

CREATE POLICY "Teachers can manage their sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can read active sessions" ON quiz_sessions
  FOR SELECT USING (is_active = true);

-- 3. Create students_in_session table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS students_in_session (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  level_progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'students_in_session' AND constraint_name = 'fk_room_code') THEN
    ALTER TABLE students_in_session 
    ADD CONSTRAINT fk_room_code 
    FOREIGN KEY (room_code) REFERENCES quiz_sessions(room_code) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS for students_in_session
ALTER TABLE students_in_session ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read students in active sessions" ON students_in_session;
DROP POLICY IF EXISTS "Students can insert themselves" ON students_in_session;
DROP POLICY IF EXISTS "Students can update their own progress" ON students_in_session;

CREATE POLICY "Anyone can read students in active sessions" ON students_in_session
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE quiz_sessions.room_code = students_in_session.room_code 
      AND quiz_sessions.is_active = true
    )
  );

CREATE POLICY "Students can insert themselves" ON students_in_session
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update their own progress" ON students_in_session
  FOR UPDATE USING (true);

-- 4. Create student_overall_scores table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS student_overall_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(100) UNIQUE NOT NULL,
  total_score INTEGER DEFAULT 0,
  num_quizzes_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for student_overall_scores
ALTER TABLE student_overall_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON student_overall_scores;
DROP POLICY IF EXISTS "System can update scores" ON student_overall_scores;

CREATE POLICY "Anyone can read leaderboard" ON student_overall_scores
  FOR SELECT USING (true);

CREATE POLICY "System can update scores" ON student_overall_scores
  FOR ALL USING (true);

-- 5. Insert some demo data for testing (only if not exists)
INSERT INTO student_overall_scores (student_name, total_score, num_quizzes_completed) 
SELECT * FROM (VALUES 
  ('Alice Johnson', 850, 5),
  ('Bob Smith', 720, 4),
  ('Carol Davis', 910, 6),
  ('David Wilson', 680, 3),
  ('Emma Brown', 790, 4)
) AS demo_data(student_name, total_score, num_quizzes_completed)
WHERE NOT EXISTS (SELECT 1 FROM student_overall_scores WHERE student_name = demo_data.student_name);