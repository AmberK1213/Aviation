import { FilterState, NestingSite } from '../App';
import { SpeciesDistribution } from './analytics/SpeciesDistribution';
import { TemporalTrends } from './analytics/TemporalTrends';
import { HabitatAnalysis } from './analytics/HabitatAnalysis';
import { PriorityMatrix } from './analytics/PriorityMatrix';
import { ConfidenceMetrics } from './analytics/ConfidenceMetrics';
import { GeographicDistribution } from './analytics/GeographicDistribution';
import { ConservationRecommendations } from './analytics/ConservationRecommendations';
import { SpeciesCooccurrence } from './analytics/SpeciesCooccurrence';

interface AnalyticsDashboardProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
}

export function AnalyticsDashboard({ filters, onSiteSelect }: AnalyticsDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <SpeciesDistribution filters={filters} />
        <TemporalTrends filters={filters} />
        <ConfidenceMetrics filters={filters} />
      </div>

      {/* Second Row - Habitat & Priority Analysis */}
      <div className="grid grid-cols-2 gap-6">
        <HabitatAnalysis filters={filters} />
        <PriorityMatrix filters={filters} />
      </div>

      {/* Third Row - Geographic & Co-occurrence */}
      <div className="grid grid-cols-2 gap-6">
        <GeographicDistribution filters={filters} />
        <SpeciesCooccurrence filters={filters} />
      </div>

      {/* Bottom Row - Recommendations */}
      <ConservationRecommendations filters={filters} onSiteSelect={onSiteSelect} />
    </div>
  );
}
