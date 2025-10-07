# Quiz Game Supabase Integration Guide

## Overview
This document provides setup instructions and database schema for the interactive quiz game with Supabase integration.

## Components Created
1. **StudentJoin.jsx** - Student login component for joining quiz sessions
2. **TeacherLogin.jsx** - Teacher authentication component
3. **TeacherDashboard.jsx** - Live monitoring dashboard for teachers
4. **supabaseClient.js** - Supabase configuration and helper functions

## Required Database Tables

### 1. quiz_sessions
Stores active quiz sessions created by teachers.

```sql
CREATE TABLE quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  quiz_title VARCHAR(255),
  teacher_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can read active sessions" ON quiz_sessions
  FOR SELECT USING (is_active = true);
```

### 2. students_in_session
Tracks students participating in active quiz sessions.

```sql
CREATE TABLE students_in_session (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  level_progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (room_code) REFERENCES quiz_sessions(room_code) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE students_in_session ENABLE ROW LEVEL SECURITY;

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
```

### 3. student_overall_scores
Aggregated scores for the overall leaderboard.

```sql
CREATE TABLE student_overall_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(100) UNIQUE NOT NULL,
  total_score INTEGER DEFAULT 0,
  num_quizzes_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE student_overall_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard" ON student_overall_scores
  FOR SELECT USING (true);

CREATE POLICY "System can update scores" ON student_overall_scores
  FOR ALL USING (true);
```

## Supabase Setup Instructions

### 1. Authentication Setup
Enable email authentication in your Supabase project:
- Go to Authentication > Settings
- Enable "Email" provider
- Configure email templates if needed

### 2. Database Setup
Run the SQL commands above in your Supabase SQL editor to create the required tables.

### 3. Real-time Setup
Enable real-time for the `students_in_session` table:
- Go to Database > Replication
- Enable replication for `students_in_session` table

### 4. Environment Variables (Recommended)
For production, replace hardcoded values in `supabaseClient.js` with environment variables:

```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
```

Create a `.env` file:
```
REACT_APP_SUPABASE_URL=https://vfxzvptysbfxniweailc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHp2cHR5c2JmeG5pd2VhaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODg4MTQsImV4cCI6MjA3NTI2NDgxNH0.DqlfqqwPdHamIwwv8OlwxVg3ndT9qkxz4OViWk_h430
```

## Required Dependencies

Install the Supabase client library:
```bash
npm install @supabase/supabase-js
```

## Component Features

### StudentJoin.jsx
- Username and room code validation
- Real-time session verification
- Automatic student registration
- Modern gradient background with Tailwind CSS

### TeacherLogin.jsx
- Email/password authentication via Supabase Auth
- Form validation and error handling
- Professional blue gradient theme

### TeacherDashboard.jsx
- Real-time monitoring of active quiz sessions
- Live student progress tracking
- Overall student leaderboard
- Real-time subscriptions for instant updates
- Responsive layout with modern design

## Real-time Features
The dashboard uses Supabase's real-time functionality to:
- Monitor student joins/leaves in real-time
- Track score and progress updates live
- Update session data without manual refresh

## Usage Flow
1. Teacher logs in via `/teacher/login`
2. Teacher accesses dashboard at `/teacher/dashboard`
3. Students join sessions via `/student/join`
4. Students are redirected to `/game/{roomCode}?username={username}`
5. Real-time updates flow to teacher dashboard

## Security Notes
- Row Level Security (RLS) is enabled on all tables
- Teachers can only manage their own sessions
- Students can read active sessions and update their own progress
- Anon key allows limited public access as defined by RLS policies

## Styling
All components use Tailwind CSS with:
- Responsive design patterns
- Modern gradient backgrounds
- Professional color schemes
- Loading states and animations
- Error handling displays