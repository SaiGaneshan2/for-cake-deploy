-- Add the missing quiz_data column to quiz_sessions table
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS quiz_data JSONB;

-- Update existing demo data to have some quiz_data (optional)
UPDATE quiz_sessions 
SET quiz_data = '{"questions": [], "totalQuestions": 0, "levels": 0}'::jsonb 
WHERE quiz_data IS NULL;