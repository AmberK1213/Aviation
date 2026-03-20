import { NestingSite } from '../App';

const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7001';
const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

export interface Detection {
  id: string;
  filename: string;
  birdCount: number;
  imageUrl: string;
  surveyDate: string;
  siteName: string;
}

export async function fetchSites(): Promise<NestingSite[]> {
  const res = await fetch(`${API_BASE}/api/sites`);
  if (!res.ok) throw new Error(`Failed to fetch sites: ${res.status}`);
  return res.json();
}

export async function fetchSurveyAnalysis() {
  const res = await fetch(`${API_BASE}/api/sites/surveys`);
  if (!res.ok) throw new Error(`Failed to fetch surveys: ${res.status}`);
  return res.json();
}

export async function fetchDetections(): Promise<Detection[]> {
  const res = await fetch(`${API_BASE}/api/sites/detections`);
  if (!res.ok) throw new Error(`Failed to fetch detections: ${res.status}`);
  return res.json();
}

export async function analyzeImage(
  image: File,
  siteName: string,
  surveyDate?: string,
): Promise<{ survey: any; bird_count: number }> {
  const form = new FormData();
  form.append('image', image);
  form.append('site_name', siteName);
  if (surveyDate) form.append('survey_date', surveyDate);

  const res = await fetch(`${AI_BASE}/analyze`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Analysis failed: ${err}`);
  }
  return res.json();
}
