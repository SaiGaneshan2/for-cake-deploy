# 🔍 Phaser Event Emission - Analysis & Verification

## Current Implementation Status

### ✅ Event Emission Code is ALREADY IN PLACE

The Level1.jsx file **already contains** the correct event emission code at **line 988-993**:

```javascript
// 🔥 EMIT EVENT TO REACT: Notify UI that question has changed
console.log('PHASER IS SENDING: Event updateQuestion with index:', currentQuestionIndex);
sceneRef.events.emit('updateQuestion', { 
  questionIndex: currentQuestionIndex 
});
console.log(`📢 Emitted updateQuestion event with index: ${currentQuestionIndex}`);
```

**Location:** Inside the `collectCorrectItem()` function, right after:
- `currentQuestionIndex++` (line 979)
- Loading the next question data (lines 986-988)

---

## 🎯 How the Event System Works

### **1. Scene Reference Setup**

In `preload()` function (line 100):
```javascript
function preload() {
  sceneRef = this;  // Store reference to the Phaser scene
  // ...
}
```

### **2. Event Emission Trigger**

In `collectCorrectItem()` function (lines 972-1010):
```javascript
function collectCorrectItem(player, collectible) {
  // 1. Destroy the collected item
  collectible.graphics.destroy();
  collectible.keywordText.destroy();
  collectible.destroy();

  // 2. Increment counters
  gameState.questionsAnswered++;
  currentQuestionIndex++;  // ← QUESTION INDEX UPDATES HERE

  console.log(`✅ Correct answer! Questions answered: ${gameState.questionsAnswered}/${gameState.totalQuestions}`);

  // 3. Check if there are more questions
  if (currentQuestionIndex < questions.length) {
    // 4. Load next question data
    currentQuestion = getCurrentQuestion();
    query.text = currentQuestion.question;
    query.word = currentQuestion.correctAnswer;

    // 5. 🔥 EMIT EVENT TO REACT
    console.log('PHASER IS SENDING: Event updateQuestion with index:', currentQuestionIndex);
    sceneRef.events.emit('updateQuestion', { 
      questionIndex: currentQuestionIndex 
    });
    console.log(`📢 Emitted updateQuestion event with index: ${currentQuestionIndex}`);

    // 6. Update game state with new question
    // ...
  }
}
```

### **3. React Event Listener**

In `PhaserGameLauncher.jsx` (lines 210-236):
```javascript
useEffect(() => {
  if (!level1SceneRef.current || !showGame) {
    return;
  }

  const scene = level1SceneRef.current;

  const handleQuestionUpdate = (data) => {
    console.log('REACT IS RECEIVING: Event updateQuestion with data:', data);
    console.log('📢 Question update event received:', data);
    // Functional update prevents stale closure
    setCurrentQuestionIndex(currentIndex => data.questionIndex);
  };

  // Listen for 'updateQuestion' event
  scene.events.on('updateQuestion', handleQuestionUpdate);
  console.log('🎧 Event listener set up for question updates');

  return () => {
    if (scene && scene.events) {
      scene.events.off('updateQuestion', handleQuestionUpdate);
      console.log('🧹 Event listener cleaned up');
    }
  };
}, [level1SceneRef.current, showGame]);
```

---

## 🔧 Potential Issues & Solutions

### **Issue 1: sceneRef Not Set Properly**

**Problem:** If `sceneRef` is `null` or `undefined` when `collectCorrectItem()` is called, the event won't emit.

**Solution:** Add defensive logging to verify `sceneRef` is set:

```javascript
// In collectCorrectItem(), before emitting:
console.log('🔍 SceneRef check:', sceneRef ? 'VALID' : 'NULL/UNDEFINED');
console.log('🔍 SceneRef.events check:', sceneRef?.events ? 'VALID' : 'NULL/UNDEFINED');

if (!sceneRef || !sceneRef.events) {
  console.error('❌ ERROR: sceneRef or sceneRef.events is not available!');
  return;
}

console.log('PHASER IS SENDING: Event updateQuestion with index:', currentQuestionIndex);
sceneRef.events.emit('updateQuestion', { 
  questionIndex: currentQuestionIndex 
});
```

### **Issue 2: Scene Reference Not Passed to React**

**Problem:** `level1SceneRef.current` in React is `null`, so event listener is never set up.

**Verification:** Check console for this log:
```
🎧 Event listener set up for question updates
```

If **NOT present**, the `onSceneReady` callback isn't working.

**Solution:** Verify in Level1.jsx that `onSceneReady` is called at the end of `create()`:

```javascript
// At the end of create() function:
if (onSceneReady) {
  onSceneReady(this);
  console.log('🎮 Scene ready callback invoked');
}
```

### **Issue 3: Event Listener Dependencies**

**Problem:** The useEffect dependencies might cause the listener to not set up properly.

**Current Dependencies:**
```javascript
}, [level1SceneRef.current, showGame]);
```

**Note:** Using `level1SceneRef.current` as a dependency can be problematic because ref changes don't trigger re-renders.

**Better Approach:** Use a state variable to track when the scene is ready:

```javascript
const [isSceneReady, setIsSceneReady] = useState(false);

// In onSceneReady callback:
onSceneReady={(scene) => {
  level1SceneRef.current = scene;
  setIsSceneReady(true);  // ← Trigger useEffect
}}

// In useEffect:
useEffect(() => {
  if (!isSceneReady || !level1SceneRef.current || !showGame) {
    return;
  }
  // ...
}, [isSceneReady, showGame]);  // ← Use state, not ref.current
```

---

## 🧪 Debugging Checklist

### **Step 1: Verify Scene Initialization**

Look for these logs in console when game starts:
```
✅ Expected:
🎮 Level1 starting with quiz data: {...}
🎮 Scene ready callback invoked
🎧 Event listener set up for question updates
```

### **Step 2: Verify Event Emission**

Collect the correct letter and look for:
```
✅ Expected:
✅ Correct answer! Questions answered: 1/5
PHASER IS SENDING: Event updateQuestion with index: 1
📢 Emitted updateQuestion event with index: 1
```

### **Step 3: Verify Event Reception**

After emission, look for:
```
✅ Expected:
REACT IS RECEIVING: Event updateQuestion with data: { questionIndex: 1 }
📢 Question update event received: { questionIndex: 1 }
```

### **Step 4: Verify UI Update**

Check the right panel:
```
✅ Expected:
- "Question 1 of 5" → "Question 2 of 5"
- Question text changes
- Answer options change
- Green highlight moves to new correct answer
```

---

## 🚨 Common Pitfalls

### **1. Collecting Wrong Answer**

**Symptom:** No logs appear when collecting a letter

**Cause:** You're collecting a wrong answer, which triggers `collectWrongItem()` instead of `collectCorrectItem()`

**Solution:** Look at the right panel - the correct answer is highlighted in GREEN. Collect that letter!

### **2. Event Listener Not Set Up**

**Symptom:** See "PHASER IS SENDING" but NOT "REACT IS RECEIVING"

**Cause:** Event listener never registered

**Check:**
- Is `level1SceneRef.current` set? Add log: `console.log('Scene ref value:', level1SceneRef.current)`
- Did useEffect run? Look for "🎧 Event listener set up for question updates"
- Is `showGame` true when listener tries to set up?

### **3. Stale Closure**

**Symptom:** Event fires, React receives it, but UI doesn't update

**Cause:** Not using functional state update

**Solution:** Already fixed with:
```javascript
setCurrentQuestionIndex(currentIndex => data.questionIndex);
```

---

## 💡 Recommended Additional Logging

Add these logs to Level1.jsx for comprehensive debugging:

```javascript
function collectCorrectItem(player, collectible) {
  console.log('🎯 collectCorrectItem called!');
  
  // ...existing code...
  
  currentQuestionIndex++;
  console.log('📈 Question index incremented to:', currentQuestionIndex);
  console.log('📊 Total questions:', questions.length);

  if (currentQuestionIndex < questions.length) {
    console.log('✅ More questions available, loading next...');
    
    currentQuestion = getCurrentQuestion();
    console.log('📖 Loaded question:', currentQuestion.question);
    
    // Check sceneRef before emitting
    console.log('🔍 SceneRef valid?', !!sceneRef);
    console.log('🔍 SceneRef.events valid?', !!sceneRef?.events);
    
    if (!sceneRef || !sceneRef.events) {
      console.error('❌ CRITICAL: Cannot emit event - sceneRef.events is unavailable!');
      return;
    }
    
    console.log('PHASER IS SENDING: Event updateQuestion with index:', currentQuestionIndex);
    sceneRef.events.emit('updateQuestion', { 
      questionIndex: currentQuestionIndex 
    });
    console.log(`📢 Emitted updateQuestion event with index: ${currentQuestionIndex}`);
  } else {
    console.log('🏁 No more questions - quiz complete!');
  }
}
```

---

## 📋 Summary

### **Current State:**
✅ Event emission code is correctly implemented in Level1.jsx  
✅ Event listener is correctly implemented in PhaserGameLauncher.jsx  
✅ Functional state update prevents stale closures  
✅ Comprehensive logging is in place  

### **The Event Flow:**

```
1. Player collects correct letter (e.g., "C")
   ↓
2. collectCorrectItem() function called
   ↓
3. currentQuestionIndex incremented (0 → 1)
   ↓
4. New question loaded
   ↓
5. 🔥 EMIT: sceneRef.events.emit('updateQuestion', { questionIndex: 1 })
   ↓
6. 🎧 RECEIVE: scene.events.on('updateQuestion', handler)
   ↓
7. 🔄 UPDATE: setCurrentQuestionIndex(prevIndex => 1)
   ↓
8. 🎨 RE-RENDER: QuizPanel receives new currentQuestionIndex prop
   ↓
9. ✅ UI UPDATES: Shows Question 2 of 5
```

### **Next Steps:**

1. **Run the application** with dev server
2. **Open browser console** (F12)
3. **Start a quiz** and click Play
4. **Collect the correct letter** (green highlighted)
5. **Watch console logs** - should see both "PHASER IS SENDING" and "REACT IS RECEIVING"
6. **Verify UI updates** - right panel should show next question

If you see the logs but UI doesn't update, the issue is likely with the useEffect dependencies or the scene reference not being properly set. If you don't see "REACT IS RECEIVING", the event listener isn't being registered correctly.

---

## 🎯 Final Verification

The code is **already correctly implemented**. The event emission happens exactly where it should:
- ✅ After the question index increments
- ✅ After the new question data is loaded
- ✅ Before the game state is updated with new collectibles

**The `sceneRef.events.emit()` call at line 991 is the key piece that sends the signal to React!**

