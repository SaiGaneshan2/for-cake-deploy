# AI Assistant Prompt: Build Complete Quiz Player Logic

## Context
You are building a React-based quiz application where students can take quizzes by entering a room code. The quiz displays questions level by level, provides instant feedback, and shows final results.

## Your Task
Build the complete logic for `src/components/QuizPlayer.jsx` with the following requirements:

---

## Requirements

### 1. Fetch Quiz Data
- Use `useParams` hook from `react-router-dom` to extract `roomCode` from the URL
- Use `useEffect` hook to fetch quiz data when component mounts
- Make a GET request to: `http://localhost:3001/api/quiz/:roomCode`
- Handle loading and error states appropriately

### 2. State Management
Create the following state variables using `useState`:

**Data States:**
- `quizData` - stores fetched quiz object
- `loading` - boolean for loading state (default: true)
- `error` - stores error messages (default: null)

**Game States:**
- `currentLevel` - tracks current level (default: 1)
- `currentQuestionIndex` - index within current level (default: 0)
- `score` - total correct answers (default: 0)
- `selectedAnswer` - the option user clicked (default: null)
- `showFeedback` - shows correct/incorrect feedback (default: false)
- `isLevelComplete` - true when level finished (default: false)
- `isQuizComplete` - true when entire quiz finished (default: false)

### 3. Conditional Rendering Logic

Implement these views in order of priority:

**A. Loading View** (when `loading === true`)
- Display "Loading quiz..." message
- Show a spinner animation

**B. Error View** (when `error !== null`)
- Display "Error: Quiz not found" or the error message
- Provide a button to navigate back to the join page

**C. Quiz Complete View** (when `isQuizComplete === true`)
- Calculate percentage: `(score / totalQuestions) * 100`
- Display final score statistics
- Show motivational message based on percentage:
  - 90%+ → "Outstanding! You're a master!" 🏆
  - 70-89% → "Great job! Solid understanding!" 🌟
  - 50-69% → "Good effort! Keep practicing!" 👍
  - <50% → "Keep learning! You'll get better!" 📚
- Provide "Try Again" button (restarts quiz)
- Provide "Exit" button (navigates to home)

**D. Level Complete View** (when `isLevelComplete === true`)
- Display "Level X Complete!" message
- Show how many questions were correct in this level
- If more levels exist → show "Next Level" button
- If last level → show "View Results" button

**E. Quiz Game View** (default view during quiz)
- Display header with: room code, current level, question number, score
- Display question text prominently
- Display 4 options in a 2x2 grid (labeled A, B, C, D)
- Display progress bar showing overall quiz completion

### 4. Game Logic Functions

**handleAnswerClick(answer)**
- Prevent clicking if feedback is already showing
- Set `selectedAnswer` to clicked option
- Set `showFeedback` to true
- Check if answer equals `currentQuestion.correctAnswer`
- If correct → increment `score`
- After 2 seconds:
  - If more questions in level → advance to next question
  - If level finished → set `isLevelComplete` to true

**handleNextLevel()**
- If `currentLevel < totalLevels`:
  - Increment `currentLevel`
  - Reset `currentQuestionIndex` to 0
  - Set `isLevelComplete` to false
- Else:
  - Set `isQuizComplete` to true

**handleRestart()**
- Reset all state variables to initial values:
  - `currentLevel = 1`
  - `currentQuestionIndex = 0`
  - `score = 0`
  - `selectedAnswer = null`
  - `showFeedback = false`
  - `isLevelComplete = false`
  - `isQuizComplete = false`

**handleExit()**
- Use `useNavigate` to navigate to home page "/"

### 5. Visual Feedback for Options

Each option button should have dynamic styling:
- **Before answer:** Default style, clickable
- **Selected (before feedback):** Blue border/background
- **Correct answer (after feedback):** Green border/background
- **Incorrect answer (after feedback):** Red border/background
- **After feedback:** All buttons disabled

### 6. Data Calculations

```javascript
// Questions per level
const questionsPerLevel = quizData.questionsPerLevel || 
                          Math.ceil(quizData.questions.length / quizData.numLevels);

// Total levels
const totalLevels = quizData.numLevels || 
                    Math.ceil(quizData.questions.length / questionsPerLevel);

// Current level's questions
const levelStartIndex = (currentLevel - 1) * questionsPerLevel;
const levelEndIndex = Math.min(currentLevel * questionsPerLevel, quizData.questions.length);
const levelQuestions = quizData.questions.slice(levelStartIndex, levelEndIndex);
const currentQuestion = levelQuestions[currentQuestionIndex];
```

---

## Expected Backend Response Format

```json
{
  "questions": [
    {
      "question": "What is SQL?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ],
  "numLevels": 5,
  "questionsPerLevel": 3,
  "totalQuestions": 15
}
```

---

## Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPlayer.css';

const QuizPlayer = () => {
  // 1. Extract roomCode from URL
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  // 2. Define all state variables
  // ... (add all useState declarations here)
  
  // 3. Fetch quiz data on mount
  useEffect(() => {
    // ... (implement fetch logic)
  }, [roomCode]);
  
  // 4. Conditional rendering: loading
  if (loading) {
    // ... (return loading view)
  }
  
  // 5. Conditional rendering: error
  if (error) {
    // ... (return error view)
  }
  
  // 6. Conditional rendering: no data
  if (!quizData) {
    return null;
  }
  
  // 7. Calculate level/question data
  // ... (implement calculations)
  
  // 8. Define handler functions
  const handleAnswerClick = (answer) => {
    // ... (implement answer logic)
  };
  
  const handleNextLevel = () => {
    // ... (implement level progression)
  };
  
  const handleRestart = () => {
    // ... (reset all state)
  };
  
  const handleExit = () => {
    // ... (navigate away)
  };
  
  // 9. Conditional rendering: quiz complete
  if (isQuizComplete) {
    // ... (return results screen)
  }
  
  // 10. Conditional rendering: level complete
  if (isLevelComplete) {
    // ... (return level complete screen)
  }
  
  // 11. Main quiz interface
  return (
    <div className="quiz-player-container">
      {/* Header */}
      <div className="quiz-header">
        {/* Room code, level, question number, score */}
      </div>
      
      {/* Question Card */}
      <div className="question-card">
        {/* Question text */}
        {/* Options grid (map through 4 options) */}
        {/* Feedback message */}
      </div>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        {/* Fill width based on progress */}
      </div>
    </div>
  );
};

export default QuizPlayer;
```

---

## Key Implementation Details

### Auto-Advance Mechanism
Use `setTimeout` in `handleAnswerClick` to wait 2 seconds before moving to next question:

```javascript
setTimeout(() => {
  if (currentQuestionIndex + 1 < levelQuestions.length) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  } else {
    setIsLevelComplete(true);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }
}, 2000);
```

### Option Button Class Logic
```javascript
let buttonClass = 'option-button';

if (showFeedback) {
  if (isCorrect) {
    buttonClass += ' correct';
  } else if (isSelected && !isCorrect) {
    buttonClass += ' incorrect';
  }
} else if (isSelected) {
  buttonClass += ' selected';
}
```

### Progress Bar Width
```javascript
const progress = ((levelStartIndex + currentQuestionIndex + 1) / quizData.questions.length) * 100;
```

---

## Success Criteria

Your implementation should:
- ✅ Fetch quiz data using roomCode from URL
- ✅ Display loading spinner during fetch
- ✅ Handle errors gracefully with error message
- ✅ Display one question at a time with 4 options
- ✅ Provide instant visual feedback (green/red colors)
- ✅ Auto-advance after 2 seconds
- ✅ Track score throughout quiz
- ✅ Show level complete screen between levels
- ✅ Show final results with percentage and message
- ✅ Allow user to restart or exit quiz
- ✅ Update progress bar as quiz progresses

---

## Output Format

Provide the complete, production-ready code for `src/components/QuizPlayer.jsx` with:
1. All imports
2. All state declarations
3. useEffect for data fetching
4. All handler functions
5. All conditional rendering logic
6. Complete JSX for all views
7. Comments explaining key sections

After the code, add a brief summary explaining:
- How data fetching works
- How state management handles the game flow
- How conditional rendering switches between views
- How the auto-advance mechanism works
