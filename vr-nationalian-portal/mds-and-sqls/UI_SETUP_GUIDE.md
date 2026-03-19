# NU Quest UI Setup Guide

## Overview
Create a complete menu system with:
- Loading screen with NU Quest logo
- Login screen
- Lobby with chapter selection (2x2 grid)
- Scene transitions

---

## Step 1: Create Scenes

1. **Save your current scene as "Chapter1"**
   - File > Save As > "Chapter1"
   - Save in Assets/Scenes/

2. **Create LoadingScreen scene**
   - File > New Scene
   - Save as "LoadingScreen" in Assets/Scenes/

3. **Create LoginScreen scene**
   - File > New Scene
   - Save as "LoginScreen" in Assets/Scenes/

4. **Create LobbyScreen scene**
   - File > New Scene
   - Save as "LobbyScreen" in Assets/Scenes/

---

## Step 2: Build Settings

1. File > Build Settings
2. Click "Add Open Scenes" for each scene in this order:
   - LoadingScreen
   - LoginScreen
   - LobbyScreen
   - Chapter1

---

## Step 3: Loading Screen Setup

### Create UI Elements:
1. GameObject > UI > Canvas
2. Create Background:
   - Right-click Canvas > UI > Image (rename "Background")
   - Set color to dark blue/black
   - Stretch to full screen (anchor presets: stretch both)

3. Create Logo:
   - Right-click Canvas > UI > Image (rename "Logo")
   - Position at center-top
   - Size: 400x200
   - Add your NU Quest logo image here

4. Create Progress Bar:
   - Right-click Canvas > UI > Slider (rename "ProgressBar")
   - Position at bottom center
   - Width: 600, Height: 30
   - Remove Handle (delete Handle Slide Area)
   - Set Fill color to green/blue

5. Create Loading Text:
   - Right-click Canvas > UI > Text (rename "LoadingText")
   - Position below progress bar
   - Text: "Loading... 0%"
   - Font size: 24, Center alignment

### Attach Script:
1. Create empty GameObject (rename "LoadingManager")
2. Add LoadingScreen script
3. Assign references:
   - Logo Image → Logo
   - Progress Bar → ProgressBar
   - Loading Text → LoadingText

---

## Step 4: Login Screen Setup

### Create UI Elements:
1. GameObject > UI > Canvas

2. Create Background:
   - UI > Image (full screen, dark color)

3. Create Login Panel:
   - UI > Panel (rename "LoginPanel")
   - Size: 400x300, center position
   - Background color: semi-transparent

4. Create Title:
   - UI > Text (child of LoginPanel)
   - Text: "NU Quest Login"
   - Font size: 32, Center alignment
   - Position at top of panel

5. Create Username Field:
   - UI > Input Field (rename "UsernameInput")
   - Placeholder: "Username"
   - Position: center-top of panel

6. Create Password Field:
   - UI > Input Field (rename "PasswordInput")
   - Placeholder: "Password"
   - Content Type: Password
   - Position: below username

7. Create Login Button:
   - UI > Button (rename "LoginButton")
   - Text: "Login"
   - Size: 200x50
   - Position: bottom of panel

8. Create Error Text:
   - UI > Text (rename "ErrorText")
   - Color: Red
   - Font size: 18
   - Position: below button
   - Text: "" (empty)

### Attach Script:
1. Create empty GameObject (rename "LoginManager")
2. Add LoginScreen script
3. Assign references:
   - Username Input → UsernameInput
   - Password Input → PasswordInput
   - Login Button → LoginButton
   - Error Text → ErrorText

---

## Step 5: Lobby Screen Setup

### Create UI Elements:
1. GameObject > UI > Canvas

2. Create Background:
   - UI > Image (full screen)

3. Create Welcome Text:
   - UI > Text (rename "WelcomeText")
   - Position: top center
   - Text: "Welcome, Player!"
   - Font size: 36

4. Create Chapter Selection Panel:
   - UI > Panel (rename "ChapterPanel")
   - Size: 600x600, center position

5. Create Chapter Buttons (2x2 Grid):

   **Chapter 1 Button (Top-Left):**
   - UI > Button (rename "Chapter1Button")
   - Position: X: -150, Y: 150
   - Size: 250x250
   - Text: "Chapter 1"
   - Font size: 24

   **Chapter 2 Button (Top-Right):**
   - UI > Button (rename "Chapter2Button")
   - Position: X: 150, Y: 150
   - Size: 250x250
   - Text: "Chapter 2\n(Locked)"
   - Font size: 24
   - Color: Gray (to show locked)

   **Chapter 3 Button (Bottom-Left):**
   - UI > Button (rename "Chapter3Button")
   - Position: X: -150, Y: -150
   - Size: 250x250
   - Text: "Chapter 3\n(Locked)"
   - Font size: 24
   - Color: Gray

   **Chapter 4 Button (Bottom-Right):**
   - UI > Button (rename "Chapter4Button")
   - Position: X: 150, Y: -150
   - Size: 250x250
   - Text: "Chapter 4\n(Locked)"
   - Font size: 24
   - Color: Gray

### Attach Script:
1. Create empty GameObject (rename "LobbyManager")
2. Add LobbyScreen script
3. Assign references:
   - Chapter1 Button → Chapter1Button
   - Chapter2 Button → Chapter2Button
   - Chapter3 Button → Chapter3Button
   - Chapter4 Button → Chapter4Button
   - Welcome Text → WelcomeText

---

## Step 6: Set Starting Scene

1. File > Build Settings
2. Make sure "LoadingScreen" is at index 0 (top of list)
3. Close Build Settings

---

## Step 7: Test Flow

1. Open LoadingScreen scene
2. Click Play
3. Should see:
   - Loading screen with progress bar (3 seconds)
   - Login screen
   - Enter any username/password and click Login
   - Lobby screen with 4 chapter buttons
   - Click Chapter 1 to start the game

---

## Scripts Reference

### LoadingScreen.cs
- Handles loading animation
- Transitions to LoginScreen after 3 seconds

### LoginScreen.cs
- Simple login validation
- Stores username in PlayerPrefs
- Transitions to LobbyScreen

### LobbyScreen.cs
- Displays welcome message with username
- 4 chapter buttons (only Chapter 1 unlocked)
- Loads Chapter1 scene when clicked

---

## Customization

### Loading Screen:
- Change `minimumLoadTime` in LoadingScreen script (default: 3 seconds)
- Add your NU Quest logo image to Logo Image component
- Customize colors and sizes

### Login Screen:
- Add actual authentication logic in LoginScreen.OnLoginClicked()
- Add "Remember Me" checkbox
- Add "Forgot Password" button

### Lobby Screen:
- Unlock chapters by setting `button.interactable = true`
- Add chapter descriptions
- Add progress indicators
- Add logout button

---

## Adding NU Quest Logo

1. Import your logo image:
   - Drag image file into Assets folder
   - Select image in Project panel
   - In Inspector, set Texture Type to "Sprite (2D and UI)"
   - Click Apply

2. Assign to Logo:
   - Select Logo Image in LoadingScreen
   - Drag your logo sprite to Source Image field

---

## Troubleshooting

**Scenes not loading:**
- Check all scenes are added to Build Settings
- Verify scene names match exactly (case-sensitive)

**Buttons not working:**
- Check script references are assigned
- Verify Button components have onClick events

**Login always fails:**
- Check InputField references are assigned
- Check ErrorText is assigned

---

## Next Steps

- Add chapter unlock system
- Add save/load functionality
- Add settings menu
- Add sound effects
- Add animations/transitions

---

Created for NU Quest VR Project
