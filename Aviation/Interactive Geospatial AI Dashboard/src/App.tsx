import { useState } from 'react';
import { MapView } from './components/MapView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DetectionGallery } from './components/DetectionGallery';
import { FilterControls } from './components/FilterControls';
import { StatsOverview } from './components/StatsOverview';
import { BarChart3, Map, Camera, Bird, TrendingUp, CheckCircle } from 'lucide-react';
import { NestingSite, FilterState } from './types';
import { useSites } from './hooks/useSites';
import { useDetections } from './hooks/useDetections';

export default function App() {
  const [selectedSite, setSelectedSite] = useState<NestingSite | null>(null);
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

  console.log('Current view:', view);
  console.log('Sites:', sites.length);
  console.log('Detections:', detections.length);

  if (sitesLoading || detectionsLoading) {
    return <div>Loading data...</div>;
  }

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

      {/* Stats Cards */}
      <div className="bg-white px-8 py-6 pb-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Bird className="w-10 h-10 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">LIVE</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{sites.length}</div>
            <div className="text-sm text-gray-600">Active Colonies</div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-green-600" />
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {sites.reduce((sum, s) => sum + s.abundance, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Population</div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Camera className="w-10 h-10 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">AI</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{detections.length}</div>
            <div className="text-sm text-gray-600">Detections</div>
          </div>
          
          <div className="bg-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-10 h-10 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">HIGH</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {((sites.reduce((sum, s) => sum + s.confidence, 0) / sites.length) * 100 || 0).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white overflow-y-auto shadow-sm">
          <FilterControls filters={filters} setFilters={setFilters} sites={sites} detections={detections} />
        </div>

        {/* Main View */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {view === 'detections' && (
            <DetectionGallery filters={filters} onSiteSelect={setSelectedSite} sites={sites} detections={detections} />
          )}
          {view === 'analytics' && (
            <AnalyticsDashboard filters={filters} onSiteSelect={setSelectedSite} sites={sites} detections={detections} />
          )}
          {view === 'map' && (
            <MapView 
              filters={filters} 
              selectedSite={selectedSite}
              onSiteSelect={setSelectedSite}
              sites={sites}
              detections={detections}
            />
          )}
        </div>
      </div>
    </div>
  );
}