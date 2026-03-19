# Game Over Screen Setup Guide

## Overview
Game over panel that appears when the 10-minute timer reaches 0, with a restart button to try again.

---

## Complete Setup Instructions

### Step 1: Open Chapter1Scene
1. Double-click **Chapter1Scene** in Project panel

### Step 2: Find Existing Canvas
1. Look for **Canvas** in Hierarchy
2. We'll add the game over screen to this canvas

### Step 3: Create Game Over Panel
1. Right-click **Canvas** > UI > Panel
2. Rename to "GameOverPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **stretch-stretch** (fills entire screen)
   - Left: **0**
   - Top: **0**
   - Right: **0**
   - Bottom: **0**
   - Pos Z: **0**
4. In Image component:
   - Color: Black with Alpha **200** (semi-transparent background blur)

### Step 4: Create Content Panel (Paper Style)
1. Right-click **GameOverPanel** > UI > Panel
2. Rename to "ContentPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **800**
   - Height: **500**
   - Pos X: **0**
   - Pos Y: **0**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(245, 235, 220)** - Beige/paper color

### Step 5: Create Title Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "TitleText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **700**
   - Height: **100**
   - Pos X: **0**
   - Pos Y: **-70**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**GAME OVER!**"
   - Font Size: **60**
   - Alignment: **Center**
   - Color: **RGB(139, 0, 0)** - Dark red
   - Font Style: **Bold**

### Step 6: Create Divider Line
1. Right-click **ContentPanel** > UI > Image
2. Rename to "DividerLine"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **700**
   - Height: **2**
   - Pos X: **0**
   - Pos Y: **-130**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(100, 100, 100)** - Gray

### Step 7: Create Message Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "MessageText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **700**
   - Height: **150**
   - Pos X: **0**
   - Pos Y: **20**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**Time's up! You ran out of time to collect all the artifacts.\n\nTry again and be faster!**"
   - Font Size: **28**
   - Alignment: **Center**
   - Color: **RGB(50, 50, 50)** - Dark gray

### Step 8: Create Restart Button
1. Right-click **ContentPanel** > UI > Button - TextMeshPro
2. Rename to "RestartButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **bottom-center**
   - Width: **300**
   - Height: **70**
   - Pos X: **0**
   - Pos Y: **60**
   - Pos Z: **0**
4. In Image component (button background):
   - Color: **RGB(25, 25, 112)** - Dark blue (midnight blue)

### Step 9: Edit Button Text
1. Expand **RestartButton** in Hierarchy
2. Select **Text (TMP)** child object
3. TextMeshPro component:
   - Text: "**RESTART**"
   - Font Size: **36**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

### Step 10: Add Game Over Manager Script
1. Right-click in Hierarchy > Create Empty
2. Rename to "GameOverManager"
3. Add Component > **GameOverScreen** script
4. Assign references:
   - Game Over Panel → drag **GameOverPanel**
   - Background Blur → drag **GameOverPanel** (the outer panel)
   - Title Text → drag **TitleText**
   - Message Text → drag **MessageText**
   - Restart Button → drag **RestartButton**
   - Button Text → drag **Text (TMP)** (child of RestartButton)

### Step 11: Connect Button Click Event
1. Select **RestartButton** in Hierarchy
2. In Button component, find **On Click ()** section
3. Click the **+** button to add new event
4. Drag **GameOverManager** into the object field
5. Click dropdown (says "No Function")
6. Select **GameOverScreen > OnRestartButtonClicked()**

### Step 12: Hide Panel Initially
1. Select **GameOverPanel** in Hierarchy
2. Uncheck the checkbox at the top of Inspector (deactivate it)
3. Panel will be hidden until timer reaches 0

### Step 13: Test
1. Click Play
2. Complete tutorial
3. Wait for timer to reach 0:00 (or temporarily change Time Limit to 10 seconds in HUDManager for quick testing)
4. Game over screen should appear
5. Click RESTART button
6. Scene should reload and start fresh

---

## Layout Preview

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │            GAME OVER!                     │ │
│  │  ─────────────────────────────────────    │ │
│  │                                           │ │
│  │   Time's up! You ran out of time to      │ │
│  │   collect all the artifacts.              │ │
│  │                                           │ │
│  │   Try again and be faster!                │ │
│  │                                           │ │
│  │         ┌─────────────┐                   │ │
│  │         │   RESTART   │                   │ │
│  │         └─────────────┘                   │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Features

### Automatic Display:
- Appears when timer reaches 0:00
- Freezes game (Time.timeScale = 0)
- Shows cursor for button interaction
- Disables player movement

### Restart Button:
- Reloads the current scene (Chapter1Scene)
- Resets timer, artifact count, and all papers
- Starts fresh from tutorial

### Visual Style:
- Semi-transparent black background (blur effect)
- Beige paper-style content panel
- Dark red "GAME OVER!" title for urgency
- Matches tutorial and completion panel design
- Dark blue button (midnight blue)

---

## Customization

### Change Message:
1. Select **MessageText** in Hierarchy
2. Edit text in TextMeshPro component
3. Can add encouragement or tips

### Change Button Color:
1. Select **RestartButton**
2. Change Color in Image component
3. Try different colors (green for retry, red for danger, etc.)

### Change Title Color:
1. Select **TitleText**
2. Change Color in TextMeshPro component
3. Current: Dark red for dramatic effect

### Quick Testing:
1. Select **HUDManager** in Hierarchy
2. Change "Time Limit" to **10** (10 seconds)
3. Play and wait 10 seconds to test game over

---

## Next Steps

After this screen:
- Create **Completion Screen** UI (when all artifacts collected)
- Create **Quiz Scene** for after completion
- Add score calculation system

---

Created for NU Quest - Full HD (1920x1080)
