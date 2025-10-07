# ⏱️ 20-Second Countdown Timer Implementation

## 🎯 Overview

A fully functional **20-second countdown timer** has been implemented for each quiz question in the Level1 Phaser scene. The timer provides visual feedback, automatically handles timeout scenarios, and integrates seamlessly with the existing game mechanics.

---

## 🏗️ Architecture & Implementation

### **1. Timer Variables (Global Scope)**

Located after the scene initialization variables:

```javascript
// ⏱️ Timer variables
let timerText = null;        // Phaser text object displaying the timer
let timerEvent = null;       // Repeating timer event (counts down every second)
let timeUpEvent = null;      // One-time delayed call (fires after 20 seconds)
let currentTime = 20;        // Current remaining time in seconds
```

**Why these variables?**
- `timerText`: Visual display that players see
- `timerEvent`: Updates the countdown every second
- `timeUpEvent`: Handles the "time's up" scenario
- `currentTime`: Tracks remaining seconds for display updates

---

### **2. Timer UI Creation**

Added in the `create()` function, after physics overlap setup:

```javascript
// ⏱️ Create Timer UI in top-right corner
timerText = this.add
  .text(750, 20, "Time: 20", {
    fontSize: "28px",
    fontFamily: "Courier New",
    color: "#00ff00",          // Green initially
    fontStyle: "bold",
    backgroundColor: "#000000",
    padding: { x: 10, y: 5 }
  })
  .setOrigin(1, 0)             // Align to top-right
  .setDepth(1000);             // Display above game elements
```

**Key Design Decisions:**
- **Position (750, 20)**: Top-right corner, doesn't obstruct gameplay
- **Origin (1, 0)**: Right-aligned so it doesn't shift as numbers change
- **Depth 1000**: Ensures timer is always visible above collectibles and enemies
- **Color**: Green (#00ff00) for good visibility on dark background
- **Font**: Courier New (monospace) for consistent width

---

### **3. startQuestionTimer() Function**

**Purpose:** Initializes and starts a fresh 20-second countdown for each question.

```javascript
function startQuestionTimer() {
  // Reset time to 20 seconds
  currentTime = 20;
  
  // Update timer display
  if (timerText) {
    timerText.setText(`Time: ${currentTime}`);
    timerText.setColor("#00ff00"); // Green color
  }
  
  // Clear any existing timers to prevent overlaps
  stopQuestionTimer.call(this);
  
  // Create repeating 1-second timer event
  timerEvent = this.time.addEvent({
    delay: 1000,              // Fire every 1 second (1000ms)
    callback: () => {
      currentTime--;
      
      // Update timer text
      if (timerText) {
        timerText.setText(`Time: ${currentTime}`);
        
        // Change color based on remaining time
        if (currentTime <= 5) {
          timerText.setColor("#ff0000"); // Red when ≤5 seconds
        } else if (currentTime <= 10) {
          timerText.setColor("#ffff00"); // Yellow when ≤10 seconds
        } else {
          timerText.setColor("#00ff00"); // Green when >10 seconds
        }
      }
    },
    loop: true,               // Repeat every second
    callbackScope: this
  });
  
  // Create one-time "time's up" event after 20 seconds
  timeUpEvent = this.time.delayedCall(20000, () => {
    console.log("⏰ Time's up! Treating as wrong answer.");
    
    // Flash the timer
    if (timerText) {
      timerText.setColor("#ff0000");
      this.tweens.add({
        targets: timerText,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 2
      });
    }
    
    // Treat as wrong answer: reduce health
    gameState.mistakes++;
    gameState.health -= 25;
    
    // Flash player red
    if (player) {
      player.setTint(0xff0000);
      this.time.delayedCall(300, () => player.clearTint());
    }
    
    // Check if game over
    if (gameState.mistakes > 1 || gameState.health <= 0) {
      stopQuestionTimer.call(this);
      restartLevel();
    } else {
      // Move to next question (with dummy collectible)
      collectCorrectItem(player, { 
        graphics: { destroy: () => {} }, 
        keywordText: { destroy: () => {} }, 
        destroy: () => {} 
      });
    }
    
    updateReactUI();
  }, [], this);
}
```

**Key Features:**

1. **Dynamic Color Coding:**
   - **Green (>10s)**: Plenty of time remaining
   - **Yellow (6-10s)**: Time is running out - be quick!
   - **Red (≤5s)**: Urgent! Answer now!

2. **Two Phaser Time Events:**
   - `this.time.addEvent()`: Repeating countdown (updates every second)
   - `this.time.delayedCall()`: One-time trigger (fires after 20 seconds)

3. **Automatic Wrong Answer Handling:**
   - Reduces health by 25 (same as collecting wrong answer)
   - Increments mistake counter
   - Flashes player red for visual feedback
   - Checks if game should restart (too many mistakes)
   - Automatically advances to next question if possible

4. **Visual Feedback:**
   - Timer flashes when time runs out (alpha tweens)
   - Player character flashes red
   - Consistent with wrong answer collection behavior

---

### **4. stopQuestionTimer() Function**

**Purpose:** Cleanly removes all timer events to prevent memory leaks and unwanted callbacks.

```javascript
function stopQuestionTimer() {
  // Remove repeating timer event
  if (timerEvent) {
    timerEvent.remove();
    timerEvent = null;
  }
  
  // Remove one-time "time's up" event
  if (timeUpEvent) {
    timeUpEvent.remove();
    timeUpEvent = null;
  }
}
```

**Why This is Critical:**

- **Prevents Overlapping Timers:** If not stopped, old timers would continue running alongside new ones
- **Memory Management:** Removes references to prevent memory leaks
- **Avoids Double Penalties:** Without cleanup, collecting an answer after 20s would trigger both the timeout AND the collection

**Called In:**
- `collectCorrectItem()` - Stop timer when correct answer is collected
- `collectWrongItem()` - Stop timer when wrong answer is collected
- `restartLevel()` - Stop timer before restarting the level
- `showLevelComplete()` - Stop timer when quiz is finished
- `startQuestionTimer()` - Cleanup before starting new timer

---

### **5. Integration Points**

#### **A. Level Initialization**

Added at the end of `createLevel()`:

```javascript
// ⏱️ Start timer for the first question
startQuestionTimer.call(this);
```

**When:** After walls, enemies, and collectibles are created.

---

#### **B. Correct Answer Collection**

Modified `collectCorrectItem()` function:

```javascript
function collectCorrectItem(player, collectible) {
  // ⏱️ Stop the timer immediately when correct answer is collected
  stopQuestionTimer.call(sceneRef);
  
  // ... rest of function (destroy collectible, increment counter, etc.)
}
```

**Flow:**
1. Player collects correct answer
2. Timer stops immediately ✅
3. Collectible destroyed
4. Move to next question
5. New timer starts automatically

---

#### **C. Next Question Display**

Modified the tween onComplete callback in `collectCorrectItem()`:

```javascript
sceneRef.tweens.add({
  targets: nextQuestionText,
  alpha: 1,
  duration: 500,
  yoyo: true,
  hold: 2000,
  onComplete: () => {
    nextQuestionText.destroy();
    // Create new collectibles for the new question
    createCorrectKeyword.call(sceneRef);
    for (let i = 0; i < 3; i++) {
      createWrongKeyword.call(sceneRef);
    }
    // ⏱️ Start timer for the new question
    startQuestionTimer.call(sceneRef);
  }
});
```

**Timing:**
- Question text fades in (500ms)
- Holds for 2 seconds
- Fades out (500ms)
- **Timer starts when collectibles spawn** (after 3 second delay)

---

#### **D. Wrong Answer Collection**

Modified `collectWrongItem()`:

```javascript
function collectWrongItem(player, collectible) {
  // ⏱️ Stop the timer when wrong answer is collected
  stopQuestionTimer.call(sceneRef);
  
  // ... rest of function (reduce health, check game over, etc.)
}
```

**Why:** Even though it's wrong, we still stop the timer because:
- The question attempt is over
- Health has been reduced
- Game may restart (which needs clean timer state)

---

#### **E. Level Restart**

Modified `restartLevel()`:

```javascript
function restartLevel() {
  // ⏱️ Stop any running timers before restart
  stopQuestionTimer.call(sceneRef);
  
  // ... rest of function (flash screen, reset health, recreate level)
}
```

**When:** Called when player makes too many mistakes or health reaches 0.

---

#### **F. Quiz Completion**

Modified in `collectCorrectItem()` when last question is answered:

```javascript
} else {
  // All questions answered - level complete!
  // ⏱️ Stop timer when quiz is complete
  stopQuestionTimer.call(sceneRef);
  
  gameState.isLevelComplete = true;
  updateReactUI();
  showLevelComplete();
}
```

---

## 🎮 User Experience Flow

### **Typical Question Flow:**

```
1. New question appears (fade in/out animation)
   └─> Timer starts at 20 seconds (GREEN)

2. Player navigates to find correct answer
   └─> Timer counts down (GREEN → YELLOW at 10s → RED at 5s)

3A. Player collects CORRECT answer (before 20s)
    └─> Timer STOPS immediately ✅
    └─> Next question appears
    └─> New 20-second timer starts

3B. Player collects WRONG answer (before 20s)
    └─> Timer STOPS ✅
    └─> Health reduced (-25)
    └─> Game restarts (if too many mistakes) OR continues

3C. Time runs out (20 seconds elapsed)
    └─> Timer flashes RED
    └─> Player flashes RED
    └─> Treated as WRONG answer (-25 health)
    └─> Auto-advance to next question OR game restart
```

---

## 🎨 Visual Design

### **Timer Color States:**

| Time Remaining | Color | Hex Code | Meaning |
|----------------|-------|----------|---------|
| 20-11 seconds | 🟢 Green | `#00ff00` | Relax, plenty of time |
| 10-6 seconds | 🟡 Yellow | `#ffff00` | Hurry up! |
| 5-0 seconds | 🔴 Red | `#ff0000` | Critical! Answer now! |

### **Position & Layout:**

```
┌────────────────────────────────────────────┐
│                            [Time: 20] ⏱️   │ ← Top-right corner
│                                            │
│    🧙 Player                               │
│                                            │
│    🟣 Answer 1    🟣 Answer 2              │
│    🟣 Answer 3    🟣 Answer 4              │
│                                            │
│    Current Question: "What is...?"         │
│                                            │
│    Health: 100/100                         │ ← Bottom (React UI)
└────────────────────────────────────────────┘
```

---

## 🔧 Phaser Time Events Explained

### **1. `this.time.addEvent()` - Repeating Timer**

```javascript
timerEvent = this.time.addEvent({
  delay: 1000,           // Milliseconds between each fire
  callback: () => {      // Function to execute each time
    currentTime--;
    timerText.setText(`Time: ${currentTime}`);
  },
  loop: true,            // Repeat indefinitely
  callbackScope: this    // Set 'this' context for callback
});
```

**Use Case:** Perfect for countdowns, animations, or any repeating action.

**How to Stop:**
```javascript
timerEvent.remove(); // Stops and removes the event
timerEvent = null;   // Clean up reference
```

---

### **2. `this.time.delayedCall()` - One-Time Delayed Action**

```javascript
timeUpEvent = this.time.delayedCall(
  20000,                 // Delay in milliseconds (20 seconds)
  () => {                // Callback function
    console.log("Time's up!");
    // Handle timeout scenario
  },
  [],                    // Arguments array (empty)
  this                   // Callback scope
);
```

**Use Case:** Perfect for one-time triggers, delayed effects, or timeout scenarios.

**How to Stop:**
```javascript
timeUpEvent.remove(); // Cancels the delayed call
timeUpEvent = null;   // Clean up reference
```

---

### **3. Why Both Events?**

| Event Type | Purpose | Fires |
|------------|---------|-------|
| `addEvent` (repeating) | Update visual timer display | Every 1 second (20 times) |
| `delayedCall` (one-time) | Handle timeout scenario | Once after 20 seconds |

**Benefits:**
- **Separation of Concerns:** Visual updates separate from timeout logic
- **Easy to Stop:** Can cancel both independently
- **Flexible:** Can adjust display rate without affecting timeout duration

---

## 🐛 Edge Cases Handled

### **1. Answering Just Before Timeout**

**Scenario:** Player collects answer at 19.9 seconds (just before timeout).

**Handled By:**
```javascript
function collectCorrectItem(player, collectible) {
  stopQuestionTimer.call(sceneRef); // ← Stops BOTH events immediately
  // ... rest of collection logic
}
```

**Result:** Timeout event is canceled, only collection logic runs ✅

---

### **2. Multiple Timers Running**

**Scenario:** Timer not stopped properly, new timer starts.

**Prevented By:**
```javascript
function startQuestionTimer() {
  stopQuestionTimer.call(this); // ← ALWAYS cleanup before starting new timer
  // ... create new events
}
```

**Result:** Old events removed before new ones created ✅

---

### **3. Game Restart During Question**

**Scenario:** Player takes too much damage, game restarts mid-question.

**Handled By:**
```javascript
function restartLevel() {
  stopQuestionTimer.call(sceneRef); // ← Cleanup before restart
  // ... restart logic
  // Timer restarted by createLevel() → startQuestionTimer()
}
```

**Result:** Clean timer state on restart ✅

---

### **4. Quiz Completion**

**Scenario:** Player answers final question.

**Handled By:**
```javascript
} else {
  stopQuestionTimer.call(sceneRef); // ← Stop timer before completion screen
  showLevelComplete();
}
```

**Result:** Timer doesn't run during completion screen ✅

---

## 📊 Performance Considerations

### **Memory Management:**

✅ **Good:** Always call `.remove()` on events when done
```javascript
if (timerEvent) {
  timerEvent.remove();
  timerEvent = null;
}
```

❌ **Bad:** Just overwriting the variable
```javascript
timerEvent = null; // Event still running in Phaser's time system!
```

### **Scope Binding:**

✅ **Good:** Use `callbackScope` parameter
```javascript
this.time.addEvent({
  callback: () => {},
  callbackScope: this // ← Ensures 'this' refers to scene
});
```

❌ **Bad:** Relying on arrow function closure (can cause issues)

---

## 🎯 Testing Checklist

To verify the timer works correctly:

- [ ] **Timer starts at 20** when level begins
- [ ] **Timer counts down** every second (20, 19, 18...)
- [ ] **Color changes:**
  - [ ] Green when >10 seconds
  - [ ] Yellow when 6-10 seconds
  - [ ] Red when ≤5 seconds
- [ ] **Timer stops** when correct answer collected
- [ ] **Timer stops** when wrong answer collected
- [ ] **New timer starts** when next question appears
- [ ] **Timer stops** when level complete
- [ ] **Timer stops** when level restarts
- [ ] **Timeout triggers** at 0 seconds:
  - [ ] Timer flashes red
  - [ ] Player flashes red
  - [ ] Health decreases by 25
  - [ ] Advances to next question OR restarts level

---

## 🚀 Future Enhancements (Optional)

### **1. Adjustable Difficulty:**

```javascript
// Easy mode: 30 seconds per question
// Normal mode: 20 seconds per question
// Hard mode: 15 seconds per question

const TIMER_DURATION = {
  easy: 30,
  normal: 20,
  hard: 15
};

function startQuestionTimer(difficulty = 'normal') {
  currentTime = TIMER_DURATION[difficulty];
  // ... rest of timer logic
}
```

### **2. Bonus Points for Fast Answers:**

```javascript
function collectCorrectItem(player, collectible) {
  stopQuestionTimer.call(sceneRef);
  
  // Award bonus points based on remaining time
  let bonus = 0;
  if (currentTime > 15) bonus = 100;      // Answered in ≤5s
  else if (currentTime > 10) bonus = 50;  // Answered in 6-10s
  else if (currentTime > 5) bonus = 25;   // Answered in 11-15s
  
  console.log(`Bonus points: ${bonus}`);
  // ... rest of logic
}
```

### **3. Progressive Difficulty:**

```javascript
function startQuestionTimer() {
  // Reduce time for later questions
  const baseTime = 20;
  const reductionPerQuestion = 1;
  currentTime = Math.max(10, baseTime - (currentQuestionIndex * reductionPerQuestion));
  
  // Question 1: 20 seconds
  // Question 2: 19 seconds
  // Question 3: 18 seconds
  // ...
  // Question 11+: 10 seconds (minimum)
}
```

### **4. Warning Sound Effects:**

```javascript
// In timer callback
if (currentTime === 5) {
  this.sound.play('warningSound'); // Play sound at 5 seconds
}

if (currentTime <= 3) {
  this.sound.play('tickSound'); // Tick every second at ≤3
}
```

---

## 📝 Summary

### **What Was Implemented:**

1. ✅ **Timer UI Display** - Top-right corner with color-coded feedback
2. ✅ **Countdown Logic** - Repeating timer updates every second
3. ✅ **Timeout Handling** - Automatic wrong answer after 20 seconds
4. ✅ **Timer Management** - Proper start/stop at all game events
5. ✅ **Visual Feedback** - Color changes and flash effects
6. ✅ **Integration** - Seamless integration with existing game flow

### **Phaser Time Events Used:**

- **`this.time.addEvent()`**: Repeating countdown display (20 executions)
- **`this.time.delayedCall()`**: One-time timeout trigger (1 execution)
- **`.remove()`**: Clean event removal to prevent memory leaks

### **Files Modified:**

- `src/components/levels/Level1.jsx` - Main game scene

### **Lines of Code Added:**

- ~150 lines (timer variables, functions, integration points)

---

## 🎉 Result

Players now have a **dynamic, color-coded 20-second timer** for each question that:
- ✅ Provides clear visual feedback
- ✅ Automatically handles timeout scenarios
- ✅ Integrates seamlessly with game mechanics
- ✅ Enhances gameplay pressure and excitement
- ✅ Uses Phaser's time events efficiently

**The timer creates urgency without being punishing - players have enough time to think, but must stay engaged!** ⏱️🎮

