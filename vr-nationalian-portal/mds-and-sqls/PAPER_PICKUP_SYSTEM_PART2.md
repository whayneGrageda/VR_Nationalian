# Paper Pickup System - Part 2

## Additional Scripts

### PaperWorldUI.cs
Automatically added to paper objects. Creates floating world-space UI with text and progress bar.

```csharp
using UnityEngine;
using UnityEngine.UI;

public class PaperWorldUI : MonoBehaviour
{
    private Canvas worldCanvas;
    private Text labelText;
    private Image spinnerImage;
    private GameObject uiPanel;
    private Transform canvasTransform;
    
    void Start()
    {
        CreateWorldUI();
    }
    
    void CreateWorldUI()
    {
        // Create canvas as independent object, not child of paper
        GameObject canvasObj = new GameObject("WorldCanvas_" + gameObject.name);
        canvasObj.transform.position = transform.position + Vector3.up * 0.5f;
        
        worldCanvas = canvasObj.AddComponent<Canvas>();
        worldCanvas.renderMode = RenderMode.WorldSpace;
        
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.dynamicPixelsPerUnit = 10;
        
        RectTransform canvasRect = canvasObj.GetComponent<RectTransform>();
        canvasRect.sizeDelta = new Vector2(400, 50);
        canvasRect.localScale = new Vector3(0.005f, 0.005f, 0.005f);
        
        canvasTransform = canvasObj.transform;
        
        // Create panel
        uiPanel = new GameObject("Panel");
        uiPanel.transform.SetParent(canvasObj.transform);
        RectTransform panelRect = uiPanel.AddComponent<RectTransform>();
        panelRect.anchorMin = new Vector2(0, 0);
        panelRect.anchorMax = new Vector2(1, 1);
        panelRect.sizeDelta = Vector2.zero;
        panelRect.localPosition = Vector3.zero;
        panelRect.localScale = Vector3.one;
        
        // Create text
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(uiPanel.transform);
        labelText = textObj.AddComponent<Text>();
        labelText.text = "Pick up";
        labelText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        labelText.fontSize = 24;
        labelText.color = Color.white;
        labelText.alignment = TextAnchor.MiddleLeft;
        
        RectTransform textRect = textObj.GetComponent<RectTransform>();
        textRect.anchorMin = new Vector2(0, 0);
        textRect.anchorMax = new Vector2(0.6f, 1);
        textRect.sizeDelta = Vector2.zero;
        textRect.localPosition = Vector3.zero;
        textRect.localScale = Vector3.one;
        
        Outline outline = textObj.AddComponent<Outline>();
        outline.effectColor = Color.black;
        outline.effectDistance = new Vector2(2, 2);
        
        // Create spinner (progress bar)
        GameObject spinnerObj = new GameObject("Spinner");
        spinnerObj.transform.SetParent(uiPanel.transform);
        spinnerImage = spinnerObj.AddComponent<Image>();
        spinnerImage.color = Color.white;
        spinnerImage.type = Image.Type.Filled;
        spinnerImage.fillMethod = Image.FillMethod.Radial360;
        spinnerImage.fillOrigin = (int)Image.Origin360.Top;
        spinnerImage.fillClockwise = true;
        spinnerImage.fillAmount = 0;
        
        Texture2D circleTexture = CreateCircleTexture(64);
        spinnerImage.sprite = Sprite.Create(circleTexture, new Rect(0, 0, 64, 64), new Vector2(0.5f, 0.5f));
        
        RectTransform spinnerRect = spinnerObj.GetComponent<RectTransform>();
        spinnerRect.anchorMin = new Vector2(0.65f, 0.5f);
        spinnerRect.anchorMax = new Vector2(0.65f, 0.5f);
        spinnerRect.sizeDelta = new Vector2(35, 35);
        spinnerRect.localPosition = Vector3.zero;
        spinnerRect.localScale = Vector3.one;
        
        uiPanel.SetActive(false);
    }
    
    Texture2D CreateCircleTexture(int size)
    {
        Texture2D texture = new Texture2D(size, size);
        Color[] pixels = new Color[size * size];
        
        float center = size / 2f;
        float radius = size / 2f - 2;
        
        for (int y = 0; y < size; y++)
        {
            for (int x = 0; x < size; x++)
            {
                float distance = Vector2.Distance(new Vector2(x, y), new Vector2(center, center));
                
                if (distance < radius && distance > radius - 6)
                {
                    pixels[y * size + x] = Color.white;
                }
                else
                {
                    pixels[y * size + x] = Color.clear;
                }
            }
        }
        
        texture.SetPixels(pixels);
        texture.Apply();
        return texture;
    }
    
    public void ShowUI(bool show)
    {
        if (uiPanel != null)
        {
            uiPanel.SetActive(show);
        }
    }
    
    public void UpdateSpinner(float progress)
    {
        if (spinnerImage != null)
        {
            spinnerImage.fillAmount = progress;
        }
    }
    
    void Update()
    {
        if (canvasTransform != null && worldCanvas != null)
        {
            canvasTransform.position = transform.position + Vector3.up * 0.5f;
            
            if (Camera.main != null)
            {
                canvasTransform.LookAt(Camera.main.transform);
                canvasTransform.Rotate(0, 180, 0);
            }
        }
    }
    
    void OnDestroy()
    {
        if (canvasTransform != null)
        {
            Destroy(canvasTransform.gameObject);
        }
    }
}
```

### PaperUI.cs
Attach to Canvas. Manages the full-screen paper reading interface.

```csharp
using UnityEngine;
using UnityEngine.UI;

public class PaperUI : MonoBehaviour
{
    public GameObject paperPanel;
    public Text paperText;
    
    void Start()
    {
        if (paperPanel != null)
        {
            paperPanel.SetActive(false);
        }
    }
    
    public void ShowPaper(string text)
    {
        if (paperPanel != null && paperText != null)
        {
            paperText.text = text;
            paperPanel.SetActive(true);
        }
    }
    
    public void HidePaper()
    {
        if (paperPanel != null)
        {
            paperPanel.SetActive(false);
        }
    }
}
```

---

## Setup Instructions

### 1. Create Paper UI Canvas
1. GameObject > UI > Canvas
2. Canvas Render Mode: Screen Space - Overlay
3. Create PaperPanel (UI > Panel)
   - Set transparency (Alpha ~200)
   - RectTransform margins: Left/Right/Top/Bottom: 100
4. Create PaperText (UI > Legacy > Text) as child of PaperPanel
   - Font size: 24-36
   - Color: Black or dark
   - Alignment: Center or Left
5. Add PaperUI script to Canvas
6. Assign PaperPanel and PaperText references

### 2. Create Paper Object
1. GameObject > 3D Object > Cube
2. Scale: X: 0.3, Y: 0.01, Z: 0.4 (flat like paper)
3. Position: Y: 0.5 (on ground)
4. Add PickupPaper script
5. Add PaperWorldUI script
6. Edit paperText field with your message
7. Optional: Add material/color

### 3. Setup Camera
1. Select Main Camera
2. Add PlayerInteraction script
3. Set Interaction Distance: 5

---

## Customization

### Timing
- Change `lookDuration` in PlayerInteraction (default: 0.5 seconds)

### Visual Feedback
- Crosshair color changes in PlayerInteraction
- Outline size/position in PickupPaper.CreateOutline()
- World UI position/size in PaperWorldUI.CreateWorldUI()

### Paper Content
- Edit `paperText` field in PickupPaper component
- Supports multi-line text with \n

### UI Styling
- PaperPanel: Adjust transparency, margins, background color
- PaperText: Change font size, color, alignment
- World UI: Modify canvas size, text/spinner positioning

---

## Controls
- Look at paper to see "Pick up" prompt
- Keep looking for 0.5 seconds to pick up
- Press E or ESC to close paper UI
- Paper is destroyed after pickup

---

## Troubleshooting

**World UI not showing:**
- Check PaperWorldUI script is attached to paper
- Verify font is set to "LegacyRuntime.ttf"
- Check canvas position (should be 0.5 units above paper)

**Progress bar not filling:**
- Ensure Image type is set to Filled
- fillMethod should be Radial360
- UpdateSpinner uses fillAmount (not rotation)

**Paper UI not appearing:**
- Check PaperUI script references are assigned
- Verify PaperPanel and PaperText exist in Canvas
- Check Console for errors

**Crosshair not turning red:**
- Ensure Crosshair script is on Main Camera
- PlayerInteraction needs reference to Crosshair component

---

Created with Unity URP Template
