import { NestingSite } from '../App';

const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7001';

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
