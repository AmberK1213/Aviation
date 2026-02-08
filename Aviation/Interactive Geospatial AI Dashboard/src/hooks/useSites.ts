import { useEffect, useState } from 'react';
import { NestingSite } from '../types';

export function useSites() {
  const [sites, setSites] = useState<NestingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = 'https://localhost:7039';
    
    fetch(`${apiUrl}/api/site`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch sites: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sites:', err);
        setError(err.message);
        setLoading(false);
        setSites([]); // Set empty array so app doesn't hang
      });
  }, []);

  return { sites, loading, error };
}
