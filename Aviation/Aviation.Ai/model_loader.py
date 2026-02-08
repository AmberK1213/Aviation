from ultralytics import YOLO
from pathlib import Path
import json
import random

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

MODEL_PATH = "yolov8s.pt"   # good balance of accuracy + speed
IMAGE_DIR = Path("C:/Users/amber/Downloads/Aves Isle")
OUTPUT_DIR = Path("outputs/detections")
DEBUG_DIR = Path("outputs/debug")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
DEBUG_DIR.mkdir(parents=True, exist_ok=True)

# Fake geospatial anchor (for prototype)
BASE_LAT = 29.9032
BASE_LON = -91.9018

# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

model = YOLO(MODEL_PATH)

print("Loaded YOLO model")
print("Classes:", model.names)

# --------------------------------------------------
# INFERENCE LOOP
# --------------------------------------------------

for image_path in IMAGE_DIR.glob("*.jpg"):
    print(f"\nProcessing: {image_path.name}")

    results = model(
        image_path,
        conf=0.15,            # LOW threshold (important)
        iou=0.2,
        imgsz=1536,           # large for aerial detail
        max_det=1000,
        agnostic_nms=True
    )

    detections = []

    for r in results:
        if r.boxes is None:
            continue

        for box in r.boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = model.names[cls_id]

            bbox = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]

            if int(box.cls[0]) == 14:
                detections.append({
                    "class_id": 14,
                    "label": "bird",
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist()
                })

            print(f"  → {class_name} ({confidence:.3f})")

        # Save debug image with boxes
        debug_path = DEBUG_DIR / f"{image_path.stem}_debug.jpg"
        r.plot(save=True, filename=str(debug_path))

    # --------------------------------------------------
    # JSON OUTPUT
    # --------------------------------------------------

    output_json = {
        "image_id": image_path.stem,
        "detections": detections,
        "image_center": {
            "lat": BASE_LAT + random.uniform(-0.01, 0.01),
            "lon": BASE_LON + random.uniform(-0.01, 0.01)
        }
    }

    json_path = OUTPUT_DIR / f"{image_path.stem}.json"
    with open(json_path, "w") as f:
        json.dump(output_json, f, indent=2)

    print(f"Saved {len(detections)} detections → {json_path}")

print("\nInference complete.")