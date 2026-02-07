import { useEffect, useState } from 'react';
import { NestingSite } from '../types';

export function useSites() {
  const [sites, setSites] = useState<NestingSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sites')
      .then(res => res.json())
      .then(data => {
        setSites(data);
        setLoading(false);
      });
  }, []);

  return { sites, loading };
}
