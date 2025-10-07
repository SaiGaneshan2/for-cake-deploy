# ⏱️ Timer System Visual Architecture

## 🎮 Game Screen Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                          [Time: 20] 🟢       │ ← Timer UI
│                                                              │   (Top-Right)
│                                                              │
│   🧙 Wizard Player                                          │
│                                                              │
│   🔴 Enemy        🔴 Enemy                                  │
│                                                              │
│   🟣 Neural       🟣 Transformer                            │
│   Network                                                    │
│                                                              │
│   🟣 Attention    🟣 Gradient                               │
│                                                              │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Current Question:                                   │   │ ← Question
│   │ "What technique is used for deep learning?"        │   │   Display
│   └────────────────────────────────────────────────────┘   │
│                                                              │
│   Health: 75/100 | Questions: 3/5                          │ ← React UI
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Timer System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIMER SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              VARIABLES (Global Scope)                  │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  • timerText: Text Object (visual display)            │    │
│  │  • timerEvent: TimerEvent (repeating, every 1s)       │    │
│  │  • timeUpEvent: DelayedCall (one-time, after 20s)     │    │
│  │  • currentTime: Number (seconds remaining)            │    │
│  └───────────────────────────────────────────────────────┘    │
│                            ↓                                    │
│  ┌───────────────────────────────────────────────────────┐    │
│  │           FUNCTIONS (Timer Management)                 │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │                                                        │    │
│  │  startQuestionTimer()                                  │    │
│  │  ├─ Reset currentTime = 20                            │    │
│  │  ├─ Update timerText display                          │    │
│  │  ├─ Call stopQuestionTimer() (cleanup)                │    │
│  │  ├─ Create timerEvent (repeating countdown)           │    │
│  │  │  └─ Updates every 1 second                         │    │
│  │  │     └─ Changes color (green/yellow/red)            │    │
│  │  └─ Create timeUpEvent (one-time timeout)             │    │
│  │     └─ Fires after 20 seconds                         │    │
│  │        └─ Treats as wrong answer                      │    │
│  │                                                        │    │
│  │  stopQuestionTimer()                                   │    │
│  │  ├─ Remove timerEvent                                 │    │
│  │  └─ Remove timeUpEvent                                │    │
│  │                                                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                            ↓                                    │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         INTEGRATION POINTS (When Called)               │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │                                                        │    │
│  │  START TIMER:                                          │    │
│  │  • createLevel() - First question                     │    │
│  │  • Next question appears (tween onComplete)           │    │
│  │                                                        │    │
│  │  STOP TIMER:                                           │    │
│  │  • collectCorrectItem() - Correct answer              │    │
│  │  • collectWrongItem() - Wrong answer                  │    │
│  │  • restartLevel() - Game restart                      │    │
│  │  • Quiz completion - Last question answered           │    │
│  │  • startQuestionTimer() - Before starting new         │    │
│  │                                                        │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Timer Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUESTION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

1. NEW QUESTION STARTS
   ↓
   createLevel() OR nextQuestion.onComplete()
   ↓
   startQuestionTimer()
   ├─ currentTime = 20
   ├─ timerText.setText("Time: 20") [GREEN]
   ├─ stopQuestionTimer() [cleanup old timers]
   ├─ timerEvent = this.time.addEvent({
   │    delay: 1000,
   │    callback: updateTimer,    ← Fires every 1 second
   │    loop: true
   │  })
   └─ timeUpEvent = this.time.delayedCall(20000, timeoutHandler) ← Fires once at 20s

2. TIMER RUNNING (20 seconds)
   
   Every 1 Second (timerEvent fires):
   ├─ currentTime--
   ├─ timerText.setText(`Time: ${currentTime}`)
   └─ Update color:
      ├─ currentTime > 10  → GREEN  🟢
      ├─ currentTime 6-10  → YELLOW 🟡
      └─ currentTime ≤ 5   → RED    🔴

3. THREE POSSIBLE OUTCOMES:

   ┌─────────────────────────────────────────────────────────┐
   │ A) PLAYER COLLECTS CORRECT ANSWER (before 20s)          │
   ├─────────────────────────────────────────────────────────┤
   │ collectCorrectItem()                                     │
   │ ├─ stopQuestionTimer()                                  │
   │ │  ├─ timerEvent.remove()        ✅ Cancel countdown    │
   │ │  └─ timeUpEvent.remove()       ✅ Cancel timeout      │
   │ ├─ Destroy collectible                                  │
   │ ├─ Increment questionsAnswered                          │
   │ ├─ Show next question                                   │
   │ └─ startQuestionTimer()          🔄 New 20s timer       │
   └─────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │ B) PLAYER COLLECTS WRONG ANSWER (before 20s)            │
   ├─────────────────────────────────────────────────────────┤
   │ collectWrongItem()                                       │
   │ ├─ stopQuestionTimer()                                  │
   │ │  ├─ timerEvent.remove()        ✅ Cancel countdown    │
   │ │  └─ timeUpEvent.remove()       ✅ Cancel timeout      │
   │ ├─ Destroy collectible                                  │
   │ ├─ health -= 25                                         │
   │ ├─ mistakes++                                           │
   │ └─ Check if game over:                                  │
   │    ├─ YES → restartLevel()                              │
   │    └─ NO  → Continue (timer already stopped)            │
   └─────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │ C) TIME RUNS OUT (20 seconds elapsed)                   │
   ├─────────────────────────────────────────────────────────┤
   │ timeUpEvent fires (automatic)                            │
   │ ├─ stopQuestionTimer()          ✅ Self-cleanup         │
   │ ├─ timerText.setColor("#ff0000")                        │
   │ ├─ Flash timer (alpha tween)                            │
   │ ├─ health -= 25                                         │
   │ ├─ mistakes++                                           │
   │ ├─ Flash player red                                     │
   │ └─ Check if game over:                                  │
   │    ├─ YES → restartLevel()                              │
   │    └─ NO  → collectCorrectItem() with dummy object      │
   │             (auto-advance to next question)             │
   └─────────────────────────────────────────────────────────┘

4. REPEAT FOR NEXT QUESTION
   (Go back to step 1)
```

---

## 🎯 Phaser Time Events Detail

```
┌───────────────────────────────────────────────────────────────┐
│            TIMER EVENT (Repeating Countdown)                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  timerEvent = this.time.addEvent({                           │
│    delay: 1000,              ← Fire every 1000ms (1 second)  │
│    callback: () => {         ← Function to execute           │
│      currentTime--;          ← Decrement counter             │
│      timerText.setText(...);  ← Update display               │
│      // Change color logic                                   │
│    },                                                         │
│    loop: true,               ← Repeat forever (until removed)│
│    callbackScope: this       ← Bind 'this' to scene         │
│  });                                                          │
│                                                               │
│  BEHAVIOR:                                                    │
│  ├─ Fires: 0s, 1s, 2s, 3s ... 19s (20 times)               │
│  ├─ Stops: Only when .remove() is called                    │
│  └─ Purpose: Update visual display every second             │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│            TIME UP EVENT (One-Time Timeout)                   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  timeUpEvent = this.time.delayedCall(                        │
│    20000,                    ← Fire after 20000ms (20s)      │
│    () => {                   ← Function to execute           │
│      // Flash timer                                          │
│      // Reduce health                                        │
│      // Handle timeout                                       │
│    },                                                         │
│    [],                       ← Arguments (empty)             │
│    this                      ← Callback scope                │
│  );                                                           │
│                                                               │
│  BEHAVIOR:                                                    │
│  ├─ Fires: Once at 20 seconds                               │
│  ├─ Stops: When .remove() is called OR after firing         │
│  └─ Purpose: Handle "time's up" penalty                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                  WHY TWO SEPARATE EVENTS?                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  SEPARATION OF CONCERNS:                                      │
│  ├─ timerEvent   → Visual updates (UI responsibility)       │
│  └─ timeUpEvent  → Game logic (penalty responsibility)      │
│                                                               │
│  BENEFITS:                                                    │
│  ├─ Can stop display updates without triggering timeout     │
│  ├─ Can adjust display rate (e.g., 0.5s) without changing   │
│  │   timeout duration (still 20s)                           │
│  ├─ Clean code separation                                    │
│  └─ Easy to debug (separate console logs)                   │
│                                                               │
│  EXAMPLE:                                                     │
│  Player collects answer at 15s:                              │
│  ├─ timerEvent.remove()   → Stops "16, 15, 14..." display  │
│  └─ timeUpEvent.remove()  → Cancels timeout penalty         │
│  Both canceled independently ✅                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Transition Timeline

```
TIME: 20s ─────────────────────────────────────────────────────→ 0s

      🟢 GREEN                    🟡 YELLOW        🔴 RED
      │                          │                │
      ├──────────────────────────┼────────────────┼───────────►
      20s                       10s              5s            0s
      
      Relax & Think         Time Running Out    URGENT!     TIMEOUT!
      
      Color: #00ff00         Color: #ffff00     Color: #ff0000
      Message: "Plenty      Message: "Hurry    Message: "Answer
               of time"              up!"                NOW!"

Visual States:
├─ 20-11s: 🟢 Calm green background, steady display
├─ 10-6s:  🟡 Warning yellow, psychological pressure
├─ 5-0s:   🔴 Critical red, maximum urgency
└─ 0s:     🔴 Flash animation, timeout triggered
```

---

## 🔄 Memory Management

```
┌───────────────────────────────────────────────────────────────┐
│               PROPER CLEANUP PATTERN                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ CORRECT:                                                  │
│  function stopQuestionTimer() {                               │
│    if (timerEvent) {                                          │
│      timerEvent.remove();    ← Remove from Phaser's system   │
│      timerEvent = null;      ← Clear reference               │
│    }                                                          │
│    if (timeUpEvent) {                                         │
│      timeUpEvent.remove();   ← Remove from Phaser's system   │
│      timeUpEvent = null;     ← Clear reference               │
│    }                                                          │
│  }                                                            │
│                                                               │
│  ❌ WRONG:                                                    │
│  function stopQuestionTimer() {                               │
│    timerEvent = null;        ← Event still in Phaser!        │
│    timeUpEvent = null;       ← Will still fire!              │
│  }                                                            │
│                                                               │
│  WHAT HAPPENS IF NOT CLEANED:                                │
│  ├─ timerEvent continues running → Multiple timers!          │
│  ├─ timeUpEvent still fires → Double penalty!                │
│  ├─ Memory leak → Performance degradation                    │
│  └─ Unpredictable behavior → Game crashes                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📈 Performance Impact

```
┌─────────────────────────────────────────────────────────────┐
│                   TIMER SYSTEM OVERHEAD                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CPU Usage:                                                 │
│  ├─ timerEvent fires:    1 time per second                 │
│  ├─ Work done per fire:  Update text, change color         │
│  ├─ Complexity:          O(1) - constant time              │
│  └─ Impact:              Negligible (~0.1% CPU)            │
│                                                             │
│  Memory Usage:                                              │
│  ├─ timerText:          1 Text object (~1KB)               │
│  ├─ timerEvent:         1 TimerEvent (~0.5KB)              │
│  ├─ timeUpEvent:        1 DelayedCall (~0.5KB)             │
│  └─ Total:              ~2KB (insignificant)               │
│                                                             │
│  Network Impact:                                            │
│  └─ None (all client-side)                                 │
│                                                             │
│  Battery Impact (Mobile):                                   │
│  ├─ Text updates:       Low (1 per second)                 │
│  ├─ Color changes:      Low (0-3 per question)             │
│  └─ Overall:            Minimal                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 Summary

```
┌─────────────────────────────────────────────────────────────┐
│                  TIMER SYSTEM OVERVIEW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COMPONENTS:                                                │
│  ├─ 1 Text Display (top-right corner)                      │
│  ├─ 1 Repeating Timer Event (updates every 1s)             │
│  ├─ 1 Delayed Call Event (fires once at 20s)               │
│  └─ 2 Management Functions (start/stop)                    │
│                                                             │
│  FEATURES:                                                  │
│  ├─ ✅ 20-second countdown per question                     │
│  ├─ ✅ Color-coded visual feedback (green/yellow/red)       │
│  ├─ ✅ Automatic timeout handling (treats as wrong)         │
│  ├─ ✅ Proper cleanup (prevents memory leaks)               │
│  ├─ ✅ Seamless integration with game flow                  │
│  └─ ✅ Flash effects on timeout                             │
│                                                             │
│  INTEGRATION POINTS:                                        │
│  ├─ Starts: First question, each new question              │
│  ├─ Stops:  Correct answer, wrong answer, restart, complete│
│  └─ Automatic: Timeout triggers game logic                 │
│                                                             │
│  PLAYER EXPERIENCE:                                         │
│  ├─ Clear: Always know how much time remains               │
│  ├─ Fair:  20 seconds is enough but creates urgency        │
│  ├─ Engaging: Color changes add psychological pressure     │
│  └─ Forgiving: Timeout doesn't end game (just -25 health)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Result: A professional, polished timer system that enhances gameplay!** ⏱️🎮✨

