# Lobby Screen Setup Guide

## Complete Step-by-Step Instructions

### Step 1: Create Canvas
1. Right-click in Hierarchy > UI > Canvas

### Step 2: Create Background
1. Right-click Canvas > UI > Image
2. Rename to "Background"
3. Rect Transform:
   - Anchor preset: Hold **Shift + Alt** + click **bottom-right**
   - Left: **0**, Right: **0**, Top: **0**, Bottom: **0**
4. Set Color to your preferred background color

### Step 3: Create Welcome Text
1. Right-click Canvas > UI > Legacy > Text
2. Rename to "WelcomeText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **400**, Height: **60**
   - Pos X: **0**, Pos Y: **-50**, Pos Z: **0**
4. Text component:
   - Text: "**Welcome, Player!**"
   - Font Size: **36**
   - Alignment: **Center**
   - Color: **White**

### Step 4: Create Chapter Panel
1. Right-click Canvas > UI > Panel
2. Rename to "ChapterPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **600**, Height: **600**
   - Pos X: **0**, Pos Y: **-50**, Pos Z: **0**
4. Set Color with Alpha around **150**

### Step 5: Create Chapter 1 Button (Top-Left)
1. Right-click **ChapterPanel** > UI > Button
2. Rename to "Chapter1Button"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **250**, Height: **250**
   - Pos X: **-150**, Pos Y: **150**, Pos Z: **0**
4. Expand > Click "Text"
5. Text: "**Chapter 1**", Font Size: **28**

### Step 6: Create Chapter 2 Button (Top-Right)
1. Right-click **ChapterPanel** > UI > Button
2. Rename to "Chapter2Button"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **250**, Height: **250**
   - Pos X: **150**, Pos Y: **150**, Pos Z: **0**
4. **Uncheck "Interactable"** in Button component
5. Expand > Click "Text"
6. Text: "**Chapter 2\n(Locked)**", Font Size: **28**
7. Select button, set Image Color to **Gray**

### Step 7: Create Chapter 3 Button (Bottom-Left)
1. Right-click **ChapterPanel** > UI > Button
2. Rename to "Chapter3Button"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **250**, Height: **250**
   - Pos X: **-150**, Pos Y: **-150**, Pos Z: **0**
4. **Uncheck "Interactable"**
5. Expand > Click "Text"
6. Text: "**Chapter 3\n(Locked)**", Font Size: **28**
7. Set Image Color to **Gray**

### Step 8: Create Chapter 4 Button (Bottom-Right)
1. Right-click **ChapterPanel** > UI > Button
2. Rename to "Chapter4Button"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **250**, Height: **250**
   - Pos X: **150**, Pos Y: **-150**, Pos Z: **0**
4. **Uncheck "Interactable"**
5. Expand > Click "Text"
6. Text: "**Chapter 4\n(Locked)**", Font Size: **28**
7. Set Image Color to **Gray**

### Step 9: Add Script
1. Create Empty GameObject > Rename to "LobbyManager"
2. Add Component > LobbyScreen script
3. Assign all references:
   - Chapter1 Button → **Chapter1Button**
   - Chapter2 Button → **Chapter2Button**
   - Chapter3 Button → **Chapter3Button**
   - Chapter4 Button → **Chapter4Button**
   - Welcome Text → **WelcomeText**

---

## Script Code

See LobbyScreen.cs in Assets folder

---

## Layout
```
┌─────────────────────────────┐
│    Welcome, Username!       │
├─────────────────────────────┤
│  ┌──────────┬──────────┐   │
│  │Chapter 1 │Chapter 2 │   │
│  │          │ (Locked) │   │
│  ├──────────┼──────────┤   │
│  │Chapter 3 │Chapter 4 │   │
│  │ (Locked) │ (Locked) │   │
│  └──────────┴──────────┘   │
└─────────────────────────────┘
```
