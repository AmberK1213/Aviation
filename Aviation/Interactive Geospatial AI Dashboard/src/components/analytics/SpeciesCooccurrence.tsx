import { FilterState } from '../../App';
import { nestingSites } from '../../data/mockData';
import { Network } from 'lucide-react';

interface SpeciesCooccurrenceProps {
  filters: FilterState;
}

export function SpeciesCooccurrence({ filters }: SpeciesCooccurrenceProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Calculate habitat co-occurrence by species
  const cooccurrenceData: Record<string, Record<string, number>> = {};
  
  filteredSites.forEach(site => {
    if (!cooccurrenceData[site.species]) {
      cooccurrenceData[site.species] = {};
    }
    if (!cooccurrenceData[site.species][site.habitat]) {
      cooccurrenceData[site.species][site.habitat] = 0;
    }
    cooccurrenceData[site.species][site.habitat] += 1;
  });

  // Get top species-habitat associations
  const associations: Array<{ species: string; habitat: string; count: number }> = [];
  Object.entries(cooccurrenceData).forEach(([species, habitats]) => {
    Object.entries(habitats).forEach(([habitat, count]) => {
      associations.push({ species, habitat, count });
    });
  });
  
  const topAssociations = associations
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold">Species-Habitat Associations</h3>
      </div>

      <div className="space-y-3">
        {topAssociations.map((assoc, index) => {
          const maxCount = topAssociations[0].count;
          const percentage = (assoc.count / maxCount) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{assoc.species}</span>
                <span className="text-gray-500">{assoc.count} sites</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-24">{assoc.habitat}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm">
          <div className="text-gray-600 mb-2">Habitat Diversity Index</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">High</div>
              <div className="font-semibold text-green-600">
                {Object.values(cooccurrenceData).filter(h => Object.keys(h).length >= 3).length}
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">Medium</div>
              <div className="font-semibold text-amber-600">
                {Object.values(cooccurrenceData).filter(h => Object.keys(h).length === 2).length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">Low</div>
              <div className="font-semibold text-red-600">
                {Object.values(cooccurrenceData).filter(h => Object.keys(h).length === 1).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
