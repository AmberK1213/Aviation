import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';
import { FilterState } from '../../App';
import { nestingSites, getPriorityColor } from '../../data/mockData';
import { Target } from 'lucide-react';

interface PriorityMatrixProps {
  filters: FilterState;
}

export function PriorityMatrix({ filters }: PriorityMatrixProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const chartData = filteredSites.map(site => ({
    abundance: site.abundance,
    confidence: site.confidence * 100,
    priority: site.priority,
    species: site.species,
    z: 50, // Bubble size
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold">Conservation Priority Matrix</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            type="number" 
            dataKey="abundance" 
            name="Abundance" 
            tick={{ fontSize: 11 }} 
            stroke="#9CA3AF"
            label={{ value: 'Population Abundance', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
          />
          <YAxis 
            type="number" 
            dataKey="confidence" 
            name="Confidence" 
            tick={{ fontSize: 11 }} 
            stroke="#9CA3AF"
            label={{ value: 'AI Confidence (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <ZAxis type="number" dataKey="z" range={[50, 200]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
            formatter={(value: number, name: string) => {
              if (name === 'confidence') return [`${value.toFixed(1)}%`, 'Confidence'];
              if (name === 'abundance') return [value, 'Abundance'];
              return value;
            }}
          />
          <Scatter name="Sites" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-700">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
