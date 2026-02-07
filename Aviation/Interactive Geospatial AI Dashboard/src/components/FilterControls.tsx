import { Filter, X } from 'lucide-react';
import { FilterState } from '../App';
import { SPECIES, HABITATS } from '../data/mockData';

interface FilterControlsProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export function FilterControls({ filters, setFilters }: FilterControlsProps) {
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
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Verification Status Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Verification Status</h3>
        <div className="space-y-1.5">
          {['verified', 'needs-review', 'unverified'].map(status => (
            <label key={status} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.verificationStatus.includes(status)}
                onChange={() => toggleFilter('verificationStatus', status)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                {status.replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Species Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Species</h3>
        <div className="space-y-1.5">
          {SPECIES.map(species => (
            <label key={species} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.species.includes(species)}
                onChange={() => toggleFilter('species', species)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {species}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Habitat Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Habitat Type</h3>
        <div className="space-y-1.5">
          {HABITATS.map(habitat => (
            <label key={habitat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.habitat.includes(habitat)}
                onChange={() => toggleFilter('habitat', habitat)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {habitat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Conservation Priority</h3>
        <div className="space-y-1.5">
          {['high', 'medium', 'low'].map(priority => (
            <label key={priority} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.priority.includes(priority)}
                onChange={() => toggleFilter('priority', priority)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                {priority} Priority
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Abundance Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Minimum Abundance: {filters.minAbundance}
        </h3>
        <input
          type="range"
          min="0"
          max="500"
          step="50"
          value={filters.minAbundance}
          onChange={(e) => setFilters({ ...filters, minAbundance: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>500</span>
        </div>
      </div>
    </div>
  );
}