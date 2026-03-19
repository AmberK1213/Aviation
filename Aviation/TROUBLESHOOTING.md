# Troubleshooting Guide - Grouped Detections

## Issue 1: Seeing 119 detections instead of 16 images

**Root Cause:** The backend needs to be restarted for the new grouping code to take effect.

**Solution:**
1. **Stop the backend** (if it's running)
2. **Clean and rebuild:**
   ```bash
   cd Aviation.Api
   dotnet clean
   dotnet build
   ```
3. **Start from AppHost** (recommended):
   ```bash
   cd Aviation
   dotnet run
   ```
   OR start API directly:
   ```bash
   cd Aviation.Api
   dotnet run
   ```

4. **Verify grouping is working:**
   - Open browser: `https://localhost:7039/swagger`
   - Test `/api/site` endpoint
   - You should see ~16 results (one per image) instead of 119
   - Each result should have:
     - `detectionCount`: number of detections in that image
     - `detections`: array of detection objects
     - `debugImagePath`: `/images/debug/{imageId}_debug.jpg`

## Issue 2: Debug images not loading

**Root Cause:** Static file serving path may not be resolving correctly.

**Solution:**

### Step 1: Verify debug images exist
Check that you have JPG files in the correct location:
```
Aviation/
??? Aviation.Api/
??? outputs/
?   ??? detections/
?   ?   ??? *.json files
?   ??? debug/
?       ??? *_debug.jpg files  ? Images should be here
```

### Step 2: Check image naming
Debug images MUST be named exactly as the image_id in JSON files with `_debug.jpg` suffix:
- JSON file: `22May23Camera1-Card1-3529.json`
- Debug image: `22May23Camera1-Card1-3529_debug.jpg` ?

### Step 3: Check backend logs
After restarting the backend, look for these log messages:
```
Debug image path: C:\Users\amber\source\repos\Aviation\Aviation\outputs\debug
Directory exists: True
Static file serving enabled for /images/debug -> C:\Users\amber\...\outputs\debug
```

If you see `Directory exists: False`, the path is wrong.

### Step 4: Test image URL directly
Try accessing an image directly in browser:
```
https://localhost:7039/images/debug/22May23Camera1-Card1-3529_debug.jpg
```

If this works, the frontend should work too.

## Quick Verification Checklist

- [ ] Backend restarted (stop and start again)
- [ ] Swagger shows `/api/site` returning ~16 items (not 119)
- [ ] Each item has `detectionCount` > 0
- [ ] Each item has `detections` array with objects
- [ ] Debug images exist in `outputs/debug/` folder
- [ ] Images named as `{imageId}_debug.jpg`
- [ ] Backend logs show "Static file serving enabled"
- [ ] Can access image directly: `https://localhost:7039/images/debug/{imageId}_debug.jpg`
- [ ] Frontend refreshed after backend restart

## Expected API Response

After restart, `/api/site` should return this structure:

```json
[
  {
    "id": "22May23Camera1-Card1-3529",
    "lat": 29.8947,
    "lng": -88.8767,
    "species": "Multiple Species (12 detections)",  // ? Should say "Multiple Species" if >1
    "abundance": 12,
    "priority": "high",
    "habitat": "Coastal Habitat",
    "lastSurveyed": "2024-02-10",
    "confidence": 0.857,
    "verificationStatus": "needs-review",
    "detectionType": "nest-colony",  // ? Should be "nest-colony" if >1 detection
    "imageId": "22May23Camera1-Card1-3529",
    "debugImagePath": "/images/debug/22May23Camera1-Card1-3529_debug.jpg",
    "detectionCount": 12,  // ? Number of detections in this image
    "detections": [  // ? Array of all detections for this image
      {
        "species": "Unidentified Bird",
        "confidence": 0.85,
        "boundingBox": {
          "x": 1024,
          "y": 768,
          "width": 128,
          "height": 96
        }
      },
      // ... 11 more detections
    ]
  }
  // ... ~15 more images
]
```

## Common Issues

### Issue: Still seeing 119 items
- **Fix:** Backend not restarted properly. Use `dotnet clean` then restart.

### Issue: Debug images return 404
- **Fix:** Check file paths and names match exactly. Case-sensitive!

### Issue: Images exist but still 404
- **Fix:** Check backend logs for path resolution. May need absolute path in appsettings.json.

### Issue: Frontend shows old data
- **Fix:** Hard refresh browser (Ctrl+Shift+R) or clear browser cache.

## Testing Commands

```bash
# Clean and restart backend
cd Aviation.Api
dotnet clean
dotnet build
dotnet run

# In another terminal - test API
curl https://localhost:7039/api/site -k

# Count results (PowerShell)
(Invoke-WebRequest -Uri https://localhost:7039/api/site -SkipCertificateCheck | ConvertFrom-Json).Count

# Should return ~16, not 119
```

## Absolute Path Alternative (if relative path fails)

If the relative path `../outputs/debug` doesn't work, update `appsettings.json`:

```json
{
  "DetectionFolderPath": "C:\\Users\\amber\\source\\repos\\Aviation\\Aviation\\outputs\\detections",
  "DebugImageFolderPath": "C:\\Users\\amber\\source\\repos\\Aviation\\Aviation\\outputs\\debug"
}
```

Replace with your actual path!
