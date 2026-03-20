import { useState } from 'react';
import { FilterState, NestingSite } from '../App';
import { Detection } from '../services/apiService';
import { Camera, AlertCircle, CheckCircle, HelpCircle, MapPin, Maximize2, Bird } from 'lucide-react';

interface DetectionGalleryProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
  sites?: NestingSite[];
  detections?: Detection[];
}

export function DetectionGallery({ filters, onSiteSelect, sites = [], detections = [] }: DetectionGalleryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const usingDetections = detections.length > 0;

  const filteredSites = sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs-review': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-review': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalCount = usingDetections ? detections.length : filteredSites.length;
  const totalBirds = usingDetections
    ? detections.reduce((s, d) => s + d.birdCount, 0)
    : filteredSites.reduce((s, site) => s + site.abundance, 0);

  return (
    <div className="p-6">
      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl" alt="Detection" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-semibold text-xl mb-2">AI Detection Results</h2>
        <p className="text-sm text-gray-600 mb-4">
          YOLOv8 detects birds in aerial imagery · Species classification via Gemini 2.5 Flash
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Images Processed</div>
            <div className="font-semibold text-2xl">{totalCount.toLocaleString()}</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Bird className="w-3 h-3" /> Birds Detected
            </div>
            <div className="font-semibold text-2xl text-blue-700">{totalBirds.toLocaleString()}</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Pending Review
            </div>
            <div className="font-semibold text-2xl text-amber-700">{totalCount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Detection image cards (from API) */}
      {usingDetections && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {detections.map(detection => (
            <div key={detection.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 overflow-hidden">
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                <img
                  src={detection.imageUrl}
                  alt={detection.filename}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxUrl(detection.imageUrl)}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                  {detection.filename.split('Camera')[0]}
                </div>
                <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded font-semibold">
                  {detection.birdCount} birds
                </div>
                <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded shadow" onClick={() => setLightboxUrl(detection.imageUrl)}>
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{detection.siteName}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">AI Detected</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {new Date(detection.surveyDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Site cards fallback */}
      {!usingDetections && filteredSites.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSites.map(site => (
            <div
              key={site.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 overflow-hidden cursor-pointer"
              onClick={() => onSiteSelect(site)}
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 via-green-50 to-amber-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-300" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-red-500 rounded-full w-24 h-24 animate-pulse" />
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {site.imageId || site.id}
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {(site.confidence * 100).toFixed(0)}% confidence
                </div>
                <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded shadow">
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(site.verificationStatus)}`}>
                    {getStatusIcon(site.verificationStatus)}
                    <span className="capitalize">{site.verificationStatus.replace('-', ' ')}</span>
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Predicted Species</div>
                  <div className="font-semibold text-base">{site.species}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">Estimated Count</div>
                    <div className="font-semibold">{site.abundance}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">Habitat Type</div>
                    <div className="font-semibold text-sm">{site.habitat.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {site.lat.toFixed(4)}°N, {Math.abs(site.lng).toFixed(4)}°W
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!usingDetections && filteredSites.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No Detections Found</h3>
          <p className="text-gray-600 text-sm">Try adjusting your filters to see detected colonies</p>
        </div>
      )}
    </div>
  );
}
