# 🎨 Split-Screen Layout - Visual Guide

## Before & After Comparison

### BEFORE (Full Layout):
```
┌──────────────────────────────────────────────────────────┐
│                  ← Back to Menu                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              FULL SCREEN GAME (100%)                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │                                                │     │
│  │   Player: 👨‍💼                                    │     │
│  │                                                │     │
│  │   Floating Text (Full Answers):                │     │
│  │                                                │     │
│  │   ┌──────────────────────────┐                │     │
│  │   │ Time-series analysis     │  ← TOO LONG!   │     │
│  │   └──────────────────────────┘                │     │
│  │                                                │     │
│  │   ┌──────────────────────┐                    │     │
│  │   │ Clinical observation │                    │     │
│  │   └──────────────────────┘                    │     │
│  │                                                │     │
│  │   ┌────────────────────────────┐              │     │
│  │   │ Cross-sectional study      │              │     │
│  │   └────────────────────────────┘              │     │
│  │                                                │     │
│  │   ┌──────────────────────────┐                │     │
│  │   │ Qualitative research     │                │     │
│  │   └──────────────────────────┘                │     │
│  │                                                │     │
│  │   ❌ Cluttered with text                      │     │
│  │   ❌ Hard to read answers                     │     │
│  │   ❌ No clear question display                │     │
│  │                                                │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### AFTER (Split-Screen):
```
┌──────────────────────────────────────────────────────────────────────┐
│                      ← Back to Menu                                  │
├─────────────────────────────────────────┬────────────────────────────┤
│                                         │                            │
│      LEFT: GAME (65%)                   │   RIGHT: QUIZ (35%)        │
│                                         │                            │
│  ┌──────────────────────────────────┐   │  ┌──────────────────────┐ │
│  │                                  │   │  │   📝 Quiz Question   │ │
│  │   Player: 👨‍💼                     │   │  │ Question 1 of 5      │ │
│  │                                  │   │  └──────────────────────┘ │
│  │   Simple Letters:                │   │                            │
│  │                                  │   │  ┌──────────────────────┐ │
│  │   ┌───┐  ┌───┐                   │   │  │ What technique       │ │
│  │   │ A │  │ B │                   │   │  │ analyzes data?       │ │
│  │   └───┘  └───┘                   │   │  └──────────────────────┘ │
│  │                                  │   │                            │
│  │   ┌───┐  ┌───┐                   │   │  Answer Options:           │
│  │   │ C │  │ D │                   │   │  ┌──────────────────────┐ │
│  │   └───┘  └───┘                   │   │  │ ⓐ Clinical obs...    │ │
│  │                                  │   │  ├──────────────────────┤ │
│  │   ✅ Clean and simple             │   │  │ ⓑ Cross-sectional    │ │
│  │   ✅ Easy to identify             │   │  ├──────────────────────┤ │
│  │   ✅ No text overflow             │   │  │ ⓒ Time-series ✓     │ │
│  │                                  │   │  ├──────────────────────┤ │
│  │                                  │   │  │ ⓓ Qualitative res    │ │
│  │                                  │   │  └──────────────────────┘ │
│  │                                  │   │                            │
│  └──────────────────────────────────┘   │  ┌──────────────────────┐ │
│                                         │  │ 🎮 How to Play:      │ │
│                                         │  │ • Move wizard        │ │
│                                         │  │ • Collect C          │ │
│                                         │  │ • Avoid wrong        │ │
│                                         │  └──────────────────────┘ │
└─────────────────────────────────────────┴────────────────────────────┘
```

---

## Component Structure

### PhaserGameLauncher.jsx
```javascript
<div style={{ display: 'flex', flexDirection: 'column' }}>
  
  ┌─────────────────────────────────────────┐
  │ HEADER SECTION                          │
  │ • Back button                           │
  │ • Navigation controls                   │
  └─────────────────────────────────────────┘
  
  <div style={{ display: 'flex', flex: 1 }}>
    
    ┌──────────────────────────────┐  ┌──────────────────┐
    │ LEFT COLUMN (65%)            │  │ RIGHT COLUMN     │
    │                              │  │ (35%)            │
    │ <div style={{               │  │                  │
    │   width: '65%',             │  │ <QuizPanel       │
    │   display: 'flex',          │  │   quizData={...} │
    │   alignItems: 'center'      │  │ />               │
    │ }}>                         │  │                  │
    │                              │  │                  │
    │   <Level1                   │  │                  │
    │     quizData={quizData}     │  │                  │
    │     onComplete={...}        │  │                  │
    │   />                        │  │                  │
    │                              │  │                  │
    │ </div>                      │  │                  │
    └──────────────────────────────┘  └──────────────────┘
    
  </div>
  
</div>
```

---

## QuizPanel Component Breakdown

```
┌────────────────────────────────────────┐
│         QUIZ PANEL (35% width)         │
├────────────────────────────────────────┤
│                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ HEADER SECTION                 ┃  │
│  ┃ • "Quiz Question" title        ┃  │
│  ┃ • "Question 1 of 5" counter    ┃  │
│  ┃ • Border bottom separator      ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ QUESTION DISPLAY               ┃  │
│  ┃ • Blue accent border           ┃  │
│  ┃ • Dark background (#0f3460)    ┃  │
│  ┃ • Large 18px text              ┃  │
│  ┃ • Rounded corners              ┃  │
│  ┃                                ┃  │
│  ┃ "What technique is used to    ┃  │
│  ┃  analyze patient data over    ┃  │
│  ┃  time?"                        ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ANSWER OPTIONS                 ┃  │
│  ┃                                ┃  │
│  ┃ ┌────────────────────────────┐ ┃  │
│  ┃ │ ⓐ Clinical observation     │ ┃  │
│  ┃ │   Blue badge               │ ┃  │
│  ┃ │   Gray border              │ ┃  │
│  ┃ └────────────────────────────┘ ┃  │
│  ┃                                ┃  │
│  ┃ ┌────────────────────────────┐ ┃  │
│  ┃ │ ⓑ Cross-sectional study    │ ┃  │
│  ┃ │   Blue badge               │ ┃  │
│  ┃ │   Gray border              │ ┃  │
│  ┃ └────────────────────────────┘ ┃  │
│  ┃                                ┃  │
│  ┃ ┌────────────────────────────┐ ┃  │
│  ┃ │ ⓒ Time-series analysis ✓   │ ┃  │
│  ┃ │   GREEN badge              │ ┃  │
│  ┃ │   GREEN border             │ ┃  │
│  ┃ │   Green background tint    │ ┃  │
│  ┃ └────────────────────────────┘ ┃  │
│  ┃                                ┃  │
│  ┃ ┌────────────────────────────┐ ┃  │
│  ┃ │ ⓓ Qualitative research     │ ┃  │
│  ┃ │   Blue badge               │ ┃  │
│  ┃ │   Gray border              │ ┃  │
│  ┃ └────────────────────────────┘ ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                        │
│  ▼ ▼ ▼ FLEX SPACER (auto) ▼ ▼ ▼      │
│                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ INSTRUCTIONS PANEL             ┃  │
│  ┃ • Sticky to bottom             ┃  │
│  ┃ • marginTop: 'auto'            ┃  │
│  ┃ • Light blue background        ┃  │
│  ┃                                ┃  │
│  ┃ 🎮 How to Play:                ┃  │
│  ┃ • Move your wizard             ┃  │
│  ┃ • Collect correct letter       ┃  │
│  ┃ • Avoid wrong letters          ┃  │
│  ┃ • Green = correct answer       ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                        │
└────────────────────────────────────────┘
```

---

## Letter Generation Logic Flow

```
START createKeyword(isCorrect)
     |
     v
┌─────────────────────────────────────┐
│ currentQuestion = {                 │
│   question: "What analyzes data?"   │
│   options: [                        │
│     "Clinical observation",    [0]  │
│     "Cross-sectional study",   [1]  │
│     "Time-series analysis",    [2]  │ ← correctAnswer
│     "Qualitative research"     [3]  │
│   ]                                 │
│ }                                   │
└─────────────────────────────────────┘
     |
     v
┌─────────────────────────────────────┐
│ Is this the correct bubble?         │
└─────────────────────────────────────┘
     |                      |
     v YES                  v NO
┌──────────────────┐   ┌────────────────────┐
│ Find index of    │   │ Get wrong indices: │
│ correct answer:  │   │ [0, 1, 3]         │
│                  │   │ (not 2)           │
│ indexOf(         │   │                    │
│   "Time-series"  │   │ Filter used:       │
│ ) = 2            │   │ [0, 1, 3] - []    │
│                  │   │ = [0, 1, 3]       │
│ Convert to       │   │                    │
│ letter:          │   │ Random select:     │
│ 65 + 2 = 67      │   │ index = 1          │
│ = 'C'            │   │                    │
│                  │   │ Convert to letter: │
│                  │   │ 65 + 1 = 66       │
│                  │   │ = 'B'             │
└──────────────────┘   └────────────────────┘
     |                      |
     └──────────┬───────────┘
                v
┌──────────────────────────────────────┐
│ Create Text with Letter:             │
│ fontSize: "32px"                     │
│ fontStyle: "bold"                    │
│ stroke: "#000000"                    │
│ strokeThickness: 4                   │
└──────────────────────────────────────┘
     |
     v
┌──────────────────────────────────────┐
│ Measure Text Bounds:                 │
│ textBounds = text.getBounds()        │
│ textWidth = bounds.width             │
│ textHeight = bounds.height           │
└──────────────────────────────────────┘
     |
     v
┌──────────────────────────────────────┐
│ Calculate Circle Size:               │
│ padding = 25px                       │
│ shapeWidth = textWidth + 50          │
│ shapeHeight = textHeight + 50        │
│ radius = max(width, height) / 2      │
└──────────────────────────────────────┘
     |
     v
┌──────────────────────────────────────┐
│ Draw Purple Circle:                  │
│ graphics.fillCircle(0, 0, radius)    │
│ graphics.strokeCircle(0, 0, radius)  │
└──────────────────────────────────────┘
     |
     v
┌──────────────────────────────────────┐
│ Position at (x, y):                  │
│ graphics.setPosition(x, y)           │
│ text.setPosition(x, y)               │
└──────────────────────────────────────┘
     |
     v
┌──────────────────────────────────────┐
│ Create Physics Body:                 │
│ collectible.body.setCircle(radius)   │
└──────────────────────────────────────┘
     |
     v
    END
```

---

## Letter to Answer Mapping

```
QuizPanel (Right Side):              Level1 Game (Left Side):

┌──────────────────────────────┐     ┌──────────────────────────┐
│ A) Clinical observation      │ ←── │  [A]                     │
│    Blue badge                │     │   ↑                      │
│                              │     │   Floating purple circle │
├──────────────────────────────┤     ├──────────────────────────┤
│ B) Cross-sectional study     │ ←── │  [B]                     │
│    Blue badge                │     │   ↑                      │
│                              │     │   Floating purple circle │
├──────────────────────────────┤     ├──────────────────────────┤
│ C) Time-series analysis ✓    │ ←── │  [C]  ← COLLECT THIS!    │
│    GREEN badge (correct!)    │     │   ↑                      │
│    Green border              │     │   Floating purple circle │
├──────────────────────────────┤     ├──────────────────────────┤
│ D) Qualitative research      │ ←── │  [D]                     │
│    Blue badge                │     │   ↑                      │
│                              │     │   Floating purple circle │
└──────────────────────────────┘     └──────────────────────────┘

Player sees green highlight → Knows to collect [C]
```

---

## Responsive Behavior

### Desktop (>1200px):
```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├─────────────────────────────────────┬───────────────────┤
│                                     │                   │
│     Game (65%)                      │   Quiz (35%)      │
│     Full size                       │   Full width      │
│                                     │                   │
└─────────────────────────────────────┴───────────────────┘
```

### Tablet (768px - 1200px):
```
┌────────────────────────────────────────────────┐
│ Header                                         │
├─────────────────────────────┬──────────────────┤
│                             │                  │
│   Game (60%)                │  Quiz (40%)      │
│   Slightly smaller          │  More space      │
│                             │                  │
└─────────────────────────────┴──────────────────┘
```

### Mobile (< 768px):
```
┌──────────────────────┐
│ Header               │
├──────────────────────┤
│                      │
│ Quiz Panel (100%)    │
│ • Question           │
│ • Options            │
│                      │
├──────────────────────┤
│                      │
│ Game (100%)          │
│ • Stacked below      │
│                      │
└──────────────────────┘
```

*(Note: Mobile responsive CSS would need to be added)*

---

## Color-Coding System

### Answer Option States:

**Wrong Answer (Not Selected):**
```css
background: #1a1a2e (dark)
border: 2px solid #2c3e50 (gray)
badge: #3498db (blue)
```

**Correct Answer (Highlighted):**
```css
background: rgba(39, 174, 96, 0.1) (light green tint)
border: 2px solid #27ae60 (green)
badge: #27ae60 (green)
```

**Visual Example:**
```
Wrong:  ┌─────────────────────────┐
        │ ⓑ  Option text         │  Gray border
        └─────────────────────────┘  Blue badge

Correct: ┌─────────────────────────┐
         │ ⓒ  Option text        │  Green border
         └─────────────────────────┘  Green badge
                                      Green tint
```

---

## Animation & Interaction

### Floating Letters Animation:
```javascript
// In Level1.jsx
sceneRef.tweens.add({
  targets: [graphics, text],
  y: y - 8,              // Float up 8px
  duration: 1500,        // Over 1.5 seconds
  yoyo: true,            // Return to start
  repeat: -1,            // Loop forever
  ease: "Sine.easeInOut" // Smooth easing
});
```

**Visual Effect:**
```
Frame 1:  [C]     ← Start position
          ↓
Frame 2:   [C]    ← Moves up 8px
          ↓
Frame 3:  [C]     ← Returns to start
          ↓
Repeat...
```

---

## Summary Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    SPLIT-SCREEN QUIZ GAME                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                            ┃
┃  LEFT (65%)                      RIGHT (35%)               ┃
┃  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━  ┃
┃                                                            ┃
┃  🎮 PHASER GAME                  📝 QUIZ PANEL             ┃
┃                                                            ┃
┃  ┌──────────────────────┐        ┌────────────────────┐   ┃
┃  │ Wizard Character 🧙  │        │ Question Display   │   ┃
┃  │                      │        └────────────────────┘   ┃
┃  │ [A] [B] [C] [D]      │        ┌────────────────────┐   ┃
┃  │  ↑   ↑   ↑   ↑       │        │ A) Option 1        │   ┃
┃  │ Letters only!        │        │ B) Option 2        │   ┃
┃  │                      │        │ C) Option 3 ✓      │   ┃
┃  │ Simple & Clean       │        │ D) Option 4        │   ┃
┃  └──────────────────────┘        └────────────────────┘   ┃
┃                                  ┌────────────────────┐   ┃
┃  Benefits:                       │ Instructions       │   ┃
┃  ✅ No text clutter              └────────────────────┘   ┃
┃  ✅ Easy to identify                                      ┃
┃  ✅ Uniform bubbles              Benefits:                ┃
┃  ✅ Fast gameplay                ✅ Full question text    ┃
┃                                  ✅ Complete answers       ┃
┃                                  ✅ Clear instructions     ┃
┃                                  ✅ Progress tracking      ┃
┃                                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Result:** Professional, educational quiz game with optimal UX! 🎉
