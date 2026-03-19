# Completion Screen Setup Guide

## Overview
Congratulations panel that appears when all 10 artifacts are collected, with a 5-second countdown before teleporting to quiz scene.

---

## Complete Setup Instructions

### Step 1: Open Chapter1Scene
1. Double-click **Chapter1Scene** in Project panel

### Step 2: Find Existing Canvas
1. Look for **Canvas** in Hierarchy
2. We'll add the completion screen to this canvas

### Step 3: Create Completion Panel
1. Right-click **Canvas** > UI > Panel
2. Rename to "CompletionPanel"
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
1. Right-click **CompletionPanel** > UI > Panel
2. Rename to "ContentPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **800**
   - Height: **400**
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
   - Height: **80**
   - Pos X: **0**
   - Pos Y: **-60**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**CONGRATULATIONS!**"
   - Font Size: **48**
   - Alignment: **Center**
   - Color: **RGB(50, 50, 50)** - Dark gray
   - Font Style: **Bold**

### Step 6: Create Divider Line
1. Right-click **ContentPanel** > UI > Image
2. Rename to "DividerLine"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **700**
   - Height: **2**
   - Pos X: **0**
   - Pos Y: **-110**
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
   - Text: "**You have collected all artifacts!**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **RGB(50, 50, 50)** - Dark gray

### Step 8: Create Countdown Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "CountdownText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **bottom-center**
   - Width: **700**
   - Height: **60**
   - Pos X: **0**
   - Pos Y: **40**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**Teleporting to Chapter 2 in 5 seconds...**"
   - Font Size: **24**
   - Alignment: **Center**
   - Color: **RGB(100, 100, 100)** - Gray
   - Font Style: **Italic**

### Step 9: Add Completion Screen Manager Script
1. Right-click in Hierarchy > Create Empty
2. Rename to "CompletionManager"
3. Add Component > **CompletionScreen** script
4. Assign references:
   - Completion Panel → drag **CompletionPanel**
   - Background Blur → drag **CompletionPanel** (the outer panel)
   - Title Text → drag **TitleText**
   - Message Text → drag **MessageText**
   - Countdown Text → drag **CountdownText**

### Step 10: Hide Panel Initially
1. Select **CompletionPanel** in Hierarchy
2. Uncheck the checkbox at the top of Inspector (deactivate it)
3. Panel will be hidden until all artifacts collected

### Step 11: Test
1. Click Play
2. Complete tutorial
3. Collect all 10 papers
4. Completion screen should appear with:
   - "CONGRATULATIONS!" title
   - Message about collecting all artifacts
   - 5-second countdown showing "Teleporting to Chapter 2 in X seconds..."
5. After 5 seconds, should load Chapter2Scene

---

## Important: Add Scene to Build Settings

Before testing, you MUST add Chapter2Scene to Build Settings:

1. Go to **File > Build Settings**
2. Click **Add Open Scenes** (with Chapter2Scene open)
3. OR drag **Chapter2Scene** from Project panel into the list
4. Make sure it appears in the Scenes list
5. Click **Close**

Without this step, the scene transition will fail!

---

## Layout Preview

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │         CONGRATULATIONS!                  │ │
│  │  ─────────────────────────────────────    │ │
│  │                                           │ │
│  │   You have collected all artifacts!       │ │
│  │                                           │ │
│  │  Teleporting to quiz in 5 seconds...      │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Features

### Automatic Display:
- Appears when all 10 artifacts collected
- Freezes game (Time.timeScale = 0)
- Shows cursor for visibility
- Disables player movement

### Countdown Timer:
- 5-second countdown using unscaled time
- Updates every second showing "Teleporting to Chapter 2 in X seconds..."
- Automatically loads Chapter2Scene when done

### Visual Style:
- Semi-transparent black background (blur effect)
- Beige paper-style content panel
- Matches tutorial panel design
- Clean, centered layout

---

## Customization

### Change Countdown Time:
1. Open **CompletionScreen.cs**
2. Find line: `float countdown = 5f;`
3. Change to desired seconds (e.g., `3f` for 3 seconds)

### Change Message:
1. Select **MessageText** in Hierarchy
2. Edit text in TextMeshPro component
3. Can add multiple lines with line breaks

### Adjust Panel Size:
1. Select **ContentPanel**
2. Change Width/Height in Rect Transform
3. Adjust text widths to match

---

## Next Steps

After this screen:
- Add **Chapter2Scene** to Build Settings (File > Build Settings)
- Build Chapter 2 gameplay (similar to Chapter 1)
- Create quiz or challenge system for Chapter 2
- Add score calculation and chapter unlocking

---

Created for NU Quest - Full HD (1920x1080)
