export interface NestingSite {
  id: string;
  lat: number;
  lng: number;
  species: string;
  abundance: number;
  priority: 'high' | 'medium' | 'low';
  habitat: string;
  lastSurveyed: string;
  confidence: number;
  verificationStatus: 'verified' | 'needs-review' | 'unverified';
  detectionType: 'nest-colony' | 'individual-nests' | 'roosting-site';
  imageId?: string;
}

export interface FilterState {
  species: string[];
  habitat: string[];
  priority: string[];
  minAbundance: number;
  verificationStatus: string[];
}

export interface Detection {
  id: string;
  siteId: string;
  species: string;
  confidence: number;
  imageId: string;
  bbox: [number, number, number, number];
  detectionType: string;
}
