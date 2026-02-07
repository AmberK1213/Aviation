import { useState } from 'react';
import { FilterState, NestingSite } from '../App';
import { nestingSites, SPECIES, getSpeciesColor } from '../data/mockData';
import { TrendingUp, MapPin, AlertCircle, ChevronDown, ChevronUp, Camera, Clock } from 'lucide-react';

interface SpeciesGalleryProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
}

export function SpeciesGallery({ filters, onSiteSelect }: SpeciesGalleryProps) {
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);

  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Group by species and calculate metrics
  const speciesData = SPECIES.map(species => {
    const sites = filteredSites.filter(site => site.species === species);
    const totalAbundance = sites.reduce((sum, site) => sum + site.abundance, 0);
    const avgConfidence = sites.length > 0 
      ? sites.reduce((sum, site) => sum + site.confidence, 0) / sites.length 
      : 0;
    const highPriority = sites.filter(site => site.priority === 'high').length;
    const habitats = [...new Set(sites.map(site => site.habitat))];
    
    return {
      species,
      totalAbundance,
      siteCount: sites.length,
      avgConfidence,
      highPriority,
      habitats,
      sites: sites.sort((a, b) => b.abundance - a.abundance),
      color: getSpeciesColor(species),
    };
  }).filter(data => data.siteCount > 0)
    .sort((a, b) => b.totalAbundance - a.totalAbundance);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-semibold text-xl mb-2">Species Overview</h2>
        <p className="text-sm text-gray-600">
          Detected species from aerial imagery analysis • Click any species to explore nesting sites
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {speciesData.map(data => {
          const isExpanded = expandedSpecies === data.species;
          
          return (
            <div
              key={data.species}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              {/* Species Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedSpecies(isExpanded ? null : data.species)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: data.color, opacity: 0.2 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{data.species}</h3>
                      <p className="text-sm text-gray-600">{data.siteCount} nesting colonies</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Population</div>
                    <div className="font-semibold text-lg text-blue-700">
                      {data.totalAbundance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">AI Confidence</div>
                    <div className="font-semibold text-lg text-green-700">
                      {(data.avgConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">High Priority</div>
                    <div className="font-semibold text-lg text-red-700">
                      {data.highPriority}
                    </div>
                  </div>
                </div>

                {/* Habitats */}
                <div className="flex flex-wrap gap-2">
                  {data.habitats.map(habitat => (
                    <span
                      key={habitat}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {habitat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded Content - Nesting Sites */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Top Nesting Sites
                  </h4>
                  <div className="space-y-2">
                    {data.sites.slice(0, 5).map(site => (
                      <button
                        key={site.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSiteSelect(site);
                        }}
                        className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{site.habitat}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {site.lat.toFixed(3)}°N, {Math.abs(site.lng).toFixed(3)}°W
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(site.lastSurveyed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{site.abundance}</div>
                            <div className="text-xs text-gray-500">individuals</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                              style={{ width: `${site.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{(site.confidence * 100).toFixed(0)}%</span>
                        </div>

                        {site.priority === 'high' && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>High Conservation Priority</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {data.sites.length > 5 && (
                    <div className="mt-3 text-center text-sm text-gray-500">
                      +{data.sites.length - 5} more sites
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {speciesData.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No Species Found</h3>
          <p className="text-gray-600 text-sm">
            Try adjusting your filters to see detected species
          </p>
        </div>
      )}

      {/* Summary Footer */}
      {speciesData.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="font-semibold mb-4">Detection Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Species Detected</div>
              <div className="font-semibold text-2xl">{speciesData.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Population</div>
              <div className="font-semibold text-2xl">
                {speciesData.reduce((sum, d) => sum + d.totalAbundance, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Images Analyzed</div>
              <div className="font-semibold text-2xl">400,000+</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
              <div className="font-semibold text-2xl text-green-600">
                {(speciesData.reduce((sum, d) => sum + d.avgConfidence, 0) / speciesData.length * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
