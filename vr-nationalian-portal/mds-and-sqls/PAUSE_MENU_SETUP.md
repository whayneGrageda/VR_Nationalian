# Pause Menu Setup Guide

## Overview
Add a settings button to the HUD that opens a pause menu with options to Resume, Restart Level, and Return to Lobby.

---

## Part 1: Add Settings Button to HUD

### Step 1: Open Chapter1Scene
1. Double-click **Chapter1Scene** in Project panel

### Step 2: Add Settings Button to GameHUD Panel
1. In Hierarchy, find **GameHUD** panel (inside Canvas)
2. Right-click **GameHUD** > UI > Button - TextMeshPro
3. Rename to "SettingsButton"
4. Rect Transform:
   - Anchor preset: Hold **Alt** + click **right-center**
   - Width: **50**
   - Height: **50**
   - Pos X: **-30**
   - Pos Y: **0**
   - Pos Z: **0**
5. In Image component:
   - Color: **RGB(50, 50, 50)** - Dark gray

### Step 3: Edit Settings Button Text
1. Expand **SettingsButton** in Hierarchy
2. Select **Text (TMP)** child object
3. TextMeshPro component:
   - Text: "**☰**" (menu icon) or "**⚙**" (gear icon)
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

---

## Part 2: Create Pause Menu Panel

### Step 4: Create Pause Menu Background
1. Right-click **Canvas** > UI > Panel
2. Rename to "PauseMenuPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **stretch-stretch** (fills screen)
   - Left: **0**
   - Top: **0**
   - Right: **0**
   - Bottom: **0**
   - Pos Z: **0**
4. In Image component:
   - Color: Black with Alpha **200** (semi-transparent)

### Step 5: Create Content Panel
1. Right-click **PauseMenuPanel** > UI > Panel
2. Rename to "ContentPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **500**
   - Height: **450**
   - Pos X: **0**
   - Pos Y: **0**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(245, 235, 220)** - Beige/paper color

### Step 6: Create Title Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "TitleText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **400**
   - Height: **80**
   - Pos X: **0**
   - Pos Y: **-50**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "**PAUSED**"
   - Font Size: **48**
   - Alignment: **Center**
   - Color: **RGB(50, 50, 50)** - Dark gray
   - Font Style: **Bold**

### Step 7: Create Divider Line
1. Right-click **ContentPanel** > UI > Image
2. Rename to "DividerLine"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **400**
   - Height: **2**
   - Pos X: **0**
   - Pos Y: **-100**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(100, 100, 100)** - Gray

---

## Part 3: Create Menu Buttons

### Step 8: Create Resume Button
1. Right-click **ContentPanel** > UI > Button - TextMeshPro
2. Rename to "ResumeButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **350**
   - Height: **70**
   - Pos X: **0**
   - Pos Y: **70**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(76, 175, 80)** - Green

### Step 9: Edit Resume Button Text
1. Expand **ResumeButton**
2. Select **Text (TMP)** child
3. TextMeshPro component:
   - Text: "**RESUME**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

### Step 10: Create Restart Button
1. Right-click **ContentPanel** > UI > Button - TextMeshPro
2. Rename to "RestartButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **350**
   - Height: **70**
   - Pos X: **0**
   - Pos Y: **-10**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(255, 152, 0)** - Orange

### Step 11: Edit Restart Button Text
1. Expand **RestartButton**
2. Select **Text (TMP)** child
3. TextMeshPro component:
   - Text: "**RESTART LEVEL**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

### Step 12: Create Lobby Button
1. Right-click **ContentPanel** > UI > Button - TextMeshPro
2. Rename to "LobbyButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **350**
   - Height: **70**
   - Pos X: **0**
   - Pos Y: **-90**
   - Pos Z: **0**
4. In Image component:
   - Color: **RGB(244, 67, 54)** - Red

### Step 13: Edit Lobby Button Text
1. Expand **LobbyButton**
2. Select **Text (TMP)** child
3. TextMeshPro component:
   - Text: "**BACK TO LOBBY**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**
   - Font Style: **Bold**

---

## Part 4: Add Pause Menu Script

### Step 14: Create Pause Menu Manager
1. Right-click in Hierarchy > Create Empty
2. Rename to "PauseMenuManager"
3. Add Component > **PauseMenu** script
4. Assign references:
   - Pause Menu Panel → drag **PauseMenuPanel**
   - Resume Button → drag **ResumeButton**
   - Restart Button → drag **RestartButton**
   - Lobby Button → drag **LobbyButton**
   - Settings Button → drag **SettingsButton** (from GameHUD)

### Step 15: Connect Button Click Events

**Resume Button:**
1. Select **ResumeButton**
2. In Button component, find **On Click ()**
3. Click **+** button
4. Drag **PauseMenuManager** into object field
5. Select **PauseMenu > ResumeGame()**

**Restart Button:**
1. Select **RestartButton**
2. In Button component, find **On Click ()**
3. Click **+** button
4. Drag **PauseMenuManager** into object field
5. Select **PauseMenu > RestartLevel()**

**Lobby Button:**
1. Select **LobbyButton**
2. In Button component, find **On Click ()**
3. Click **+** button
4. Drag **PauseMenuManager** into object field
5. Select **PauseMenu > ReturnToLobby()**

### Step 16: Hide Pause Menu Initially
1. Select **PauseMenuPanel** in Hierarchy
2. Uncheck the checkbox at top of Inspector (deactivate it)
3. Panel will be hidden until settings button clicked

---

## Part 5: Test

### Step 17: Test Pause Menu
1. Click Play
2. Complete tutorial
3. Click the **☰** button in top-right of HUD
4. Pause menu should appear
5. Test each button:
   - **RESUME** → closes menu, continues game
   - **RESTART LEVEL** → reloads scene from beginning
   - **BACK TO LOBBY** → returns to lobby scene
6. Press **ESC** key → should also open/close pause menu

---

## Layout Preview

```
┌─────────────────────────────────────────────────────────┐
│ Chapter 1   0/10 Artifacts   Time: 10:00   [☰]         │
└─────────────────────────────────────────────────────────┘

                    (When paused)
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │                  PAUSED                         │   │
│  │  ───────────────────────────────────────────    │   │
│  │                                                 │   │
│  │         ┌─────────────────────┐                │   │
│  │         │      RESUME         │                │   │
│  │         └─────────────────────┘                │   │
│  │                                                 │   │
│  │         ┌─────────────────────┐                │   │
│  │         │   RESTART LEVEL     │                │   │
│  │         └─────────────────────┘                │   │
│  │                                                 │   │
│  │         ┌─────────────────────┐                │   │
│  │         │   BACK TO LOBBY     │                │   │
│  │         └─────────────────────┘                │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Pause Functionality:
- Freezes game (Time.timeScale = 0)
- Shows cursor for menu interaction
- Disables player movement and camera
- Can be opened with settings button or ESC key

### Resume:
- Closes pause menu
- Unfreezes game
- Hides cursor and locks it
- Re-enables player controls

### Restart Level:
- Reloads current scene
- Resets timer, artifacts, and all progress
- Starts from tutorial again

### Back to Lobby:
- Returns to lobby scene
- Progress is saved (chapter completion already in database)
- Can select different chapter

---

## Customization

### Change Button Colors:
- Green (Resume): RGB(76, 175, 80)
- Orange (Restart): RGB(255, 152, 0)
- Red (Lobby): RGB(244, 67, 54)

### Change Settings Icon:
- "☰" - Hamburger menu (3 lines)
- "⚙" - Gear icon
- "⋮" - Vertical dots
- Or use an image sprite

---

Created for NU Quest - Full HD (1920x1080)
