from ultralytics import YOLO
from pathlib import Path
import json
import random


BASE_LAT = 29.9032  
BASE_LON = -91.9018  

# Load pretrained model
model = YOLO("yolov8n.pt")  # nano = fast, perfect for prototype

image_dir = Path("C:/Users/amber/Downloads/Aves Isle")
output_dir = Path("outputs/detections")
output_dir.mkdir(parents=True, exist_ok=True)

for image_path in image_dir.glob("*.jpg"):
    results = model(image_path)

    detections = []

    for r in results:
        for box in r.boxes:
            detections.append({
                "class_id": int(box.cls[0]),
                "confidence": float(box.conf[0]),
                "bbox": box.xyxy[0].tolist()
            })

    output = {
        "image_id": image_path.stem,
        "detections": detections,
        "image_center": {
            "lat": BASE_LAT + random.uniform(-0.01, 0.01),
            "lon": BASE_LON + random.uniform(-0.01, 0.01)
        },
    }

    with open(output_dir / f"{image_path.stem}.json", "w") as f:
        json.dump(output, f, indent=2)

print("Inference complete")