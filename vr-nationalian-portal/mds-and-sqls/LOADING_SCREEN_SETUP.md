# Loading Screen Setup Guide

## Complete Step-by-Step Instructions

### Step 1: Create Canvas
1. Right-click in Hierarchy > UI > Canvas

### Step 2: Create Background
1. Right-click Canvas > UI > Image
2. Rename to "Background"
3. Rect Transform:
   - Anchor preset: Hold **Shift + Alt** + click **bottom-right** (stretch both)
   - Left: **0**, Right: **0**, Top: **0**, Bottom: **0**
4. In Image component, set Color to **dark blue or black**

### Step 3: Create Logo
1. Right-click Canvas > UI > Image
2. Rename to "Logo"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **400**
   - Height: **200**
   - Pos X: **0**
   - Pos Y: **100**
   - Pos Z: **0**
4. Add your NU Quest logo:
   - Import logo image to Assets
   - Set Texture Type to "Sprite (2D and UI)"
   - Drag sprite to Source Image field

### Step 4: Create Progress Bar
1. Right-click Canvas > UI > Slider
2. Rename to "ProgressBar"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **600**
   - Height: **30**
   - Pos X: **0**
   - Pos Y: **-150**
   - Pos Z: **0**
4. In Slider component:
   - Min Value: **0**
   - Max Value: **1**
5. Delete "Handle Slide Area" child object
6. Expand Fill Area > Select Fill
7. Change Fill color to **green or blue**

### Step 5: Create Loading Text
1. Right-click Canvas > UI > Legacy > Text
2. Rename to "LoadingText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **300**
   - Height: **40**
   - Pos X: **0**
   - Pos Y: **-200**
   - Pos Z: **0**
4. Text component:
   - Text: "**Loading... 0%**"
   - Font Size: **24**
   - Alignment: **Center**
   - Color: **White**

### Step 6: Add Script
1. Right-click in Hierarchy > Create Empty
2. Rename to "LoadingManager"
3. Add Component > LoadingScreen script
4. Assign references:
   - Logo Image → drag **Logo**
   - Progress Bar → drag **ProgressBar**
   - Loading Text → drag **LoadingText**

---

## Script Code

```csharp
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections;

public class LoadingScreen : MonoBehaviour
{
    public Image logoImage;
    public Slider progressBar;
    public Text loadingText;
    public float minimumLoadTime = 3f;
    
    void Start()
    {
        StartCoroutine(LoadNextScene());
    }
    
    IEnumerator LoadNextScene()
    {
        float elapsedTime = 0f;
        
        while (elapsedTime < minimumLoadTime)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / minimumLoadTime;
            
            if (progressBar != null)
            {
                progressBar.value = progress;
            }
            
            if (loadingText != null)
            {
                loadingText.text = "Loading... " + Mathf.RoundToInt(progress * 100) + "%";
            }
            
            yield return null;
        }
        
        SceneManager.LoadScene("LoginScene");
    }
}
```

---

## Customization
- Change `minimumLoadTime` to adjust loading duration
- Replace logo image with your own
- Customize colors and sizes
