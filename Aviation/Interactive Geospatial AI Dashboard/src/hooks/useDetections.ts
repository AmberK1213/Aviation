import { useEffect, useState } from 'react';

export interface Detection {
  id: string;
  siteId: string;
  species: string;
  confidence: number;
  imageId: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
  detectionType: string;
}

export function useDetections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/detection')
      .then(res => res.json())
      .then(data => {
        setDetections(data);
        setLoading(false);
      });
  }, []);

  return { detections, loading };
}
