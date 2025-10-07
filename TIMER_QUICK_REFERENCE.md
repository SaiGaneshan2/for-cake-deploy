# ⏱️ Quick Timer Reference Guide

## 🎯 Core Components

### **1. Timer Variables**
```javascript
let timerText = null;      // Visual display
let timerEvent = null;     // Repeating countdown (every 1s)
let timeUpEvent = null;    // One-time timeout (after 20s)
let currentTime = 20;      // Current seconds remaining
```

### **2. Timer UI**
```javascript
// Created in create() function
timerText = this.add
  .text(750, 20, "Time: 20", {...})
  .setOrigin(1, 0)         // Top-right alignment
  .setDepth(1000);         // Always visible
```

### **3. Start Timer**
```javascript
function startQuestionTimer() {
  currentTime = 20;
  stopQuestionTimer.call(this);  // Cleanup first!
  
  // Repeating countdown
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: () => { /* Update display */ },
    loop: true
  });
  
  // One-time timeout
  timeUpEvent = this.time.delayedCall(20000, () => {
    /* Handle timeout as wrong answer */
  });
}
```

### **4. Stop Timer**
```javascript
function stopQuestionTimer() {
  if (timerEvent) {
    timerEvent.remove();
    timerEvent = null;
  }
  if (timeUpEvent) {
    timeUpEvent.remove();
    timeUpEvent = null;
  }
}
```

## 📊 Timer Flow

```
NEW QUESTION
    ↓
Start Timer (20s)
    ↓
┌───────────────────────────────────┐
│                                   │
│  Player collects CORRECT answer   │───→ Stop Timer ✅
│                                   │     Next Question
│              OR                   │     Start New Timer (20s)
│                                   │
│  Player collects WRONG answer     │───→ Stop Timer ✅
│                                   │     Check Game Over
│              OR                   │
│                                   │
│  TIME RUNS OUT (0 seconds)        │───→ Auto-Stop Timer ✅
│                                   │     Treat as Wrong
│                                   │     Next Question OR Restart
└───────────────────────────────────┘
```

## 🎨 Color Coding

| Time | Color | State |
|------|-------|-------|
| 20-11s | 🟢 Green `#00ff00` | Relax |
| 10-6s | 🟡 Yellow `#ffff00` | Hurry |
| 5-0s | 🔴 Red `#ff0000` | Urgent! |

## 🔧 Integration Points

### **When Timer STARTS:**
1. `createLevel()` - First question initialization
2. Next question tween onComplete - After question text fades

### **When Timer STOPS:**
1. `collectCorrectItem()` - Correct answer collected
2. `collectWrongItem()` - Wrong answer collected
3. `restartLevel()` - Game restarting
4. Quiz completion - Last question answered
5. `startQuestionTimer()` - Before starting new timer (cleanup)

## 🎮 Phaser Time Events

### **Repeating Timer (addEvent):**
```javascript
this.time.addEvent({
  delay: 1000,              // Milliseconds
  callback: () => {},       // What to do
  loop: true,               // Repeat forever
  callbackScope: this       // 'this' context
});
```

### **One-Time Timer (delayedCall):**
```javascript
this.time.delayedCall(
  20000,                    // Milliseconds
  () => {},                 // What to do
  [],                       // Arguments
  this                      // 'this' context
);
```

### **Stop Both:**
```javascript
event.remove();             // Cancel the event
event = null;               // Clean up reference
```

## ⚠️ Important Rules

1. ✅ **ALWAYS** call `stopQuestionTimer()` before `startQuestionTimer()`
2. ✅ **ALWAYS** use `.remove()` on events before setting to null
3. ✅ **ALWAYS** stop timer when question is answered (correct OR wrong)
4. ✅ **ALWAYS** stop timer before level restart or quiz completion

## 🐛 Common Issues

### **Multiple Timers Running:**
```javascript
// ❌ BAD
function startQuestionTimer() {
  timerEvent = this.time.addEvent({...}); // Old timer still running!
}

// ✅ GOOD
function startQuestionTimer() {
  stopQuestionTimer.call(this);  // Cleanup first
  timerEvent = this.time.addEvent({...});
}
```

### **Timer Not Stopping:**
```javascript
// ❌ BAD
timerEvent = null; // Event still in Phaser's system!

// ✅ GOOD
if (timerEvent) {
  timerEvent.remove();
  timerEvent = null;
}
```

## 📍 Code Locations (Level1.jsx)

- **Line ~105:** Timer variables declared
- **Line ~335:** Timer UI created in `create()`
- **Line ~455:** `startQuestionTimer()` called in `createLevel()`
- **Line ~460:** `startQuestionTimer()` function definition
- **Line ~545:** `stopQuestionTimer()` function definition
- **Line ~1125:** Stop timer in `collectCorrectItem()`
- **Line ~1205:** Start timer in next question tween
- **Line ~1285:** Stop timer in `collectWrongItem()`
- **Line ~1310:** Stop timer in `restartLevel()`
- **Line ~1220:** Stop timer on quiz completion

## 🎉 Result

A fully functional **20-second countdown timer** that:
- Displays in top-right corner
- Changes color (green → yellow → red)
- Automatically handles timeouts
- Integrates with all game events
- Prevents memory leaks

**Players must answer within 20 seconds or face a penalty!** ⏱️

