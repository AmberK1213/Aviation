import { FilterState, NestingSite } from '../../App';
import { nestingSites } from '../../data/mockData';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface ConservationRecommendationsProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
}

export function ConservationRecommendations({ filters, onSiteSelect }: ConservationRecommendationsProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Identify priority sites
  const highPrioritySites = filteredSites
    .filter(site => site.priority === 'high')
    .sort((a, b) => b.abundance - a.abundance)
    .slice(0, 5);

  // Calculate risk factors
  const vulnerableHabitats = ['Barrier Island', 'Sandy Beach', 'Oyster Reef'];
  const vulnerableSites = filteredSites.filter(site => 
    vulnerableHabitats.includes(site.habitat) && site.priority === 'high'
  );

  const recommendations = [
    {
      type: 'urgent',
      icon: AlertTriangle,
      title: 'Immediate Protection Required',
      description: `${highPrioritySites.length} high-priority sites with total population of ${highPrioritySites.reduce((sum, s) => sum + s.abundance, 0).toLocaleString()} individuals require immediate conservation action.`,
      color: 'red',
    },
    {
      type: 'warning',
      icon: Info,
      title: 'Habitat Vulnerability Assessment',
      description: `${vulnerableSites.length} sites in erosion-prone habitats (barrier islands, sandy beaches) need shoreline stabilization evaluation.`,
      color: 'amber',
    },
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Monitoring Effectiveness',
      description: `AI detection confidence averaging ${(filteredSites.reduce((sum, s) => sum + s.confidence, 0) / filteredSites.length * 100).toFixed(1)}% across all sites. Continue monthly aerial surveys.`,
      color: 'green',
    },
    {
      type: 'info',
      icon: TrendingUp,
      title: 'Population Growth Trends',
      description: 'Overall population shows 78.6% growth over 6 months. Maintain current management practices and habitat restoration efforts.',
      color: 'blue',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Conservation Decision Support</h3>
        <p className="text-sm text-gray-600">
          AI-driven recommendations for wildlife resource managers and conservation planning
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          const colors = {
            red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
            green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
          }[rec.color];

          return (
            <div key={index} className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                <div>
                  <h4 className={`font-semibold text-sm ${colors.text} mb-1`}>{rec.title}</h4>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-sm mb-4">Priority Sites for Funding Allocation</h4>
        <div className="space-y-2">
          {highPrioritySites.map((site, index) => (
            <button
              key={site.id}
              onClick={() => onSiteSelect(site)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{index + 1}. {site.species}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      High Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{site.habitat}</span>
                    <span>•</span>
                    <span>{site.abundance} individuals</span>
                    <span>•</span>
                    <span>{(site.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-xs font-mono">{site.lat.toFixed(3)}°N</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">Recommended Actions</h4>
        <ul className="text-sm text-blue-800 space-y-1.5">
          <li>• Allocate restoration funding to top 5 high-priority sites</li>
          <li>• Conduct shoreline erosion assessment for barrier island habitats</li>
          <li>• Increase monitoring frequency to bi-weekly during nesting season</li>
          <li>• Coordinate with CPRA for marsh restoration project integration</li>
          <li>• Prepare storm vulnerability assessment before hurricane season</li>
        </ul>
      </div>
    </div>
  );
}
