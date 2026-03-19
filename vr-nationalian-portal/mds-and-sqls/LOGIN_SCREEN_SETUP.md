# Login Screen Setup Guide

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

### Step 3: Create Login Panel
1. Right-click Canvas > UI > Panel
2. Rename to "LoginPanel"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **400**
   - Height: **400**
   - Pos X: **0**, Pos Y: **0**, Pos Z: **0**
4. In Image component, set Color with Alpha around **200**

### Step 4: Create Title Text
1. Right-click **LoginPanel** > UI > Legacy > Text
2. Rename to "TitleText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **300**, Height: **50**
   - Pos X: **0**, Pos Y: **150**, Pos Z: **0**
4. Text component:
   - Text: "**NU Quest Login**"
   - Font Size: **32**
   - Alignment: **Center**
   - Color: **White**

### Step 5: Create Username Input
1. Right-click **LoginPanel** > UI > Legacy > Input Field
2. Rename to "UsernameInput"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **300**, Height: **40**
   - Pos X: **0**, Pos Y: **50**, Pos Z: **0**
4. Expand UsernameInput > Click "Placeholder"
5. Change text to "**Username**"

### Step 6: Create Password Input
1. Right-click **LoginPanel** > UI > Legacy > Input Field
2. Rename to "PasswordInput"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **300**, Height: **40**
   - Pos X: **0**, Pos Y: **0**, Pos Z: **0**
4. In Input Field component, set Content Type to "**Password**"
5. Expand PasswordInput > Click "Placeholder"
6. Change text to "**Password**"

### Step 7: Create Login Button
1. Right-click **LoginPanel** > UI > Button
2. Rename to "LoginButton"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **200**, Height: **50**
   - Pos X: **0**, Pos Y: **-70**, Pos Z: **0**
4. Expand LoginButton > Click "Text"
5. Change text to "**Login**", Font Size: **24**

### Step 8: Create Error Text
1. Right-click **LoginPanel** > UI > Legacy > Text
2. Rename to "ErrorText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **center**
   - Width: **300**, Height: **30**
   - Pos X: **0**, Pos Y: **-130**, Pos Z: **0**
4. Text component:
   - Text: "" **(empty)**
   - Font Size: **18**
   - Color: **Red**
   - Alignment: **Center**

### Step 9: Add Script
1. Create Empty GameObject > Rename to "LoginManager"
2. Add Component > LoginScreen script
3. Assign references:
   - Username Input → **UsernameInput**
   - Password Input → **PasswordInput**
   - Login Button → **LoginButton**
   - Error Text → **ErrorText**

---

## Script Code

```csharp
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class LoginScreen : MonoBehaviour
{
    public InputField usernameInput;
    public InputField passwordInput;
    public Button loginButton;
    public Text errorText;
    
    void Start()
    {
        if (loginButton != null)
        {
            loginButton.onClick.AddListener(OnLoginClicked);
        }
        
        if (errorText != null)
        {
            errorText.text = "";
        }
    }
    
    void OnLoginClicked()
    {
        string username = usernameInput != null ? usernameInput.text : "";
        string password = passwordInput != null ? passwordInput.text : "";
        
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            if (errorText != null)
            {
                errorText.text = "Please enter username and password";
            }
            return;
        }
        
        PlayerPrefs.SetString("Username", username);
        SceneManager.LoadScene("LobbyScene");
    }
}
```
