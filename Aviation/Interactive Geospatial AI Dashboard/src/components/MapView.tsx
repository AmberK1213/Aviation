import { useEffect, useRef, useState } from 'react';
import { MapPin, Circle } from 'lucide-react';
import { NestingSite, FilterState, Detection } from '../types';
import { getPriorityColor } from '../data/mockData';

interface MapViewProps {
  filters: FilterState;
  selectedSite: NestingSite | null;
  onSiteSelect: (site: NestingSite | null) => void;
  sites: NestingSite[];
  detections: Detection[];
}

export function MapView({ filters, selectedSite, onSiteSelect, sites, detections }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);

  const filteredSites = sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.includes(site.species)) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Convert lat/lng to pixel coordinates (simplified projection)
  const latLngToPixel = (lat: number, lng: number) => {
    const bounds = {
      minLat: 29.0,
      maxLat: 30.0,
      minLng: -93.5,
      maxLng: -88.5,
    };
    
    const width = mapRef.current?.clientWidth || 800;
    const height = mapRef.current?.clientHeight || 600;
    
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    
    return { x, y };
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-sky-200 via-sky-100 to-blue-50" ref={mapRef}>
      {/* Water texture */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M0,20 Q15,15 30,20 T60,20" stroke="#3B82F6" strokeWidth="0.5" fill="none" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)" />
        </svg>
      </div>

      {/* Louisiana Coastline with recognizable features */}
      <svg className="absolute inset-0" width="100%" height="100%" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
        {/* Main Louisiana landmass */}
        <path
          d="M 0,200 L 0,100 Q 100,120 200,110 T 400,100 Q 500,95 600,100 T 800,110 L 800,0 L 0,0 Z"
          fill="#86EFAC"
          stroke="#15803D"
          strokeWidth="2"
        />
        
        {/* Delta region - Mississippi River Delta */}
        <path
          d="M 450,100 Q 460,150 450,200 L 480,200 Q 490,150 500,100"
          fill="#86EFAC"
          stroke="#15803D"
          strokeWidth="1.5"
        />
        
        {/* Barrier Islands */}
        {/* Chandeleur Islands (east) */}
        <ellipse cx="700" cy="280" rx="50" ry="12" fill="#D4A574" stroke="#92400E" strokeWidth="1" />
        
        {/* Breton Islands */}
        <ellipse cx="580" cy="320" rx="35" ry="10" fill="#D4A574" stroke="#92400E" strokeWidth="1" />
        
        {/* Isles Dernieres */}
        <ellipse cx="220" cy="420" rx="60" ry="10" fill="#D4A574" stroke="#92400E" strokeWidth="1" />
        
        {/* Timbalier Islands */}
        <ellipse cx="380" cy="380" rx="45" ry="10" fill="#D4A574" stroke="#92400E" strokeWidth="1" />
        
        {/* Grand Isle */}
        <ellipse cx="480" cy="350" rx="40" ry="12" fill="#D4A574" stroke="#92400E" strokeWidth="1" />
        
        {/* Marsh areas */}
        <path
          d="M 100,150 Q 120,180 140,200 Q 160,220 180,240"
          stroke="#059669"
          strokeWidth="3"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 250,140 Q 270,170 290,190 Q 310,210 330,230"
          stroke="#059669"
          strokeWidth="3"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 550,120 Q 560,150 570,180 Q 580,210 590,240"
          stroke="#059669"
          strokeWidth="3"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* Geographic Labels */}
      <div className="absolute top-20 right-32 text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded">
        Chandeleur Islands
      </div>
      <div className="absolute top-40 right-52 text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded">
        Breton Islands
      </div>
      <div className="absolute top-64 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded">
        Mississippi River Delta
      </div>
      <div className="absolute bottom-48 right-1/2 translate-x-8 text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded">
        Grand Isle
      </div>
      <div className="absolute bottom-52 left-52 text-xs font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded">
        Isles Dernieres
      </div>
      <div className="absolute top-32 left-20 text-sm font-semibold text-green-800 bg-white/90 px-3 py-1.5 rounded-lg shadow">
        LOUISIANA
      </div>
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-sm font-medium text-blue-700 bg-white/80 px-3 py-1.5 rounded">
        Gulf of Mexico
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-sm mb-3">Conservation Priority</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Low Priority</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <p>Showing {filteredSites.length} of {sites.length} nesting sites</p>
        </div>
      </div>

      {/* Coordinate Reference */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-mono text-gray-600">
        Louisiana Gulf Coast • 29°N - 30°N, 93.5°W - 88.5°W
      </div>

      {/* Nesting Sites */}
      {filteredSites.map(site => {
        const { x, y } = latLngToPixel(site.lat, site.lng);
        const isSelected = selectedSite?.id === site.id;
        const isHovered = hoveredSite === site.id;
        const size = Math.max(8, Math.min(site.abundance / 20, 30));
        
        return (
          <div
            key={site.id}
            className="absolute cursor-pointer transition-transform"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translate(-50%, -50%) scale(${isSelected || isHovered ? 1.3 : 1})`,
            }}
            onClick={() => onSiteSelect(site)}
            onMouseEnter={() => setHoveredSite(site.id)}
            onMouseLeave={() => setHoveredSite(null)}
          >
            {/* Outer glow for selected */}
            {isSelected && (
              <div
                className="absolute rounded-full animate-ping"
                style={{
                  width: `${size + 20}px`,
                  height: `${size + 20}px`,
                  backgroundColor: getPriorityColor(site.priority),
                  opacity: 0.3,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
            
            {/* Main marker */}
            <div
              className="rounded-full border-2 border-white shadow-lg"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: getPriorityColor(site.priority),
                opacity: isSelected ? 1 : 0.85,
              }}
            />
            
            {/* Tooltip on hover */}
            {(isHovered || isSelected) && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 pointer-events-none">
                <div className="font-semibold text-sm">{site.species}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <div>Abundance: {site.abundance} individuals</div>
                  <div>Habitat: {site.habitat}</div>
                  <div>Confidence: {(site.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Scale Bar */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-end gap-1 mb-1">
          <div className="w-16 h-1 bg-gray-800"></div>
        </div>
        <div className="text-xs text-gray-600">20 km</div>
      </div>
    </div>
  );
}