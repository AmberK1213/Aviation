import { Bird, TrendingUp, MapPin } from 'lucide-react';
import { FilterState, NestingSite } from '../App';
import { nestingSites, getSpeciesColor } from '../data/mockData';

interface SpeciesPanelProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
}

export function SpeciesPanel({ filters, onSiteSelect }: SpeciesPanelProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Group by species and calculate totals
  const speciesSummary = filteredSites.reduce((acc, site) => {
    if (!acc[site.species]) {
      acc[site.species] = {
        species: site.species,
        totalAbundance: 0,
        siteCount: 0,
        sites: [],
      };
    }
    acc[site.species].totalAbundance += site.abundance;
    acc[site.species].siteCount += 1;
    acc[site.species].sites.push(site);
    return acc;
  }, {} as Record<string, { species: string; totalAbundance: number; siteCount: number; sites: NestingSite[] }>);

  const sortedSpecies = Object.values(speciesSummary).sort(
    (a, b) => b.totalAbundance - a.totalAbundance
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bird className="w-4 h-4 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Species Overview</h2>
      </div>

      <div className="space-y-3">
        {sortedSpecies.map(({ species, totalAbundance, siteCount, sites }) => (
          <div key={species} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getSpeciesColor(species) }}
                />
                <span className="font-medium text-sm">{species}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{totalAbundance}</div>
                <div className="text-xs text-gray-500">individuals</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{siteCount} sites</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Avg: {Math.round(totalAbundance / siteCount)}</span>
              </div>
            </div>

            {/* Top Sites */}
            <div className="space-y-1">
              {sites
                .sort((a, b) => b.abundance - a.abundance)
                .slice(0, 2)
                .map(site => (
                  <button
                    key={site.id}
                    onClick={() => onSiteSelect(site)}
                    className="w-full text-left px-2 py-1.5 bg-white rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{site.habitat}</span>
                      <span className="font-medium">{site.abundance}</span>
                    </div>
                    <div className="text-gray-500 mt-0.5">
                      {site.lat.toFixed(4)}°N, {Math.abs(site.lng).toFixed(4)}°W
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}

        {sortedSpecies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bird className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No species match the current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
