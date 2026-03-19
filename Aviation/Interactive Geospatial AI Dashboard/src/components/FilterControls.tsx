import { Filter, X, Bird, CheckCircle } from 'lucide-react';
import { FilterState, NestingSite, Detection } from '../types';
import { SPECIES, HABITATS } from '../data/mockData';

interface FilterControlsProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sites: NestingSite[];
  detections: Detection[];
}


export function FilterControls({ filters, setFilters, sites, detections }: FilterControlsProps) {
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFilters({ ...filters, [category]: newValues });
  };

  const clearAllFilters = () => {
    setFilters({
      species: [],
      habitat: [],
      priority: [],
      minAbundance: 0,
      verificationStatus: [],
    });
  };

  const activeFilterCount = 
    filters.species.length + 
    filters.habitat.length + 
    filters.priority.length + 
    filters.verificationStatus.length +
    (filters.minAbundance > 0 ? 1 : 0);

  return (
    <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-lg text-gray-900">Filter Detections</h2>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Verification Status Filter */}
      <div className="mb-5 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Verification Status
        </h3>
        <div className="space-y-2">
          {['verified', 'needs-review', 'unverified'].map(status => (
            <label key={status} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-all">
              <input
                type="checkbox"
                checked={filters.verificationStatus.includes(status)}
                onChange={() => toggleFilter('verificationStatus', status)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize font-medium">
                {status.replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Detection Type Filter */}
      <div className="mb-5 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Bird className="w-4 h-4 text-blue-600" />
          Detection Type
        </h3>
        <div className="space-y-2">
          {['nest colony', 'individual nests', 'roosting site'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-all">
              <input
                type="checkbox"
                checked={filters.species.includes(type)}
                onChange={() => toggleFilter('species', type)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize font-medium">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Habitat Filter */}
      <div className="mb-5 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" />
          Habitat Type
        </h3>
        <div className="space-y-2">
          {HABITATS.map(habitat => (
            <label key={habitat} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-all">
              <input
                type="checkbox"
                checked={filters.habitat.includes(habitat)}
                onChange={() => toggleFilter('habitat', habitat)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                {habitat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-5 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-600" />
          Conservation Priority
        </h3>
        <div className="space-y-2">
          {['high', 'medium', 'low'].map(priority => (
            <label key={priority} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-all">
              <input
                type="checkbox"
                checked={filters.priority.includes(priority)}
                onChange={() => toggleFilter('priority', priority)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  priority === 'high' ? 'bg-red-500' :
                  priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></span>
                {priority} Priority
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Abundance Filter */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Minimum Population: {filters.minAbundance.toLocaleString()} birds
        </h3>
        <input
          type="range"
          min="0"
          max="500"
          step="50"
          value={filters.minAbundance}
          onChange={(e) => setFilters({ ...filters, minAbundance: parseInt(e.target.value) })}
          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>0</span>
          <span>500</span>
        </div>
      </div>
    </div>
  );
}
