import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DetectionGallery } from './components/DetectionGallery';
import { FilterControls } from './components/FilterControls';
import { StatsOverview } from './components/StatsOverview';
import { BarChart3, Map, Camera } from 'lucide-react';
import { nestingSites as mockSites } from './data/mockData';
import { fetchSites, fetchSurveyAnalysis, fetchDetections, Detection } from './services/apiService';

export interface NestingSite {
  id: string;
  lat: number;
  lng: number;
  species: string;
  abundance: number;
  priority: 'high' | 'medium' | 'low';
  habitat: string;
  lastSurveyed: string;
  confidence: number;
  verificationStatus: 'verified' | 'needs-review' | 'unverified';
  detectionType: 'nest-colony' | 'individual-nests' | 'roosting-site';
  imageId?: string;
  climateImpact?: {
    recentDisturbance: boolean;
    disturbanceType: string;
    estimatedImpact: string;
    recoveryStage: string;
  };
  habitatCondition?: string;
  erosionRisk?: string;
  populationType?: string;
}

export interface FilterState {
  species: string[];
  habitat: string[];
  priority: string[];
  minAbundance: number;
  verificationStatus: string[];
}

export default function App() {
  const [selectedSite, setSelectedSite] = useState<NestingSite | null>(null);
  const [sites, setSites] = useState<NestingSite[]>(mockSites);
  const [surveyAnalysis, setSurveyAnalysis] = useState<any>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    species: [],
    habitat: [],
    priority: [],
    minAbundance: 0,
    verificationStatus: [],
  });
  const [view, setView] = useState<'detections' | 'analytics' | 'map'>('detections');

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch(() => setSites(mockSites)); // fall back to mock if API unavailable

    fetchSurveyAnalysis()
      .then(setSurveyAnalysis)
      .catch(() => {}); // non-critical

    fetchDetections()
      .then(setDetections)
      .catch(() => {}); // non-critical, gallery falls back to mock cards
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">Louisiana Coastal Avian Habitat Monitor</h1>
            <p className="text-sm text-gray-600">AI Colony Detection & Species Classification System • 400,000+ Images</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Last Updated: February 2026
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('detections')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  view === 'detections'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                Detections
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  view === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  view === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <StatsOverview filters={filters} sites={sites} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Filters */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <FilterControls filters={filters} setFilters={setFilters} />
        </div>

        {/* Main View */}
        <div className="flex-1 overflow-auto">
          {view === 'detections' ? (
            <DetectionGallery filters={filters} onSiteSelect={setSelectedSite} sites={sites} detections={detections} />
          ) : view === 'analytics' ? (
            <AnalyticsDashboard filters={filters} onSiteSelect={setSelectedSite} sites={sites} surveyAnalysis={surveyAnalysis} />
          ) : (
            <MapView
              filters={filters}
              selectedSite={selectedSite}
              onSiteSelect={setSelectedSite}
              sites={sites}
            />
          )}
        </div>
      </div>
    </div>
  );
}
