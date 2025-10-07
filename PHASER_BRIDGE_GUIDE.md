# 🌉 React-Phaser Bridge Implementation Guide

## Overview
This document explains how the **PhaserGameLauncher** component acts as a bridge between your React frontend and Phaser game engine, enabling dynamic quiz data to flow seamlessly from your backend API into the Phaser game's global registry.

---

## 🏗️ Architecture: The Bridge Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────┘

    1. User enters /play/:roomCode
           ↓
    2. PhaserGameLauncher fetches quiz from /api/quiz/:roomCode
           ↓
    3. Quiz data stored in React state
           ↓
    4. Phaser.Game instance created with quiz data in config.custom
           ↓
    5. MainGameScene.init() receives config
           ↓
    6. Quiz data stored in Phaser Registry (this.registry.set())
           ↓
    7. ALL game scenes can access data (this.registry.get('quizData'))
```

---

## 📁 Files Created/Modified

### ✅ New Files Created:

1. **`src/components/PhaserGameLauncher.jsx`** - The Bridge Component
2. **`src/game/main.js`** - Phaser game entry point with MainGameScene

### ✅ Files Modified:

1. **`src/App.jsx`** - Updated routing to use PhaserGameLauncher

---

## 🔍 Detailed Component Breakdown

### 1️⃣ PhaserGameLauncher.jsx - The Bridge

#### Purpose:
- Fetch quiz data from the backend API
- Manage loading and error states
- Initialize the Phaser game with quiz data
- Act as the React-to-Phaser data bridge

#### Key Features:

**A. URL Parameter Extraction**
```jsx
const { roomCode } = useParams();  // Get roomCode from /play/:roomCode
```

**B. First useEffect - Fetch Quiz Data**
```jsx
useEffect(() => {
  const fetchQuizData = async () => {
    const response = await fetch(`http://localhost:3001/api/quiz/${roomCode}`);
    const result = await response.json();
    setQuizData(result.quiz);  // Store in React state
  };
  
  fetchQuizData();
}, [roomCode]);
```

**C. Second useEffect - Initialize Phaser Game**
```jsx
useEffect(() => {
  if (!quizData || !gameContainerRef.current) return;
  
  const config = {
    type: Phaser.AUTO,
    parent: gameContainerRef.current,
    scene: [MainGameScene],
    // ⭐ CRITICAL: Pass quiz data here
    custom: {
      quizData: quizData,
      roomCode: roomCode
    }
  };
  
  gameInstance.current = new Phaser.Game(config);
  
  return () => gameInstance.current?.destroy(true);
}, [quizData, roomCode]);
```

**D. JSX Return**
```jsx
return (
  <div>
    <div id="phaser-game-container" ref={gameContainerRef} />
  </div>
);
```

---

### 2️⃣ src/game/main.js - Phaser Game Entry Point

#### MainGameScene Class

**A. Constructor**
```javascript
constructor() {
  super({ key: 'MainGameScene' });
}
```

**B. init() Method - Receives Quiz Data**
```javascript
init(config) {
  // Access quiz data from config.custom
  const quizData = config.custom?.quizData;
  const roomCode = config.custom?.roomCode;
  
  // ⭐ CRITICAL: Store in Phaser Registry for global access
  this.registry.set('quizData', quizData);
  this.registry.set('roomCode', roomCode);
  
  console.log('✅ Quiz data stored in Phaser Registry');
}
```

**C. create() Method - Access Quiz Data**
```javascript
create() {
  // Retrieve quiz data from registry
  const quizData = this.registry.get('quizData');
  const roomCode = this.registry.get('roomCode');
  
  // Use quiz data to build your game
  console.log('Total questions:', quizData.totalQuestions);
  
  // Display first question
  const question = quizData.questions[0];
  this.add.text(400, 200, question.question, { fontSize: '18px' });
}
```

---

### 3️⃣ App.jsx - Updated Routing

**Before:**
```jsx
<Route path="/play/:roomCode" element={<QuizPlayer />} />
```

**After:**
```jsx
<Route path="/play/:roomCode" element={<PhaserGameLauncher />} />
```

**Import Added:**
```jsx
import PhaserGameLauncher from './components/PhaserGameLauncher';
```

---

## 🎯 How the Bridge Works

### Step-by-Step Data Flow:

1. **User Navigation**
   - User enters URL: `/play/ABC123`
   - React Router renders `<PhaserGameLauncher />`

2. **useParams Hook**
   ```jsx
   const { roomCode } = useParams(); // "ABC123"
   ```

3. **First useEffect - API Call**
   ```jsx
   fetch(`http://localhost:3001/api/quiz/ABC123`)
     .then(response => response.json())
     .then(data => setQuizData(data.quiz));
   ```

4. **React State Update**
   - `quizData` state is populated
   - Component re-renders
   - Second useEffect is triggered

5. **Second useEffect - Phaser Initialization**
   ```jsx
   const config = {
     custom: {
       quizData: quizData,  // ← Quiz data injected here
       roomCode: "ABC123"
     }
   };
   new Phaser.Game(config);
   ```

6. **Phaser Scene init() Called**
   ```javascript
   init(config) {
     const quizData = config.custom.quizData;  // ← Received here
     this.registry.set('quizData', quizData);  // ← Stored globally
   }
   ```

7. **Global Access in Any Scene**
   ```javascript
   // In any Phaser scene:
   const quizData = this.registry.get('quizData');
   const question = quizData.questions[0];
   ```

---

## 🔑 Key Concepts

### Phaser Registry
The **Registry** is Phaser's built-in global data storage:

```javascript
// Store data (typically in init or create)
this.registry.set('quizData', quizData);
this.registry.set('currentLevel', 1);
this.registry.set('score', 0);

// Retrieve data (from any scene)
const quizData = this.registry.get('quizData');
const level = this.registry.get('currentLevel');

// Listen for changes
this.registry.events.on('changedata-score', (parent, value) => {
  console.log('Score changed to:', value);
});
```

### config.custom Property
Phaser allows custom properties in the config object:

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainGameScene],
  custom: {
    // ⭐ Your custom data goes here
    quizData: quizData,
    roomCode: roomCode,
    playerName: "John",
    difficulty: "hard"
  }
};
```

This `custom` object is accessible in the scene's `init()` method.

---

## 🎮 Using Quiz Data in Your Game

### Example: Display Question in Scene

```javascript
class QuestionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestionScene' });
  }
  
  create() {
    // Get quiz data from registry
    const quizData = this.registry.get('quizData');
    const currentQuestionIndex = 0; // Or from game state
    
    // Get current question
    const question = quizData.questions[currentQuestionIndex];
    
    // Display question
    this.add.text(400, 100, question.question, {
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);
    
    // Display answer options
    question.options.forEach((option, index) => {
      const optionText = this.add.text(
        400, 
        200 + (index * 50), 
        `${index + 1}. ${option}`,
        { fontSize: '18px', color: '#00ff00' }
      ).setOrigin(0.5);
      
      // Make interactive
      optionText.setInteractive();
      optionText.on('pointerdown', () => {
        this.checkAnswer(option, question.correctAnswer);
      });
    });
  }
  
  checkAnswer(selected, correct) {
    if (selected === correct) {
      console.log('Correct!');
      // Move to next question or level
    } else {
      console.log('Wrong!');
      // Handle incorrect answer
    }
  }
}
```

---

## 🚀 Testing the Bridge

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Create a Quiz
- Visit `http://localhost:5173/`
- Create a quiz and note the room code

### 3. Test the Bridge
- Visit `http://localhost:5173/play/YOUR_ROOM_CODE`
- Open browser console (F12)
- You should see these logs:

```
🔍 Fetching quiz data for room code: YOUR_ROOM_CODE
✅ Quiz data fetched successfully: {...}
🎮 Initializing Phaser game with quiz data...
🚀 Creating Phaser.Game instance...
🎮 MainGameScene init() called
📦 Quiz data received in Phaser scene: {...}
✅ Quiz data stored in Phaser Registry
📥 MainGameScene preload()
🎨 MainGameScene create()
✅ MainGameScene fully initialized
💡 Quiz data is available globally via: this.registry.get("quizData")
```

---

## 📊 Quiz Data Structure

The quiz data follows this structure:

```javascript
{
  roomCode: "ABC123",
  totalQuestions: 15,
  numLevels: 3,
  questionsPerLevel: 5,
  createdAt: "2025-10-05T12:00:00.000Z",
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "4",
      level: 1
    },
    // ... more questions
  ]
}
```

Access any part of this data in your Phaser scenes:

```javascript
const quizData = this.registry.get('quizData');
console.log('Total questions:', quizData.totalQuestions);
console.log('First question:', quizData.questions[0].question);
```

---

## 🛠️ Extending the Bridge

### Add More Scenes

In `src/game/main.js`:

```javascript
import Level1Scene from './scenes/Level1Scene';
import Level2Scene from './scenes/Level2Scene';
import GameOverScene from './scenes/GameOverScene';

export const gameConfig = {
  scene: [MainGameScene, Level1Scene, Level2Scene, GameOverScene]
};
```

In `PhaserGameLauncher.jsx`:

```jsx
import { gameConfig } from '../game/main.js';

const config = {
  ...gameConfig,
  parent: gameContainerRef.current,
  custom: {
    quizData: quizData,
    roomCode: roomCode
  }
};
```

### Scene Transitions

```javascript
// In any scene, transition to another scene:
this.scene.start('Level1Scene');
this.scene.launch('HUDScene'); // Launch in parallel
this.scene.sleep('PauseScene'); // Pause scene
this.scene.wake('PauseScene'); // Wake paused scene
```

---

## ✅ Summary

### What PhaserGameLauncher Does:

1. **Fetches Data**: Gets quiz data from your backend API using the room code
2. **Manages State**: Handles loading, error, and success states in React
3. **Creates Bridge**: Passes quiz data from React to Phaser via `config.custom`
4. **Lifecycle Management**: Properly creates and destroys Phaser game instances

### How Data Flows:

```
Backend API → React Component → Phaser Config → Scene init() → Registry → All Scenes
```

### Why This Pattern Works:

- ✅ **Separation of Concerns**: React handles data fetching, Phaser handles game logic
- ✅ **Type Safety**: Quiz data structure is consistent throughout
- ✅ **Global Access**: Any scene can access quiz data via registry
- ✅ **Clean Lifecycle**: Game is created/destroyed properly with React
- ✅ **Error Handling**: Loading and error states managed in React
- ✅ **Scalability**: Easy to add more scenes and game features

---

## 🎓 Next Steps

1. **Build Your Game Scenes**: Create actual quiz game scenes
2. **Add Game Logic**: Implement question display, answer checking, scoring
3. **Style the UI**: Add better graphics, animations, sound effects
4. **Handle Completion**: Save results, show scores, navigate back to React
5. **Add Persistence**: Store progress in localStorage or backend

---

## 📞 Need Help?

Common issues:

- **Quiz data is undefined**: Check console logs, ensure API is running
- **Game doesn't appear**: Check `gameContainerRef` is attached to a div
- **Data not in registry**: Ensure `init()` method is storing data correctly
- **Multiple game instances**: Make sure cleanup function is working

Happy coding! 🎮✨
