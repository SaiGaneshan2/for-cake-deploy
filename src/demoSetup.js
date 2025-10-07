// Demo setup instructions for testing the quiz game components
// This file contains sample data and setup instructions for testing

console.log('🎯 Quiz Game Demo Setup');
console.log('========================');

// Sample data that you can insert into Supabase for testing
export const sampleData = {
  quizSessions: [
    {
      room_code: 'ABC123',
      quiz_title: 'Math Quiz Level 1',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      room_code: 'XYZ789',
      quiz_title: 'Science Quiz',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  
  studentsInSession: [
    {
      room_code: 'ABC123',
      student_name: 'Alice Johnson',
      score: 85,
      level_progress: 3,
      joined_at: new Date().toISOString()
    },
    {
      room_code: 'ABC123',
      student_name: 'Bob Smith',
      score: 92,
      level_progress: 4,
      joined_at: new Date().toISOString()
    },
    {
      room_code: 'XYZ789',
      student_name: 'Charlie Brown',
      score: 78,
      level_progress: 2,
      joined_at: new Date().toISOString()
    }
  ],
  
  overallScores: [
    {
      student_name: 'Alice Johnson',
      total_score: 285,
      num_quizzes_completed: 3
    },
    {
      student_name: 'Bob Smith',
      total_score: 342,
      num_quizzes_completed: 4
    },
    {
      student_name: 'Charlie Brown',
      total_score: 198,
      num_quizzes_completed: 2
    },
    {
      student_name: 'Diana Prince',
      total_score: 421,
      num_quizzes_completed: 5
    }
  ]
};

// Instructions for manual testing without Supabase
export const testInstructions = `
🧪 TESTING INSTRUCTIONS (Without Supabase Setup)

1. 📱 STUDENT JOIN COMPONENT (/student/join)
   - Try entering different usernames
   - Test with room codes of different lengths
   - Test with empty fields
   - Should show validation errors

2. 👨‍🏫 TEACHER LOGIN COMPONENT (/teacher/login)
   - Try with invalid email formats
   - Test with empty fields
   - Should show validation errors
   - Won't actually authenticate without Supabase

3. 📊 TEACHER DASHBOARD (/teacher/dashboard)
   - Will show loading states
   - Won't load data without Supabase
   - UI should be responsive and well-designed

4. 🏠 HOME PAGE (/)
   - Navigation should work between all components
   - Design should be responsive

🔧 TO FULLY ENABLE FUNCTIONALITY:
   - Set up Supabase database with the provided SQL
   - Create teacher accounts in Supabase Auth
   - Insert sample quiz sessions and students
`;

console.log(testInstructions);