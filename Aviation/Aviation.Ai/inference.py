from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = Path(__file__).parent / "birdModelVersion4.pt"
OUTPUT_DIR = Path(__file__).parent / "temp_upload"

_model = None

def _get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(str(MODEL_PATH))
    return _model


def run_yolo(image_path: Path) -> tuple[list[dict], Path | None]:
    """
    Run YOLO inference on a single image.
    Returns (detections, annotated_image_path).
    """
    model = _get_model()

    results = model(
        str(image_path),
        conf=0.15,
        iou=0.2,
        imgsz=1536,
        max_det=1000,
        agnostic_nms=True,
        save=True,
        project=str(OUTPUT_DIR / "runs"),
        name="predict",
        exist_ok=True,
    )

    detections = []
    annotated_path = None

    for r in results:
        # Find the saved annotated image
        if r.path:
            candidate = OUTPUT_DIR / "runs" / "predict" / Path(r.path).name
            if candidate.exists():
                annotated_path = candidate

        if r.boxes is None:
            continue

        for box in r.boxes:
            detections.append({
                "label": model.names[int(box.cls[0])],
                "confidence": round(float(box.conf[0]), 4),
                "bbox": [round(x, 1) for x in box.xyxy[0].tolist()],
            })

    return detections, annotated_path
