# Paper Pickup System Documentation

## Overview
An interactive paper pickup system with visual feedback including crosshair color change, object outlining, world-space UI with progress indicator, and a reading interface.

## Features
- Raycast-based interaction detection
- Instant visual feedback (red crosshair + black outline)
- World-space UI with "Pick up" text and circular progress bar
- 0.5 second pickup timer
- Full-screen paper reading UI with semi-transparent background
- Automatic cursor management

---

## Scripts

### PickupPaper.cs
Attach to each paper object you want to be pickupable.

```csharp
using UnityEngine;

public class PickupPaper : MonoBehaviour
{
    [TextArea(3, 10)]
    public string paperText = "This is a note you found on the ground.\n\nYou can write anything here!";
    
    public bool isBeingLookedAt = false;
    
    private Renderer paperRenderer;
    private Color originalColor;
    private GameObject outlineCube;
    private PaperWorldUI worldUI;
    
    void Start()
    {
        paperRenderer = GetComponent<Renderer>();
        if (paperRenderer != null)
        {
            originalColor = paperRenderer.material.color;
        }
        
        // Create outline cube
        CreateOutline();
        
        // Add world UI
        worldUI = gameObject.AddComponent<PaperWorldUI>();
    }
    
    void CreateOutline()
    {
        outlineCube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        outlineCube.name = "Outline";
        outlineCube.transform.SetParent(transform);
        
        // Position it behind the paper (adjust based on paper orientation)
        outlineCube.transform.localPosition = new Vector3(0, -0.015f, 0);
        
        // Make it slightly bigger in X and Z, but thinner in Y to show as border
        outlineCube.transform.localScale = new Vector3(1.15f, 0.8f, 1.15f);
        
        // Set it to black
        Renderer outlineRenderer = outlineCube.GetComponent<Renderer>();
        outlineRenderer.material.color = Color.black;
        
        // Remove collider so it doesn't interfere
        Destroy(outlineCube.GetComponent<Collider>());
        
        // Hide it initially
        outlineCube.SetActive(false);
    }
    
    public void SetOutline(bool enabled)
    {
        if (outlineCube != null)
        {
            outlineCube.SetActive(enabled);
        }
        if (worldUI != null)
        {
            worldUI.ShowUI(enabled);
        }
    }
    
    public void UpdateProgress(float progress)
    {
        if (worldUI != null)
        {
            worldUI.UpdateSpinner(progress);
        }
    }
    
    public void ResetColor()
    {
        if (paperRenderer != null)
        {
            paperRenderer.material.color = originalColor;
        }
        if (outlineCube != null)
        {
            outlineCube.SetActive(false);
        }
    }
    
    void OnDestroy()
    {
        if (outlineCube != null)
        {
            Destroy(outlineCube);
        }
    }
}
```

### PlayerInteraction.cs
Attach to Main Camera to handle looking at and picking up papers.

```csharp
using UnityEngine;

public class PlayerInteraction : MonoBehaviour
{
    public float interactionDistance = 5f;
    public float lookDuration = 0.5f;
    public LayerMask interactableLayer;
    
    private float currentLookTime = 0f;
    private PickupPaper currentPaper = null;
    private bool isPaperUIOpen = false;
    
    // Reference to crosshair and UI
    private Crosshair crosshair;
    private PaperUI paperUI;
    
    void Start()
    {
        crosshair = GetComponent<Crosshair>();
        paperUI = FindObjectOfType<PaperUI>();
    }
    
    void Update()
    {
        if (isPaperUIOpen)
        {
            // Close paper with ESC or E
            if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.E))
            {
                ClosePaper();
            }
            return;
        }
        
        // Raycast from camera center
        Ray ray = new Ray(transform.position, transform.forward);
        RaycastHit hit;
        
        if (Physics.Raycast(ray, out hit, interactionDistance))
        {
            PickupPaper paper = hit.collider.GetComponent<PickupPaper>();
            
            if (paper != null)
            {
                // Looking at paper
                if (currentPaper != paper)
                {
                    // New paper, reset timer
                    if (currentPaper != null)
                    {
                        currentPaper.ResetColor();
                        currentPaper.SetOutline(false);
                    }
                    currentPaper = paper;
                    currentLookTime = 0f;
                }
                
                // Increase look time
                currentLookTime += Time.deltaTime;
                
                // Turn crosshair red instantly when looking at paper
                if (crosshair != null)
                {
                    crosshair.crosshairColor = Color.red;
                }
                
                // Show black outline instantly
                paper.SetOutline(true);
                
                // Calculate progress for pickup
                float progress = Mathf.Clamp01(currentLookTime / lookDuration);
                
                // Update spinner
                paper.UpdateProgress(progress);
                
                // Pick up paper when timer complete
                if (currentLookTime >= lookDuration)
                {
                    PickupThePaper(paper);
                }
            }
            else
            {
                ResetLookState();
            }
        }
        else
        {
            ResetLookState();
        }
    }
    
    void ResetLookState()
    {
        if (currentPaper != null)
        {
            currentPaper.ResetColor();
            currentPaper.SetOutline(false);
            currentPaper = null;
        }
        currentLookTime = 0f;
        if (crosshair != null)
        {
            crosshair.crosshairColor = Color.white;
        }
    }
    
    void PickupThePaper(PickupPaper paper)
    {
        // Show paper UI
        if (paperUI != null)
        {
            paperUI.ShowPaper(paper.paperText);
            isPaperUIOpen = true;
            
            // Unlock cursor to interact with UI
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
            
            // Disable mouse look
            MouseLook mouseLook = GetComponent<MouseLook>();
            if (mouseLook != null)
            {
                mouseLook.enabled = false;
            }
        }
        
        // Destroy the paper object
        Destroy(paper.gameObject);
        
        ResetLookState();
    }
    
    void ClosePaper()
    {
        if (paperUI != null)
        {
            paperUI.HidePaper();
        }
        
        isPaperUIOpen = false;
        
        // Lock cursor again
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        
        // Enable mouse look
        MouseLook mouseLook = GetComponent<MouseLook>();
        if (mouseLook != null)
        {
            mouseLook.enabled = true;
        }
    }
}
```
