import { Bird, TrendingUp, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { FilterState, NestingSite } from '../App';
import { nestingSites } from '../data/mockData';

interface StatsOverviewProps {
  filters: FilterState;
  sites?: NestingSite[];
}

export function StatsOverview({ filters, sites = nestingSites }: StatsOverviewProps) {
  const filteredSites = sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const totalAbundance = filteredSites.reduce((sum, site) => sum + site.abundance, 0);
  const totalDetections = detections.length;
  const verifiedSites = filteredSites.filter(site => site.verificationStatus === 'verified').length;
  const avgConfidence = filteredSites.reduce((sum, site) => sum + site.confidence, 0) / filteredSites.length || 0;

  const stats = [
    {
      icon: Eye,
      label: 'Avian Presence Detected',
      value: filteredSites.length,
      subtext: `nesting colonies identified`,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
      borderColor: 'border-blue-600',
    },
    {
      icon: Bird,
      label: 'Estimated Population',
      value: totalAbundance.toLocaleString(),
      subtext: `individual birds across ${filteredSites.length} sites`,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700',
      borderColor: 'border-purple-600',
    },
    {
      icon: Layers,
      label: 'Total Detections',
      value: totalDetections.toLocaleString(),
      subtext: `AI-processed images`,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-teal-500 to-teal-700',
      borderColor: 'border-teal-600',
    },
    {
      icon: CheckCircle,
      label: 'Verified Colonies',
      value: verifiedSites,
      subtext: `${((verifiedSites / filteredSites.length) * 100 || 0).toFixed(0)}% validation rate`,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-700',
      borderColor: 'border-green-600',
    },
    {
      icon: TrendingUp,
      label: 'AI Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      subtext: 'average detection accuracy',
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-700',
      borderColor: 'border-orange-600',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3 flex-1">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={stat.color}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">{stat.label}</div>
              <div className="font-bold text-3xl mb-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
              <div className="text-xs opacity-80">{stat.subtext}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}