import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilterState } from '../../App';
import { nestingSites } from '../../data/mockData';
import { MapPin } from 'lucide-react';

interface GeographicDistributionProps {
  filters: FilterState;
}

export function GeographicDistribution({ filters }: GeographicDistributionProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Divide into regions based on longitude
  const regions = [
    { name: 'Western LA', minLng: -93.5, maxLng: -92.0, sites: 0, abundance: 0 },
    { name: 'Central LA', minLng: -92.0, maxLng: -90.5, sites: 0, abundance: 0 },
    { name: 'SE Louisiana', minLng: -90.5, maxLng: -89.5, sites: 0, abundance: 0 },
    { name: 'Eastern LA', minLng: -89.5, maxLng: -88.5, sites: 0, abundance: 0 },
  ];

  filteredSites.forEach(site => {
    const region = regions.find(r => site.lng >= r.minLng && site.lng < r.maxLng);
    if (region) {
      region.sites += 1;
      region.abundance += site.abundance;
    }
  });

  const chartData = regions.map(r => ({
    region: r.name,
    sites: r.sites,
    abundance: r.abundance,
    avgAbundance: r.sites > 0 ? Math.round(r.abundance / r.sites) : 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Geographic Distribution</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="region" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
          />
          <Bar yAxisId="left" dataKey="abundance" fill="#3B82F6" name="Total Abundance" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="sites" fill="#10B981" name="Number of Sites" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Highest Density</div>
            <div className="font-semibold text-gray-900">
              {chartData.sort((a, b) => b.abundance - a.abundance)[0]?.region || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Most Sites</div>
            <div className="font-semibold text-gray-900">
              {chartData.sort((a, b) => b.sites - a.sites)[0]?.region || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
