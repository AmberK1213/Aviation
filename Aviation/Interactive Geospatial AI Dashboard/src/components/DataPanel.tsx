import { Info, Calendar, Target, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { NestingSite } from '../App';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DataPanelProps {
  selectedSite: NestingSite | null;
}

export function DataPanel({ selectedSite }: DataPanelProps) {
  // Mock temporal data for trends
  const temporalData = [
    { month: 'Aug', abundance: 180 },
    { month: 'Sep', abundance: 210 },
    { month: 'Oct', abundance: 245 },
    { month: 'Nov', abundance: 280 },
    { month: 'Dec', abundance: 310 },
    { month: 'Jan', abundance: selectedSite?.abundance || 340 },
  ];

  // Mock habitat metrics
  const habitatMetrics = [
    { name: 'Vegetation Cover', value: 72 },
    { name: 'Water Quality', value: 85 },
    { name: 'Shoreline Stability', value: 68 },
    { name: 'Food Availability', value: 79 },
  ];

  if (!selectedSite) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Site Details</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Select a nesting site on the map to view detailed analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Site Details</h2>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-lg mb-2">{selectedSite.species}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600">Abundance</div>
              <div className="font-semibold text-xl">{selectedSite.abundance}</div>
            </div>
            <div>
              <div className="text-gray-600">Confidence</div>
              <div className="font-semibold text-xl">{(selectedSite.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-4">
          {selectedSite.priority === 'high' ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              selectedSite.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : selectedSite.priority === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {selectedSite.priority} Priority
          </span>
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Location & Habitat
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Coordinates</span>
            <span className="font-mono">{selectedSite.lat.toFixed(4)}°N, {Math.abs(selectedSite.lng).toFixed(4)}°W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Habitat Type</span>
            <span className="font-medium">{selectedSite.habitat}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Surveyed</span>
            <span className="font-medium">{new Date(selectedSite.lastSurveyed).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Temporal Trend */}
      <div>
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Population Trend (6-Month)
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={temporalData}>
              <defs>
                <linearGradient id="colorAbundance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="abundance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAbundance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habitat Quality Metrics */}
      <div>
        <h4 className="font-medium text-sm mb-3">Habitat Quality Assessment</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={habitatMetrics} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Management Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2 text-blue-900">Conservation Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1.5">
          {selectedSite.priority === 'high' && (
            <>
              <li>• Immediate habitat protection recommended</li>
              <li>• Priority for restoration funding allocation</li>
              <li>• Increase monitoring frequency to monthly</li>
            </>
          )}
          {selectedSite.priority === 'medium' && (
            <>
              <li>• Continue regular monitoring schedule</li>
              <li>• Consider vegetation enhancement projects</li>
              <li>• Assess shoreline stabilization needs</li>
            </>
          )}
          {selectedSite.priority === 'low' && (
            <>
              <li>• Maintain current management practices</li>
              <li>• Standard quarterly monitoring sufficient</li>
              <li>• Monitor for any population changes</li>
            </>
          )}
        </ul>
      </div>

      {/* AI Detection Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
        <div className="font-medium mb-1">AI Detection Metadata</div>
        <div>Model: YOLOv8-Avian-Coastal v2.3</div>
        <div>Detection Confidence: {(selectedSite.confidence * 100).toFixed(1)}%</div>
        <div>Image Resolution: 0.5m/pixel</div>
        <div>Processing Date: {selectedSite.lastSurveyed}</div>
      </div>
    </div>
  );
}
