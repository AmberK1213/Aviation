import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FilterState } from '../../App';
import { nestingSites } from '../../data/mockData';
import { Leaf } from 'lucide-react';

interface HabitatAnalysisProps {
  filters: FilterState;
}

export function HabitatAnalysis({ filters }: HabitatAnalysisProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const habitatData = filteredSites.reduce((acc, site) => {
    if (!acc[site.habitat]) {
      acc[site.habitat] = {
        habitat: site.habitat,
        abundance: 0,
        sites: 0,
        highPriority: 0,
      };
    }
    acc[site.habitat].abundance += site.abundance;
    acc[site.habitat].sites += 1;
    if (site.priority === 'high') acc[site.habitat].highPriority += 1;
    return acc;
  }, {} as Record<string, { habitat: string; abundance: number; sites: number; highPriority: number }>);

  const chartData = Object.values(habitatData)
    .sort((a, b) => b.abundance - a.abundance)
    .map(d => ({
      ...d,
      habitat: d.habitat.length > 15 ? d.habitat.substring(0, 13) + '...' : d.habitat,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold">Habitat Type Analysis</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis dataKey="habitat" type="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={100} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="abundance" fill="#10B981" name="Total Abundance" radius={[0, 4, 4, 0]} />
          <Bar dataKey="highPriority" fill="#EF4444" name="High Priority Sites" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Top Habitat</div>
            <div className="font-semibold text-gray-900">{Object.values(habitatData)[0]?.habitat || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-600">Total Habitats</div>
            <div className="font-semibold text-gray-900">{Object.keys(habitatData).length}</div>
          </div>
          <div>
            <div className="text-gray-600">Avg per Habitat</div>
            <div className="font-semibold text-gray-900">
              {Math.round(chartData.reduce((sum, d) => sum + d.abundance, 0) / chartData.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
