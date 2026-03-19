# Unity First-Person Player with Interactive Paper Pickup Tutorial

## What We Built
A first-person player controller with:
- Mouse look and WASD movement
- Jumping mechanics
- Crosshair
- Interactive paper pickup system with visual feedback
- World-space UI with progress indicator
- Paper reading interface

---

## Step-by-Step Setup Guide

### 1. Create the Player
1. **GameObject** > **3D Object** > **Capsule**
2. Rename it to "Player" in the Hierarchy
3. Set Transform Position: X: 0, Y: 5, Z: 0

### 2. Add Physics to Player
1. Select Player in Hierarchy
2. **Add Component** > **Rigidbody**
3. In Rigidbody, expand **Constraints**
4. Check all three **Freeze Rotation** boxes (X, Y, Z) - this prevents ragdoll effect

### 3. Create the Ground Platform
1. **GameObject** > **3D Object** > **Plane**
2. Set Transform:
   - Position: X: 0, Y: 0, Z: 0
   - Scale: X: 5, Y: 1, Z: 5 (makes it 50x50 units)

### 4. Setup First-Person Camera
1. Find **Main Camera** in Hierarchy
2. Drag it onto **Player** to make it a child
3. Set Camera Transform:
   - Position: X: 0, Y: 0.5, Z: 0 (eye level inside capsule)
   - Rotation: X: 0, Y: 0, Z: 0

### 5. Create Movement Script
1. In Project panel, right-click > **Create** > **C# Script**
2. Name it "PlayerMovement"
3. Double-click to open and paste the code below

### 6. Create Mouse Look Script
1. In Project panel, right-click > **Create** > **C# Script**
2. Name it "MouseLook"
3. Double-click to open and paste the code below

### 7. Create Crosshair Script
1. In Project panel, right-click > **Create** > **C# Script**
2. Name it "Crosshair"
3. Double-click to open and paste the code below

### 8. Create Paper Pickup System Scripts
1. Create "PickupPaper" script
2. Create "PlayerInteraction" script
3. Create "PaperWorldUI" script
4. Create "PaperUI" script
5. Paste the respective code below

### 9. Setup Paper UI Canvas
1. GameObject > UI > Canvas (creates Canvas and EventSystem)
2. Select Canvas, set Render Mode to "Screen Space - Overlay"
3. Right-click Canvas > UI > Panel (rename to "PaperPanel")
4. Set PaperPanel color with transparency (Alpha ~200)
5. Adjust RectTransform: Left: 100, Right: 100, Top: 100, Bottom: 100
6. Right-click PaperPanel > UI > Legacy > Text (rename to "PaperText")
7. Set PaperText font size to 24-36, color to black/dark
8. Select Canvas, add PaperUI script
9. Drag PaperPanel and PaperText into the script fields

### 10. Create Pickupable Paper Object
1. GameObject > 3D Object > Cube
2. Rename to "Paper"
3. Scale it flat: X: 0.3, Y: 0.01, Z: 0.4
4. Position on ground: Y: 0.5
5. Add PickupPaper script
6. Add PaperWorldUI script
7. Edit "Paper Text" field with your message

### 11. Attach Scripts
1. Select **Player** in Hierarchy
2. Drag **PlayerMovement** script onto Player
3. Select **Main Camera** in Hierarchy
4. Drag **MouseLook** script onto Main Camera
5. Drag **Crosshair** script onto Main Camera
6. Drag **PlayerInteraction** script onto Main Camera
7. In MouseLook component, drag **Player** into **Player Body** field

### 12. Add Direction Markers (Optional)
Create cubes at different positions to help identify directions:
- **North**: GameObject > 3D Object > Cube, Position: X: 0, Y: 1, Z: 20
- **South**: Cube at X: 0, Y: 1, Z: -20
- **East**: Cube at X: 20, Y: 1, Z: 0
- **West**: Cube at X: -20, Y: 1, Z: 0

Optional: Create materials with different colors and apply to each cube.

### 13. Play!
- Click the **Play** button
- **WASD** to move
- **Mouse** to look around
- **Spacebar** to jump
- **Look at paper** for 0.5 seconds to pick it up
- **E or ESC** to close paper UI
- **ESC** to unlock cursor

---

## Key Features

### Player Movement
- Instant stop movement (pressing opposite keys cancels movement)
- Direction-based movement (move where you're looking)
- Frozen rotation prevents ragdoll effect

### Paper Pickup System
- Crosshair turns red instantly when looking at paper
- Black outline appears around paper
- "Pick up" text with circular progress bar appears above paper
- Progress bar fills over 0.5 seconds
- Paper UI displays content with semi-transparent background

---

## Scripts

### PlayerMovement.cs
```csharp
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float moveSpeed = 15f;
    public float jumpForce = 5f;
    
    private Rigidbody rb;
    private bool isGrounded;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // Get input using raw axis for instant stop (like Valorant)
        float horizontal = Input.GetAxisRaw("Horizontal"); // A/D or Left/Right arrows
        float vertical = Input.GetAxisRaw("Vertical");     // W/S or Up/Down arrows
        
        // Move the player relative to where they're looking
        Vector3 movement = transform.right * horizontal + transform.forward * vertical;
        transform.position += movement * moveSpeed * Time.deltaTime;
        
        // Jump
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }

    void OnCollisionStay(Collision collision)
    {
        isGrounded = true;
    }

    void OnCollisionExit(Collision collision)
    {
        isGrounded = false;
    }
}
```

### MouseLook.cs
```csharp
using UnityEngine;

public class MouseLook : MonoBehaviour
{
    public float mouseSensitivity = 300f;
    public Transform playerBody;

    private float xRotation = 0f;

    void Start()
    {
        // Lock cursor to center of screen
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        // Get mouse input
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        // Rotate camera up/down
        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f); // Limit looking up/down

        transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);

        // Rotate player left/right
        playerBody.Rotate(Vector3.up * mouseX);
    }
}
```

### Crosshair.cs
```csharp
using UnityEngine;

public class Crosshair : MonoBehaviour
{
    public Color crosshairColor = Color.white;
    public int crosshairSize = 20;
    public int crosshairThickness = 2;

    void OnGUI()
    {
        // Get center of screen
        float centerX = Screen.width / 2;
        float centerY = Screen.height / 2;

        // Create texture for crosshair
        Texture2D texture = new Texture2D(1, 1);
        texture.SetPixel(0, 0, crosshairColor);
        texture.Apply();

        // Draw horizontal line
        GUI.DrawTexture(new Rect(centerX - crosshairSize / 2, centerY - crosshairThickness / 2, crosshairSize, crosshairThickness), texture);
        
        // Draw vertical line
        GUI.DrawTexture(new Rect(centerX - crosshairThickness / 2, centerY - crosshairSize / 2, crosshairThickness, crosshairSize), texture);
    }
}
```
```csharp
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float moveSpeed = 15f;
    public float jumpForce = 5f;
    
    private Rigidbody rb;
    private bool isGrounded;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // Get input using raw axis for instant stop (like Valorant)
        float horizontal = Input.GetAxisRaw("Horizontal"); // A/D or Left/Right arrows
        float vertical = Input.GetAxisRaw("Vertical");     // W/S or Up/Down arrows
        
        // Move the player relative to where they're looking
        Vector3 movement = transform.right * horizontal + transform.forward * vertical;
        transform.position += movement * moveSpeed * Time.deltaTime;
        
        // Jump
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }

    void OnCollisionStay(Collision collision)
    {
        isGrounded = true;
    }

    void OnCollisionExit(Collision collision)
    {
        isGrounded = false;
    }
}
```

### MouseLook.cs
```csharp
using UnityEngine;

public class MouseLook : MonoBehaviour
{
    public float mouseSensitivity = 300f;
    public Transform playerBody;

    private float xRotation = 0f;

    void Start()
    {
        // Lock cursor to center of screen
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        // Get mouse input
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        // Rotate camera up/down
        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f); // Limit looking up/down

        transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);

        // Rotate player left/right
        playerBody.Rotate(Vector3.up * mouseX);
    }
}
```

### Crosshair.cs
```csharp
using UnityEngine;

public class Crosshair : MonoBehaviour
{
    public Color crosshairColor = Color.white;
    public int crosshairSize = 20;
    public int crosshairThickness = 2;

    void OnGUI()
    {
        // Get center of screen
        float centerX = Screen.width / 2;
        float centerY = Screen.height / 2;

        // Create texture for crosshair
        Texture2D texture = new Texture2D(1, 1);
        texture.SetPixel(0, 0, crosshairColor);
        texture.Apply();

        // Draw horizontal line
        GUI.DrawTexture(new Rect(centerX - crosshairSize / 2, centerY - crosshairThickness / 2, crosshairSize, crosshairThickness), texture);
        
        // Draw vertical line
        GUI.DrawTexture(new Rect(centerX - crosshairThickness / 2, centerY - crosshairSize / 2, crosshairThickness, crosshairSize), texture);
    }
}
```

---

## Customization Options

### Adjust in Inspector:
- **PlayerMovement**: moveSpeed, jumpForce
- **MouseLook**: mouseSensitivity (higher = faster turning)
- **Crosshair**: crosshairColor, crosshairSize, crosshairThickness

### Key Features:
- **Instant Stop Movement**: Using GetAxisRaw means pressing opposite keys (A+D or W+S) cancels movement instantly
- **Frozen Rotation**: Rigidbody constraints prevent the player from tipping over
- **Locked Cursor**: Mouse is locked to center during gameplay
- **Direction-Based Movement**: You move in the direction you're looking

---

## Troubleshooting

**Player falls through ground:**
- Make sure the Plane has a Collider component
- Make sure Player starts above the ground (Y position > 0)

**Player tips over:**
- Check that all Freeze Rotation constraints are enabled on the Rigidbody

**Can't look around:**
- Make sure Player Body field in MouseLook is assigned to the Player object

**Movement feels wrong:**
- Adjust moveSpeed in PlayerMovement component
- Adjust mouseSensitivity in MouseLook component

---

## Controls
- **W/A/S/D** or **Arrow Keys**: Move
- **Mouse**: Look around
- **Spacebar**: Jump
- **ESC**: Unlock cursor (to click outside game window)

---

Created with Unity URP Template
