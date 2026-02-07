import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FilterState } from '../../App';
import { TrendingUp } from 'lucide-react';

interface TemporalTrendsProps {
  filters: FilterState;
}

export function TemporalTrends({ filters }: TemporalTrendsProps) {
  // Mock temporal data showing seasonal trends
  const temporalData = [
    { month: 'Aug 25', brownPelican: 1800, royalTern: 1400, total: 4200 },
    { month: 'Sep 25', brownPelican: 2100, royalTern: 1650, total: 4850 },
    { month: 'Oct 25', brownPelican: 2400, royalTern: 1800, total: 5450 },
    { month: 'Nov 25', brownPelican: 2650, royalTern: 1950, total: 6100 },
    { month: 'Dec 25', brownPelican: 2850, royalTern: 2150, total: 6600 },
    { month: 'Jan 26', brownPelican: 3100, royalTern: 2300, total: 7150 },
    { month: 'Feb 26', brownPelican: 3250, royalTern: 2400, total: 7500 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold">Population Trends (6-Month)</h3>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={temporalData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Total Population"
            dot={{ fill: '#3B82F6', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="brownPelican" 
            stroke="#8B4513" 
            strokeWidth={2}
            name="Brown Pelican"
            dot={{ fill: '#8B4513', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="royalTern" 
            stroke="#4169E1" 
            strokeWidth={2}
            name="Royal Tern"
            dot={{ fill: '#4169E1', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
        <span className="text-gray-600">6-Month Growth</span>
        <span className="font-semibold text-green-600">+78.6% ↑</span>
      </div>
    </div>
  );
}
