# Frontend Updates for Grouped Detections

## Overview
The backend API has been updated to group detections by image ID. Each image now returns one `NestingSiteDto` with multiple detections grouped together, plus a debug image path.

## Changes Made

### 1. Backend API (`Aviation.Api/Program.cs`)
- Added static file serving configuration to serve debug images from `outputs/debug` folder
- Debug images are accessible at URL path `/images/debug/{imageId}_debug.jpg`
- Added `Microsoft.Extensions.FileProviders` namespace

### 2. TypeScript Types (`Interactive Geospatial AI Dashboard/src/types.ts`)
Updated `NestingSite` interface to match new API response:

```typescript
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionInfo {
  species: string;
  confidence: number;
  boundingBox: BoundingBox;
}

interface NestingSite {
  // ... existing fields ...
  debugImagePath?: string;        // NEW: Path to debug image
  detectionCount: number;          // NEW: Number of detections in this image
  detections: DetectionInfo[];     // NEW: Array of all detections for this image
}
```

### 3. Detection Gallery (`Interactive Geospatial AI Dashboard/src/components/DetectionGallery.tsx`)
Major refactoring to work with new API structure:

**Key Changes:**
- Now uses `sites` data directly instead of separate `detections` array
- Filters sites based on their properties and grouped detections
- Displays debug images using `debugImagePath` from API
- Shows all detections per image in the right panel
- Displays detection count, verification status, and individual detection details

**Image Path Format:**
- Uses `debugImagePath` from API: `https://localhost:7039/images/debug/{imageId}_debug.jpg`
- Graceful fallback when image is not available

## API Response Structure

The `/api/site` endpoint now returns:

```json
[
  {
    "id": "22May23Camera1-Card1-3529",
    "lat": 29.8947,
    "lng": -88.8767,
    "species": "Unidentified Bird",  // or "Multiple Species (X detections)"
    "abundance": 1,
    "detectionCount": 1,
    "detections": [
      {
        "species": "Unidentified Bird",
        "confidence": 0.85,
        "boundingBox": {
          "x": 100,
          "y": 200,
          "width": 50,
          "height": 75
        }
      }
    ],
    "priority": "high",
    "habitat": "Coastal Habitat",
    "lastSurveyed": "2026-02-10",
    "confidence": 0.85,
    "verificationStatus": "needs-review",
    "detectionType": "individual-nests",
    "imageId": "22May23Camera1-Card1-3529",
    "debugImagePath": "/images/debug/22May23Camera1-Card1-3529_debug.jpg"
  }
]
```

## Testing Steps

1. **Restart the Backend:**
   ```bash
   # In Aviation directory
   dotnet run --project Aviation
   ```

2. **Test API Endpoint:**
   - Navigate to `https://localhost:7039/swagger`
   - Test `/api/site` endpoint
   - Verify response includes `detectionCount`, `detections` array, and `debugImagePath`

3. **Test Debug Images:**
   - Place debug images in `outputs/debug` folder (relative to Aviation.Api project)
   - Images should be named: `{imageId}_debug.jpg`
   - Access via: `https://localhost:7039/images/debug/{imageId}_debug.jpg`

4. **Start Frontend:**
   ```bash
   # In Interactive Geospatial AI Dashboard directory
   npm run dev
   ```

5. **Verify Frontend:**
   - Frontend should display sites with multiple detections grouped together
   - Debug images should display in the Detection Gallery view
   - Each site card should show detection count
   - Individual detections should be listed in the right panel

## File Structure

```
outputs/
??? detections/
?   ??? 22May23Camera1-Card1-3529.json
?   ??? 22May23Camera1-Card1-3568.json
?   ??? ... (other detection JSON files)
??? debug/
    ??? 22May23Camera1-Card1-3529_debug.jpg
    ??? 22May23Camera1-Card1-3568_debug.jpg
    ??? ... (corresponding debug images)
```

## Next Steps

1. ? Backend updated to group detections by image
2. ? Static file serving configured for debug images
3. ? Frontend types updated to match API
4. ? DetectionGallery component updated to display grouped detections
5. ?? Test with actual debug images (place JPG files in `outputs/debug`)
6. ?? Update other components (MapView, AnalyticsDashboard) if needed
7. ?? Add bounding box visualization overlays on debug images

## Notes

- The API now returns ONE site per image (instead of one per detection)
- Multiple detections for the same image are grouped in the `detections` array
- The `species` field shows "Multiple Species (X detections)" when there are multiple detections
- The `detectionCount` field shows the total number of detections in the image
- Average confidence is calculated across all detections in the image
- Debug image paths are absolute URLs ready for use in `<img>` tags
