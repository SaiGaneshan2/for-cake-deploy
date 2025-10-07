# 🚀 Split-Screen Layout - Quick Reference

## What Changed?

### ✅ PhaserGameLauncher.jsx
- **Added:** `QuizPanel` component (lines 8-155)
- **Modified:** Split-screen layout with Flexbox (65% game / 35% quiz)
- **Features:** Question display, A/B/C/D options with green highlight for correct answer

### ✅ Level1.jsx  
- **Modified:** `createKeyword` function to generate letters (A, B, C, D)
- **Changed:** Font size to 32px for letters
- **Simplified:** Always use circular bubbles for uniform appearance

---

## How It Works

### Game Flow:
```
1. Player clicks "PLAY" 
   ↓
2. Split-screen appears:
   • Left: Phaser game with floating letters [A] [B] [C] [D]
   • Right: Quiz panel with full question and answers
   ↓
3. Player reads question on right
   ↓
4. Correct answer highlighted in GREEN
   ↓
5. Player moves wizard to collect correct letter
   ↓
6. Next question loads automatically
```

### Letter Mapping:
```javascript
Option Index → Letter
    0       →   A
    1       →   B
    2       →   C
    3       →   D

Example:
options[2] = "Time-series analysis" (correct)
→ Game shows [C] as correct collectible
→ Right panel shows C highlighted in green
```

---

## Key Features

### QuizPanel (Right Side):
✅ Question counter ("Question 1 of 5")
✅ Question text in highlighted box
✅ Four labeled options (A, B, C, D) with full text
✅ Green highlight for correct answer
✅ Sticky instructions at bottom

### Game (Left Side):
✅ Four floating letters: A, B, C, D
✅ Large 32px font for visibility
✅ Circular purple bubbles
✅ Dynamic sizing based on text
✅ Floating animation

---

## Visual Structure

```
┌────────────────────────────────────────────────┐
│ Header: ← Back to Menu                        │
├─────────────────────────────┬──────────────────┤
│                             │                  │
│ LEFT: Game (65%)            │ RIGHT: Quiz (35%)│
│ • Wizard character          │ • Question text  │
│ • Letters A, B, C, D        │ • Full answers   │
│ • Collect correct letter    │ • Green highlight│
│                             │ • Instructions   │
└─────────────────────────────┴──────────────────┘
```

---

## Testing Checklist

- [ ] Start server: `node server.js`
- [ ] Create quiz with questions
- [ ] Click "Play Quiz Now"
- [ ] Verify split-screen layout appears
- [ ] Check left side shows letters A-D
- [ ] Check right side shows full question
- [ ] Verify correct answer highlighted green
- [ ] Collect correct letter in game
- [ ] Verify next question loads

---

## Files Modified

1. `src/components/PhaserGameLauncher.jsx`
   - Added QuizPanel component
   - Changed layout to Flexbox split-screen
   
2. `src/components/levels/Level1.jsx`
   - Modified createKeyword to show letters
   - Increased font size to 32px
   - Always use circular bubbles

---

## Color Scheme

- **Game Background:** `#1a1a2e` (dark blue)
- **Panel Background:** `#16213e` (darker blue)
- **Correct Answer:** `#27ae60` (green)
- **Wrong Answers:** `#3498db` (blue)
- **Text:** `#ecf0f1` (light gray)

---

## Benefits

✅ **Cleaner Game** - No long text cluttering gameplay
✅ **Better Readability** - Full answers visible on right
✅ **Clear Instructions** - Always visible in panel
✅ **Professional Design** - Modern split-screen layout
✅ **Educational** - Students see complete information
✅ **Scalable** - Handles any answer length

---

## Common Issues & Solutions

**Q: Letters not showing up?**
→ Check that `currentQuestion.options` has 4 items

**Q: Wrong letter highlighted?**
→ Verify `correctAnswer` matches one of the `options`

**Q: Layout looks broken?**
→ Ensure parent div has `display: flex`

**Q: Quiz panel scrolling weird?**
→ Check `overflowY: 'auto'` is set on panel

---

## Next Steps

1. **Test the new layout** with real quiz data
2. **Adjust column widths** if needed (currently 65/35)
3. **Add mobile responsive** styles for smaller screens
4. **Implement question navigation** to move between questions
5. **Add animations** for correct/wrong answer feedback

---

**Result:** Professional split-screen quiz game! 🎉
