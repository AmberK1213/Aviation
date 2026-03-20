import { useState, useEffect, useCallback } from 'react';
import { MapView } from './components/MapView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FilterControls } from './components/FilterControls';
import { AnalyzeUpload } from './components/AnalyzeUpload';
import { BarChart3, Map, Leaf, Upload } from 'lucide-react';
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
  siteName?: string;
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

type View = 'analytics' | 'map' | 'analyze';

const NAV: { id: View; label: string; icon: any }[] = [
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'analyze', label: 'Analyze Image', icon: Upload },
];

export default function App() {
  const [selectedSite, setSelectedSite] = useState<NestingSite | null>(null);
  const [sites, setSites] = useState<NestingSite[]>([]);
  const [surveyAnalysis, setSurveyAnalysis] = useState<any>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    species: [],
    habitat: [],
    priority: [],
    minAbundance: 0,
    verificationStatus: [],
  });
  const [view, setView] = useState<View>('analytics');

  const loadData = useCallback(() => {
    fetchSites().then(setSites).catch(() => {});
    fetchSurveyAnalysis().then(setSurveyAnalysis).catch(() => {});
    fetchDetections().then(setDetections).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white shrink-0" style={{ borderBottom: '1px solid rgba(45,106,79,0.12)', boxShadow: '0 1px 8px rgba(45,106,79,0.06)' }}>
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight tracking-tight" style={{ fontSize: '15px' }}>Coastal Wildlife Monitor</h1>
              <p className="text-xs text-gray-400">YOLOv8 · Gemini 2.5 Flash · {sites.length} sites · {surveyAnalysis?.metadata?.total_birds_detected?.toLocaleString() ?? '—'} birds detected</p>
            </div>
          </div>

          <nav className="flex gap-1 p-1 rounded-xl" style={{ background: '#F0F9F4' }}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === id ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
                style={view === id ? { background: 'linear-gradient(135deg, #2D6A4F, #40916C)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter sidebar — map view only */}
        {view === 'map' && (
          <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
            <FilterControls filters={filters} setFilters={setFilters} sites={sites} detections={detections} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {view === 'analytics' && (
            <AnalyticsDashboard filters={filters} onSiteSelect={setSelectedSite} sites={sites} surveyAnalysis={surveyAnalysis} detections={detections} />
          )}
          {view === 'map' && (
            <MapView filters={filters} selectedSite={selectedSite} onSiteSelect={setSelectedSite} sites={sites} />
          )}
          {view === 'analyze' && (
            <AnalyzeUpload onSurveyAdded={loadData} />
          )}
        </div>
      </div>
    </div>
  );
}
