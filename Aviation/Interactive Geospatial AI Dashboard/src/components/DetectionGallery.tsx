import { useState } from 'react';
import { FilterState, NestingSite } from '../App';
import { nestingSites } from '../data/mockData';
import { Camera, CheckCircle, AlertCircle, HelpCircle, MapPin, Maximize2 } from 'lucide-react';

interface DetectionGalleryProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
}

export function DetectionGallery({ filters, onSiteSelect }: DetectionGalleryProps) {
  const [selectedDetection, setSelectedDetection] = useState<NestingSite | null>(null);

  const filteredSites = nestingSites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs-review':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-review':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDetectionTypeBadge = (type: string) => {
    switch (type) {
      case 'nest-colony':
        return 'bg-blue-100 text-blue-700';
      case 'individual-nests':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-teal-100 text-teal-700';
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="font-semibold text-xl mb-2">AI Detection Results</h2>
        <p className="text-sm text-gray-600 mb-4">
          Neural network identifies potential nesting colonies from aerial imagery • Species classification requires verification
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total Detections</div>
            <div className="font-semibold text-2xl">{filteredSites.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
            <div className="font-semibold text-2xl text-green-700">
              {filteredSites.filter(s => s.verificationStatus === 'verified').length}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Needs Review
            </div>
            <div className="font-semibold text-2xl text-amber-700">
              {filteredSites.filter(s => s.verificationStatus === 'needs-review').length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Unverified
            </div>
            <div className="font-semibold text-2xl text-gray-700">
              {filteredSites.filter(s => s.verificationStatus === 'unverified').length}
            </div>
          </div>
        </div>
      </div>

      {/* Detection Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSites.map(site => (
          <div
            key={site.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedDetection(site);
              onSiteSelect(site);
            }}
          >
            {/* Mock Aerial Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 via-green-50 to-amber-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-300" />
              </div>
              
              {/* Detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-red-500 rounded-full w-24 h-24 animate-pulse"></div>
              </div>

              {/* Image metadata */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                IMG_{site.imageId || `${site.id.padStart(6, '0')}`}
              </div>
              
              {/* Confidence score */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(site.confidence * 100).toFixed(0)}% confidence
              </div>

              {/* Expand button */}
              <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded shadow">
                <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Detection Info */}
            <div className="p-4">
              {/* Status and Type */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(site.verificationStatus)}`}>
                  {getStatusIcon(site.verificationStatus)}
                  <span className="ml-1 capitalize">{site.verificationStatus.replace('-', ' ')}</span>
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDetectionTypeBadge(site.detectionType)}`}>
                  {site.detectionType.replace('-', ' ')}
                </span>
              </div>

              {/* Species Identification */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Predicted Species</div>
                <div className="font-semibold text-base flex items-center justify-between">
                  <span>{site.species}</span>
                  {site.verificationStatus !== 'verified' && (
                    <span className="text-xs text-amber-600 font-normal">Unconfirmed</span>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
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

              {/* Location */}
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {site.lat.toFixed(4)}°N, {Math.abs(site.lng).toFixed(4)}°W
              </div>

              {/* Survey Date */}
              <div className="text-xs text-gray-500 mt-2">
                Detected: {new Date(site.lastSurveyed).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>

              {/* Action needed banner */}
              {site.verificationStatus === 'needs-review' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                    <strong>Action Required:</strong> Expert review needed for species confirmation
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No Detections Found</h3>
          <p className="text-gray-600 text-sm">
            Try adjusting your filters to see detected colonies
          </p>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3 text-blue-900">How Detection Works</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-900 mb-1">1. AI Detection</div>
            <p className="text-blue-800">
              Neural network scans aerial imagery to identify potential nesting colonies based on visual patterns, clustering, and habitat context.
            </p>
          </div>
          <div>
            <div className="font-medium text-blue-900 mb-1">2. Species Prediction</div>
            <p className="text-blue-800">
              AI suggests species based on nest structure, habitat type, geographic location, and historical data with confidence scoring.
            </p>
          </div>
          <div>
            <div className="font-medium text-blue-900 mb-1">3. Expert Verification</div>
            <p className="text-blue-800">
              Wildlife biologists and citizen scientists review predictions to confirm species identification and validate counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
