import os
import json
from pathlib import Path
import google.generativeai as genai
from google.generativeai import protos
from PIL import Image

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
_model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")

# Google Search grounding tool — gives Gemini real-time web access
_search_tool = protos.Tool(google_search=protos.GoogleSearch())

PROMPT_TEMPLATE = """
You are an expert ornithologist and coastal ecologist analyzing aerial survey imagery of Louisiana coastal bird colonies.

You have access to Google Search. BEFORE writing any analysis, you MUST actively search for and retrieve specific data on:
1. Current land loss and erosion rates for {site_name}, Louisiana (look for USGS, CPRA, or NOAA data)
2. Named hurricanes or tropical storms that have struck {site_name} in the last 10 years and their documented impacts
3. Historical acreage loss at {site_name} — how large was the island/marsh before vs. now
4. Known nesting species at {site_name} from LDWF, Audubon Louisiana, or USGS breeding bird surveys
5. Any active CWPPRA (Coastal Wetlands Planning, Protection and Restoration Act) or CPRA restoration projects at this site

Use what you find to populate the research_findings section with REAL, SPECIFIC data points (not generic statements).

YOLO Detection Results:
- Total birds detected: {total_count}
- Detection breakdown: {detection_summary}

Site: {site_name}
Survey date: {survey_date}

Return a JSON object with EXACTLY this structure (no markdown, raw JSON only).
IMPORTANT: gemini_notes must describe the coastal environment only — erosion, land loss, wetland health, storm history, conservation status. Never reference YOLO, detections, AI models, or image analysis in gemini_notes.

{{
  "survey_date": "{survey_date}",
  "site_name": "{site_name}",
  "research_findings": {{
    "land_loss_rate": "specific figure e.g. '15 acres/year' or 'unknown'",
    "historical_acreage": "e.g. '340 acres in 1930, 28 acres today' or 'unknown'",
    "recent_storms": ["list named storms with year, e.g. 'Hurricane Ida (2021)'"],
    "known_nesting_species": ["list species documented at this site from published sources"],
    "restoration_projects": ["list active or completed CWPPRA/CPRA projects, or 'none known'"],
    "data_sources": ["list the sources you found, e.g. 'USGS 2023 land loss report', 'LDWF colonial waterbird survey'"]
  }},
  "bird_data": {{
    "total_count": {total_count},
    "population_type": "nesting_colony|migratory_stopover|foraging_flock",
    "population_type_reasoning": "...",
    "estimated_classifications": [
      {{
        "species": "species name",
        "estimated_percentage": 0,
        "confidence": "high|medium|low",
        "reasoning": "..."
      }}
    ]
  }},
  "habitat_assessment": {{
    "condition": "healthy|stressed|recovering|degraded",
    "description": "...",
    "coastal_erosion_risk": "high|medium|low"
  }},
  "climate_impact": {{
    "recent_disturbance": false,
    "disturbance_type": "none|hurricane|flooding|drought|erosion",
    "estimated_impact_on_population": "none|minor|moderate|severe",
    "impact_reasoning": "...",
    "recovery_stage": "established|recovering|pre-event|post-event"
  }},
  "overall_risk_level": "high|medium|low",
  "gemini_notes": "2-3 sentences focused entirely on the coastal environment of this specific site: current erosion rates, land loss history, wetland degradation, storm impacts, and conservation status. Do NOT mention YOLO, detections, or AI. Write as a coastal ecologist would in a field report."
}}
"""


def run_gemini(
    image_path: Path,
    detections: list[dict],
    site_name: str,
    survey_date: str,
) -> dict:
    total_count = len(detections)

    # Summarise detections by label
    label_counts: dict[str, int] = {}
    for d in detections:
        label_counts[d["label"]] = label_counts.get(d["label"], 0) + 1
    detection_summary = ", ".join(f"{v} {k}" for k, v in label_counts.items()) or "no detections"

    prompt = PROMPT_TEMPLATE.format(
        total_count=total_count,
        detection_summary=detection_summary,
        site_name=site_name,
        survey_date=survey_date,
    )

    image = Image.open(image_path)

    response = _model.generate_content(
        [prompt, image],
        tools=[_search_tool],
    )

    # When grounding tools are used, response.text can raise ValueError if the
    # response contains only tool-call parts with no final text part.
    # Fall back to extracting text from candidates manually.
    try:
        raw = response.text.strip()
    except (ValueError, AttributeError):
        raw = ""
        for candidate in response.candidates or []:
            for part in getattr(candidate.content, "parts", []):
                if hasattr(part, "text") and part.text:
                    raw += part.text
        raw = raw.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        survey = json.loads(raw)
    except json.JSONDecodeError:
        survey = {
            "survey_date": survey_date,
            "site_name": site_name,
            "research_findings": {
                "land_loss_rate": "unknown",
                "historical_acreage": "unknown",
                "recent_storms": [],
                "known_nesting_species": [],
                "restoration_projects": [],
                "data_sources": [],
            },
            "bird_data": {
                "total_count": total_count,
                "population_type": "nesting_colony",
                "population_type_reasoning": "Based on YOLO detections only — Gemini parse failed.",
                "estimated_classifications": [],
            },
            "habitat_assessment": {"condition": "unknown", "description": raw[:200], "coastal_erosion_risk": "unknown"},
            "climate_impact": {"recent_disturbance": False, "disturbance_type": "none", "estimated_impact_on_population": "none", "impact_reasoning": "", "recovery_stage": "established"},
            "overall_risk_level": "medium",
            "gemini_notes": f"JSON parse failed. Raw response: {raw[:300]}",
        }

    return survey
