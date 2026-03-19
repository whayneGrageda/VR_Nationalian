# How to Play Tutorial Setup Guide

## Overview
Multi-page tutorial system that appears automatically when Chapter 1 starts, with background blur and player freeze.

---

## Complete Setup Instructions

### Step 1: Open Chapter1Scene
1. Double-click **Chapter1Scene** in Project panel

### Step 2: Create Tutorial Panel
1. Find the existing **Canvas** in Hierarchy
2. Right-click Canvas > UI > Panel
3. Rename to "TutorialPanel"
4. Rect Transform:
   - Anchor preset: Hold **Shift + Alt** + click **bottom-right** (stretch both)
   - Left: **0**, Right: **0**, Top: **0**, Bottom: **0**
5. In Image component:
   - Color: Black with Alpha **180** (for blur effect)

### Step 3: Create Content Panel (Paper Background)
1. Right-click **TutorialPanel** > UI > Image
2. Rename to "ContentPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **800**
   - Height: **600**
   - Pos X: **0**, Pos Y: **0**, Pos Z: **0**
4. In Image component:
   - Color: Light beige/paper color (RGB: 240, 230, 210)
   - Or import a paper texture and assign to Source Image

### Step 4: Create Title Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "TitleText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **top-center**
   - Width: **700**, Height: **80**
   - Pos X: **0**, Pos Y: **-50**, Pos Z: **0**
4. TextMeshPro component:
   - Text: "**HOW TO PLAY**"
   - Font Size: **48**
   - Alignment: **Center**
   - Color: **Black**
   - Font Style: **Bold**

### Step 5: Create Content Text
1. Right-click **ContentPanel** > UI > Text - TextMeshPro
2. Rename to "ContentText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **700**, Height: **400**
   - Pos X: **0**, Pos Y: **0**, Pos Z: **0**
4. TextMeshPro component:
   - Text: "Welcome, Nationalian!"
   - Font Size: **28**
   - Alignment: **Top Left**
   - Color: **Black**

### Step 6: Create Navigation Button
1. Right-click **ContentPanel** > UI > Button - TextMeshPro
2. Rename to "NavigationButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **bottom-center**
   - Width: **200**, Height: **60**
   - Pos X: **0**, Pos Y: **50**, Pos Z: **0**
4. Select button, in Image component:
   - Color: Dark gray or brown
5. Expand NavigationButton > Click "Text (TMP)"
6. TextMeshPro component:
   - Text: "**NEXT**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**

### Step 7: Add Tutorial Manager
1. Right-click in Hierarchy > Create Empty
2. Rename to "TutorialManager"
3. Add Component > **HowToPlayTutorial** script
4. Assign references:
   - Tutorial Panel → drag **TutorialPanel**
   - Background Blur → drag **TutorialPanel** (same object)
   - Title Text → drag **TitleText**
   - Content Text → drag **ContentText**
   - Navigation Button → drag **NavigationButton**
   - Button Text → drag **NavigationButton > Text (TMP)**

### Step 8: Setup Tutorial Pages
1. Select **TutorialManager**
2. In Inspector, find **HowToPlayTutorial** component
3. Set **Pages** size to **3**
4. Configure each page:

**Page 0 (Welcome):**
- Title: `HOW TO PLAY`
- Content:
```
Welcome, Nationalian!

Learn how to move, interact,
and complete chapters.
```
- Button Text: `NEXT`

**Page 1 (Controls):**
- Title: `CONTROLS`
- Content:
```
• LOOK - Move your mouse
• WALK - W, A, S, D keys
• INTERACT - Look at objects for 0.5 seconds
```
- Button Text: `NEXT`

**Page 2 (How to Play):**
- Title: `HOW TO PLAY`
- Content:
```
• Find 8 Artifacts (Books)
• Artifacts are scattered in the room
• Read each artifact to learn
• Complete all to unlock a quiz
```
- Button Text: `START JOURNEY`

### Step 9: Connect Button Click
1. Select **NavigationButton**
2. In Inspector, find **Button** component
3. Under **On Click ()**, click **+**
4. Drag **TutorialManager** into the object field
5. Click dropdown (says "No Function")
6. Select **HowToPlayTutorial** > **OnNextButtonClicked()**

### Step 10: Test
1. Click Play
2. Tutorial should appear automatically
3. Click NEXT to navigate through pages
4. On last page, click START JOURNEY to begin game

---

## Features

- **Auto-show**: Appears when Chapter 1 starts
- **Background blur**: Semi-transparent black overlay
- **Player freeze**: Movement disabled during tutorial
- **Time freeze**: Game pauses (Time.timeScale = 0)
- **Cursor unlock**: Mouse visible for clicking
- **Multi-page**: Navigate through 3 pages
- **Custom content**: Easy to edit in Inspector

---

## Customization

### Change Page Content:
1. Select TutorialManager
2. Edit Pages array in Inspector
3. Modify title, content, button text

### Change Colors:
- TutorialPanel: Adjust alpha for blur intensity
- ContentPanel: Change to match your theme
- Button: Customize color and style

### Add More Pages:
1. Increase Pages size in Inspector
2. Fill in new page data
3. Script handles navigation automatically

---

## Troubleshooting

**Tutorial doesn't appear:**
- Check TutorialPanel is active in Hierarchy
- Verify script references are assigned

**Can't click button:**
- Make sure EventSystem exists in scene
- Check button has OnClick event assigned

**Player can still move:**
- Verify PlayerMovement and MouseLook scripts exist
- Check script names match exactly

---

Created for NU Quest VR Project - Full HD (1920x1080)
