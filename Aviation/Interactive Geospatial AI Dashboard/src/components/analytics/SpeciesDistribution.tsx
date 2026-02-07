import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FilterState } from '../../App';
import { nestingSites, getSpeciesColor } from '../../data/mockData';
import { Bird } from 'lucide-react';

interface SpeciesDistributionProps {
  filters: FilterState;
}

export function SpeciesDistribution({ filters }: SpeciesDistributionProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const speciesData = filteredSites.reduce((acc, site) => {
    if (!acc[site.species]) {
      acc[site.species] = { name: site.species, value: 0 };
    }
    acc[site.species].value += site.abundance;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const chartData = Object.values(speciesData).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bird className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Species Distribution</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getSpeciesColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Total Population: <span className="font-semibold text-gray-900">{chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
