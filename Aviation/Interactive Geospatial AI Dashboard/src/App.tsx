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
  const { sites, loading: sitesLoading } = useSites();
  const { detections, loading: detectionsLoading } = useDetections();

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
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bird className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-normal text-gray-900" style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" }}>Louisiana Coastal Monitoring System</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-500">Last sync:</span> <span className="text-gray-900 font-medium ml-2">Feb 7, 2026</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('detections')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    view === 'detections'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Detections
                </button>
                <button
                  onClick={() => setView('analytics')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    view === 'analytics'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    view === 'map'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <StatsOverview filters={filters} sites={sites} />

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white overflow-y-auto shadow-sm">
          <FilterControls filters={filters} setFilters={setFilters} sites={sites} detections={detections} />
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