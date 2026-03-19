# NU Quest Complete UI System Guide

## Overview
Complete menu system with Loading Screen, Login Screen, Lobby with Chapter Selection, and Chapter 1 gameplay.

## System Flow
1. **Loading Screen** → Shows NU Quest logo + progress bar (3 seconds)
2. **Login Screen** → Username/Password input
3. **Lobby Screen** → 2x2 Chapter selection grid (only Chapter 1 unlocked)
4. **Chapter 1** → First-person gameplay with paper pickup system

---

## Scenes Structure

### Scene List (in Build Settings order):
1. LoadingScene
2. LoginScene
3. LobbyScene
4. Chapter1Scene

---

## Scripts Overview

### LoadingScreen.cs
- Displays logo and progress bar
- Simulates loading for 3 seconds
- Automatically transitions to LoginScene

### LoginScreen.cs
- Simple username/password validation
- Stores username in PlayerPrefs
- Transitions to LobbyScene on successful login

### LobbyScreen.cs
- Displays welcome message with username
- 4 chapter buttons in 2x2 grid
- Only Chapter 1 is unlocked and functional
- Chapters 2-4 are grayed out and locked

---

## Complete Setup Instructions

See detailed step-by-step instructions in the sections below.

---

Created for NU Quest VR Project
