# Game HUD Setup Guide

## Overview
In-game HUD showing Chapter number, Artifact counter, and Countdown timer at the top of the screen.

---

## Complete Setup Instructions

### Step 1: Open Chapter1Scene
1. Double-click **Chapter1Scene** in Project panel

### Step 2: Find Existing Canvas
1. Look for **Canvas** in Hierarchy (should already exist from paper UI)
2. We'll add the HUD to this canvas

### Step 3: Create HUD Panel
1. Right-click **Canvas** > UI > Panel
2. Rename to "GameHUD"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **800**
   - Height: **80**
   - Pos X: **0**
   - Pos Y: **-50**
   - Pos Z: **0**
4. In Image component:
   - Color: Black with Alpha **150** (semi-transparent)

### Step 4: Create Chapter Text
1. Right-click **GameHUD** > UI > Text - TextMeshPro
2. Rename to "ChapterText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **left-center**
   - Width: **200**
   - Height: **60**
   - Pos X: **120**
   - Pos Y: **0**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**Chapter 1**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

### Step 5: Create Artifact Count Text
1. Right-click **GameHUD** > UI > Text - TextMeshPro
2. Rename to "ArtifactCountText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **350**
   - Height: **60**
   - Pos X: **0**
   - Pos Y: **0**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**0/10 Artifacts Collected**"
   - Font Size: **28**
   - Alignment: **Center**
   - Color: **White**

### Step 6: Create Timer Text
1. Right-click **GameHUD** > UI > Text - TextMeshPro
2. Rename to "TimerText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **right-center**
   - Width: **200**
   - Height: **60**
   - Pos X: **-120**
   - Pos Y: **0**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**Time: 10:00**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

### Step 7: Add HUD Manager Script
1. Right-click in Hierarchy > Create Empty
2. Rename to "HUDManager"
3. Add Component > **GameHUD** script
4. Assign references:
   - Hud Panel → drag **GameHUD** (the panel, not HUDManager)
   - Chapter Text → drag **ChapterText**
   - Artifact Count Text → drag **ArtifactCountText**
   - Timer Text → drag **TimerText**
5. Set values:
   - Chapter Number: **1**
   - Total Artifacts: **10**
   - Time Limit: **600** (10 minutes in seconds)

### Step 8: Test
1. Click Play
2. Tutorial should appear first - **HUD is hidden during tutorial**
3. Click through tutorial pages (NEXT → NEXT → START JOURNEY)
4. After closing tutorial, you should see:
   - "Chapter 1" on the left
   - "0/10 Artifacts Collected" in center
   - "Time: 10:00" on the right (counting down)
   - Timer starts counting down only after tutorial closes
5. Pick up a paper - counter should update to "1/10"

---

## Layout Preview

```
┌─────────────────────────────────────────────────┐
│ Chapter 1    0/10 Artifacts Collected  Time: 10:00 │
└─────────────────────────────────────────────────┘
```

---

## Features

### HUD Visibility:
- **Hidden during tutorial** - HUD is automatically hidden when tutorial appears
- **Shown after tutorial** - HUD appears when you click START JOURNEY
- Timer only starts counting down after tutorial closes

### Artifact Counter:
- Updates automatically when paper is picked up
- Shows current/total (e.g., "3/10")
- Triggers completion when all collected

### Timer:
- Counts down from 10 minutes
- Changes color:
  - **White**: More than 3 minutes left
  - **Yellow**: 1-3 minutes left
  - **Red**: Less than 1 minute left
- Triggers game over when time runs out

### Chapter Display:
- Shows current chapter number
- Can be changed in HUDManager settings

---

## Customization

### Change Time Limit:
1. Select HUDManager
2. Change "Time Limit" value (in seconds)
   - 300 = 5 minutes
   - 600 = 10 minutes
   - 900 = 15 minutes

### Change Total Artifacts:
1. Select HUDManager
2. Change "Total Artifacts" value
3. Make sure you have that many papers in the scene!

### Adjust Colors:
- Select each text element
- Change Color in TextMeshPro component

### Adjust Positions:
- Select GameHUD panel
- Change Pos Y to move entire HUD up/down

---

## Next Steps

After all artifacts are collected or time runs out, you'll need to create:
- **Completion Screen** (quiz unlock, score display)
- **Game Over Screen** (retry option)

---

Created for NU Quest - Full HD (1920x1080)
