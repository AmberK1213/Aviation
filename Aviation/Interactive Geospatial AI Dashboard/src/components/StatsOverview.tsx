import { Bird, TrendingUp, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { FilterState } from '../App';
import { nestingSites } from '../data/mockData';

interface StatsOverviewProps {
  filters: FilterState;
}

export function StatsOverview({ filters }: StatsOverviewProps) {
  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const totalAbundance = filteredSites.reduce((sum, site) => sum + site.abundance, 0);
  const highPrioritySites = filteredSites.filter(site => site.priority === 'high').length;
  const verifiedSites = filteredSites.filter(site => site.verificationStatus === 'verified').length;
  const avgConfidence = filteredSites.reduce((sum, site) => sum + site.confidence, 0) / filteredSites.length || 0;

  const stats = [
    {
      icon: Bird,
      label: 'Detected Colonies',
      value: filteredSites.length,
      subtext: `${totalAbundance.toLocaleString()} individuals`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CheckCircle,
      label: 'Verified',
      value: verifiedSites,
      subtext: `${((verifiedSites / filteredSites.length) * 100 || 0).toFixed(0)}% confirmed`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: MapPin,
      label: 'Active Sites',
      value: filteredSites.length,
      subtext: 'nesting colonies',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: AlertCircle,
      label: 'High Priority',
      value: highPrioritySites,
      subtext: 'conservation sites',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: TrendingUp,
      label: 'AI Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      subtext: 'detection accuracy',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="font-semibold text-xl">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.subtext}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}