import { useEffect, useState } from 'react';
import { Detection } from '../types';

export function useDetections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = 'https://localhost:7039';

    fetch(`${apiUrl}/api/detection`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch detections: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setDetections(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching detections:', err);
        setError(err.message);
        setLoading(false);
        setDetections([]); // Set empty array so app doesn't hang
      });
  }, []);

  return { detections, loading, error };
}
