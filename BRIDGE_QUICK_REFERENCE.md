# 🚀 Quick Reference: React-Phaser Bridge

## File Summary

### 1. PhaserGameLauncher.jsx (NEW)
**Location**: `src/components/PhaserGameLauncher.jsx`
**Purpose**: Bridge component that fetches quiz data and initializes Phaser game

**Key Code**:
```jsx
// Fetch quiz data
useEffect(() => {
  fetch(`/api/quiz/${roomCode}`)
    .then(res => res.json())
    .then(data => setQuizData(data.quiz));
}, [roomCode]);

// Initialize Phaser with quiz data
useEffect(() => {
  const config = {
    scene: [MainGameScene],
    custom: { quizData, roomCode }  // ← Data injection
  };
  gameInstance.current = new Phaser.Game(config);
}, [quizData]);
```

---

### 2. main.js (NEW)
**Location**: `src/game/main.js`
**Purpose**: Phaser game entry point with MainGameScene

**Key Code**:
```javascript
class MainGameScene extends Phaser.Scene {
  init(config) {
    // Receive quiz data
    const quizData = config.custom?.quizData;
    
    // Store globally
    this.registry.set('quizData', quizData);
  }
  
  create() {
    // Access quiz data
    const quizData = this.registry.get('quizData');
    
    // Use it!
    console.log(quizData.questions[0]);
  }
}
```

---

### 3. App.jsx (MODIFIED)
**Location**: `src/App.jsx`
**Change**: Updated route to use PhaserGameLauncher

**Before**:
```jsx
<Route path="/play/:roomCode" element={<QuizPlayer />} />
```

**After**:
```jsx
<Route path="/play/:roomCode" element={<PhaserGameLauncher />} />
```

---

## Data Flow Cheat Sheet

```
1. URL: /play/ABC123
        ↓
2. PhaserGameLauncher component loads
        ↓
3. useParams() extracts roomCode
        ↓
4. fetch('/api/quiz/ABC123')
        ↓
5. setQuizData(result.quiz)
        ↓
6. new Phaser.Game({ custom: { quizData } })
        ↓
7. MainGameScene.init(config)
        ↓
8. this.registry.set('quizData', config.custom.quizData)
        ↓
9. Any scene: this.registry.get('quizData')
```

---

## Essential Code Snippets

### Access Quiz Data in Any Scene
```javascript
const quizData = this.registry.get('quizData');
const question = quizData.questions[0];
console.log(question.question); // "What is 2+2?"
console.log(question.options);  // ["2", "3", "4", "5"]
```

### Display Question in Phaser
```javascript
create() {
  const quizData = this.registry.get('quizData');
  const q = quizData.questions[0];
  
  this.add.text(400, 200, q.question, { fontSize: '20px' });
  
  q.options.forEach((opt, i) => {
    this.add.text(400, 300 + i*40, opt, { fontSize: '18px' });
  });
}
```

### Check Answer
```javascript
checkAnswer(selectedOption, question) {
  if (selectedOption === question.correctAnswer) {
    console.log('Correct! ✅');
    // Award points, move to next question
  } else {
    console.log('Wrong! ❌');
    // Deduct health, show feedback
  }
}
```

### Scene Transitions
```javascript
// Go to next level
this.scene.start('Level2Scene');

// Restart current scene
this.scene.restart();

// Launch overlay scene
this.scene.launch('PauseMenuScene');
```

---

## Testing Commands

```bash
# Start development server
npm run dev

# Visit in browser
http://localhost:5173/play/YOUR_ROOM_CODE

# Check console for these logs:
# ✅ Quiz data fetched successfully
# ✅ Quiz data stored in Phaser Registry
# ✅ MainGameScene fully initialized
```

---

## Common Patterns

### Track Progress
```javascript
init(config) {
  this.registry.set('quizData', config.custom.quizData);
  this.registry.set('currentQuestionIndex', 0);
  this.registry.set('score', 0);
  this.registry.set('lives', 3);
}

// Later in game
this.registry.set('score', this.registry.get('score') + 10);
this.registry.values.currentQuestionIndex += 1;
```

### Move to Next Question
```javascript
nextQuestion() {
  const quizData = this.registry.get('quizData');
  let index = this.registry.get('currentQuestionIndex');
  
  index++;
  
  if (index >= quizData.questions.length) {
    // Quiz complete!
    this.scene.start('GameOverScene');
  } else {
    this.registry.set('currentQuestionIndex', index);
    this.scene.restart(); // Show next question
  }
}
```

### Display Current Question
```javascript
create() {
  const quizData = this.registry.get('quizData');
  const index = this.registry.get('currentQuestionIndex');
  const question = quizData.questions[index];
  
  this.add.text(400, 100, `Question ${index + 1}/${quizData.totalQuestions}`);
  this.add.text(400, 200, question.question);
}
```

---

## Quiz Data Structure

```javascript
{
  roomCode: "ABC123",
  totalQuestions: 15,
  numLevels: 3,
  questionsPerLevel: 5,
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "4",
      level: 1
    }
  ]
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Quiz data is `undefined` | Check API is running, check console logs |
| Game doesn't render | Verify `gameContainerRef` is on a `<div>` |
| Data not in registry | Ensure `init()` is called and storing data |
| Game persists after unmount | Check cleanup: `gameInstance.destroy(true)` |
| Multiple game instances | Only create game when `!gameInstance.current` |

---

## Key Files to Remember

✅ **PhaserGameLauncher.jsx** - React component, fetches data, creates Phaser game  
✅ **src/game/main.js** - Phaser scenes, receives data in init(), stores in registry  
✅ **App.jsx** - Routing, connects URL to PhaserGameLauncher

---

## Summary in 3 Points

1. **PhaserGameLauncher** fetches quiz data from API and passes it to Phaser via `config.custom`
2. **MainGameScene.init()** receives the data and stores it in Phaser Registry
3. **Any scene** can access the data globally using `this.registry.get('quizData')`

**The Bridge**: React handles data → Phaser handles game → Registry connects everything

🎮 Happy Game Development!
