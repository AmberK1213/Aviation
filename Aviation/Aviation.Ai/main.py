import os
import json
import shutil
from pathlib import Path
from datetime import date
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from inference import run_yolo
from gemini_analysis import run_gemini

load_dotenv()

app = FastAPI(title="Aviation AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths relative to this file
BASE_DIR = Path(__file__).parent
ANALYSIS_FILE = BASE_DIR.parent / "Aviation.Api" / "outputs" / "analysis" / "final_analysis.json"
VISUALS_DIR   = BASE_DIR.parent / "Aviation.Api" / "outputs" / "visuals"
VISUALS_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    site_name: str = Form(...),
    survey_date: Optional[str] = Form(None),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    survey_date = survey_date or date.today().isoformat()

    # Save uploaded image to a temp location
    temp_path = BASE_DIR / "temp_upload" / image.filename
    temp_path.parent.mkdir(exist_ok=True)
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    try:
        # 1. Run YOLO
        detections, annotated_path = run_yolo(temp_path)

        # 2. Copy annotated image to visuals dir for the API to serve
        if annotated_path and annotated_path.exists():
            dest = VISUALS_DIR / annotated_path.name
            shutil.copy(annotated_path, dest)

        # 3. Run Gemini analysis
        survey = run_gemini(
            image_path=temp_path,
            detections=detections,
            site_name=site_name,
            survey_date=survey_date,
        )

        # 4. Append to final_analysis.json
        _append_survey(survey, len(detections))

        return JSONResponse({"survey": survey, "bird_count": len(detections)})

    finally:
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()


def _append_survey(new_survey: dict, image_bird_count: int):
    if not ANALYSIS_FILE.exists():
        data = {
            "metadata": {
                "total_images_processed": 0,
                "total_birds_detected": 0,
                "average_birds_per_image": 0.0,
                "survey_sessions": 0,
                "generated_by": "YOLOv8 + Gemini 2.5 Flash (multimodal)",
            },
            "surveys": [],
        }
    else:
        with open(ANALYSIS_FILE) as f:
            data = json.load(f)

    data["surveys"].append(new_survey)

    # Update metadata
    m = data["metadata"]
    m["total_images_processed"] = m.get("total_images_processed", 0) + 1
    m["total_birds_detected"] = m.get("total_birds_detected", 0) + image_bird_count
    m["survey_sessions"] = len(data["surveys"])
    total_imgs = m["total_images_processed"]
    m["average_birds_per_image"] = round(m["total_birds_detected"] / total_imgs, 2) if total_imgs else 0.0

    with open(ANALYSIS_FILE, "w") as f:
        json.dump(data, f, indent=2)
