import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FilterState } from '../../App';
import { nestingSites } from '../../data/mockData';
import { Activity } from 'lucide-react';

interface ConfidenceMetricsProps {
  filters: FilterState;
}

export function ConfidenceMetrics({ filters }: ConfidenceMetricsProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Group by confidence ranges
  const confidenceRanges = [
    { range: '80-85%', min: 0.80, max: 0.85, count: 0 },
    { range: '85-90%', min: 0.85, max: 0.90, count: 0 },
    { range: '90-95%', min: 0.90, max: 0.95, count: 0 },
  ];

  filteredSites.forEach(site => {
    const range = confidenceRanges.find(r => site.confidence >= r.min && site.confidence < r.max);
    if (range) range.count++;
  });

  const avgConfidence = filteredSites.reduce((sum, site) => sum + site.confidence, 0) / filteredSites.length || 0;

  const getColor = (range: string) => {
    if (range.startsWith('90')) return '#10B981';
    if (range.startsWith('85')) return '#3B82F6';
    return '#F59E0B';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold">AI Detection Confidence</h3>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={confidenceRanges}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
            formatter={(value) => [`${value} sites`, 'Count']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {confidenceRanges.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Average Confidence</div>
          <div className="font-semibold text-lg text-gray-900">{(avgConfidence * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-gray-600">High Confidence</div>
          <div className="font-semibold text-lg text-green-600">
            {confidenceRanges[2].count} sites
          </div>
        </div>
      </div>
    </div>
  );
}
