import { useState } from 'react';
import { FilterState, NestingSite } from '../types';
import { Camera, CheckCircle, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, Download, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';

interface DetectionGalleryProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
  sites: NestingSite[];
  detections: any[]; // Legacy detection format - not used with new API
}

export function DetectionGallery({ filters, onSiteSelect, sites }: DetectionGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetections, setShowDetections] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [imageError, setImageError] = useState(false);

  // Filter sites based on filter criteria
  const filteredSites = sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.some(s => site.species.includes(s))) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  const currentSite = filteredSites[currentImageIndex];
  
  // Get debug image path from API or construct fallback
  const currentImagePath = currentSite?.debugImagePath 
    ? `https://localhost:7039${currentSite.debugImagePath}`
    : currentSite?.imageId 
      ? `https://localhost:7039/images/debug/${currentSite.imageId}_debug.jpg`
      : '';
  
  const goToNextImage = () => {
    if (currentImageIndex < filteredSites.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageError(false);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setImageError(false);
    }
  };

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
    <div className="h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPreviousImage}
              disabled={currentImageIndex === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Image {currentImageIndex + 1} of {filteredSites.length}
            </span>
            <button 
              onClick={goToNextImage}
              disabled={currentImageIndex === filteredSites.length - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetections(!showDetections)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showDetections
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDetections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Detections
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredSites.length > 0 && currentSite ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Image Viewer */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="flex items-center justify-center min-h-full">
              <div 
                className="relative inline-block" 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
              >
                {!imageError && currentImagePath ? (
                  <img
                    src={currentImagePath}
                    alt={`Detection ${currentImageIndex + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '80vh' }}
                    onError={(e) => {
                      console.error('Failed to load image:', currentImagePath);
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="relative w-[900px] h-[700px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-32 h-32 text-slate-300 mx-auto mb-4" />
                      <p className="text-gray-500">Debug Image Not Available</p>
                      <p className="text-sm text-gray-400">{currentSite?.imageId}</p>
                      <p className="text-xs text-gray-400 mt-2">Expected: {currentImagePath}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Image Info & Detections */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Image Metadata */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Image Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium text-gray-900 text-xs">
                      {currentSite.imageId || currentSite.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Detections:</span>
                    <span className="font-medium text-gray-900">
                      {currentSite.detectionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {currentSite.lastSurveyed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900 text-xs">
                      {currentSite.lat.toFixed(4)}, {currentSite.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Verification</h3>
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusBadge(currentSite.verificationStatus)}`}>
                  {getStatusIcon(currentSite.verificationStatus)}
                  <span className="font-medium capitalize">
                    {currentSite.verificationStatus.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Detection Type */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Detection Type</h3>
                <div className={`p-3 rounded-lg ${getDetectionTypeBadge(currentSite.detectionType)}`}>
                  <div className="font-medium capitalize">
                    {currentSite.detectionType.replace('-', ' ')}
                  </div>
                  <div className="text-sm mt-1">
                    {currentSite.species}
                  </div>
                </div>
              </div>

              {/* Species Summary */}
              {currentSite.detections && currentSite.detections.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Species Detected</h3>
                  <div className="space-y-2">
                    {[...new Set(currentSite.detections.map(d => d.species))].map(species => {
                      const count = currentSite.detections.filter(d => d.species === species).length;
                      return (
                        <div key={species} className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-semibold text-gray-900">
                            {species}
                          </div>
                          <div className="text-sm text-gray-600">
                            {count} detection{count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detection Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Detections Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-cyan-900">Total Detections</div>
                      <div className="text-xs text-cyan-700">All objects found</div>
                    </div>
                    <div className="text-2xl font-bold text-cyan-700">
                      {currentSite.detectionCount}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-purple-900">Avg Confidence</div>
                      <div className="text-xs text-purple-700">AI prediction score</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {(currentSite.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Detection List */}
              {currentSite.detections && currentSite.detections.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Individual Detections</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentSite.detections.map((detection, index) => (
                      <div
                        key={`${currentSite.id}-${index}`}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {detection.species}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {(detection.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        {detection.boundingBox && (
                          <div className="text-xs text-gray-500 mb-2">
                            BBox: [{detection.boundingBox.xmin.toFixed(0)}, {detection.boundingBox.ymin.toFixed(0)}] to 
                            [{detection.boundingBox.xmax.toFixed(0)}, {detection.boundingBox.ymax.toFixed(0)}]
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-cyan-500"
                            style={{ width: `${detection.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">No Detections Found</h3>
            <p className="text-gray-600 text-sm">
              {sites.length === 0 
                ? 'No detection data available from the API'
                : 'Try adjusting your filters to see detected colonies'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
