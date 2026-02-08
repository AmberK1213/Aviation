import { FilterState, NestingSite } from '../types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, MapPin, Bird, AlertTriangle, Calendar, Activity, Target, Layers, CheckCircle, Camera } from 'lucide-react';
import { useMemo } from 'react';

interface AnalyticsDashboardProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
  sites: NestingSite[];
  detections: any[]; // Legacy - not used
}

export function AnalyticsDashboard({ filters, sites }: AnalyticsDashboardProps) {
  // Filter sites based on filter criteria
  const filteredSites = sites.filter(site => {
    if (filters.species.length > 0 && !filters.species.some(s => site.species.includes(s))) return false;
    if (filters.habitat.length > 0 && !filters.habitat.includes(site.habitat)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(site.priority)) return false;
    if (filters.verificationStatus.length > 0 && !filters.verificationStatus.includes(site.verificationStatus)) return false;
    if (site.abundance < filters.minAbundance) return false;
    return true;
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalDetections = filteredSites.reduce((sum, site) => sum + site.detectionCount, 0);
    const avgConfidence = filteredSites.length > 0 
      ? filteredSites.reduce((sum, site) => sum + site.confidence, 0) / filteredSites.length 
      : 0;

    // Detection count distribution
    const detectionDistribution = filteredSites.reduce((acc, site) => {
      const bucket = site.detectionCount === 1 ? '1' : 
                     site.detectionCount <= 5 ? '2-5' :
                     site.detectionCount <= 10 ? '6-10' :
                     site.detectionCount <= 20 ? '11-20' : '20+';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const detectionDistributionData = Object.entries(detectionDistribution).map(([name, value]) => ({
      name,
      count: value,
    }));

    // Confidence distribution
    const confidenceRanges = filteredSites.reduce((acc, site) => {
      const bucket = site.confidence >= 0.85 ? 'High (85%+)' :
                     site.confidence >= 0.70 ? 'Medium (70-85%)' : 'Low (<70%)';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const confidenceData = Object.entries(confidenceRanges).map(([name, value]) => ({
      name,
      value,
    }));

    // Verification status
    const verificationData = filteredSites.reduce((acc, site) => {
      acc[site.verificationStatus] = (acc[site.verificationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const verificationChartData = Object.entries(verificationData).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
    }));

    // Detection type distribution
    const detectionTypeData = filteredSites.reduce((acc, site) => {
      acc[site.detectionType] = (acc[site.detectionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const detectionTypeChartData = Object.entries(detectionTypeData).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
    }));

    // Priority distribution
    const priorityData = filteredSites.reduce((acc, site) => {
      acc[site.priority] = (acc[site.priority] || 0) + site.detectionCount;
      return acc;
    }, {} as Record<string, number>);

    const priorityChartData = Object.entries(priorityData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      detections: value,
    }));

    // Scatter plot data: confidence vs detection count
    const scatterData = filteredSites.map(site => ({
      confidence: (site.confidence * 100).toFixed(1),
      detectionCount: site.detectionCount,
      priority: site.priority,
      name: site.imageId || site.id,
    }));

    // Habitat distribution
    const habitatData = filteredSites.reduce((acc, site) => {
      acc[site.habitat] = (acc[site.habitat] || 0) + site.detectionCount;
      return acc;
    }, {} as Record<string, number>);

    const habitatChartData = Object.entries(habitatData)
      .map(([name, value]) => ({
        name,
        detections: value,
      }))
      .sort((a, b) => b.detections - a.detections);

    return {
      totalDetections,
      avgConfidence,
      detectionDistributionData,
      confidenceData,
      verificationChartData,
      detectionTypeChartData,
      priorityChartData,
      scatterData,
      habitatChartData,
    };
  }, [filteredSites]);

  const COLORS = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
    verified: '#10B981',
    'needs review': '#F59E0B',
    unverified: '#6B7280',
    'nest colony': '#3B82F6',
    'individual nests': '#8B5CF6',
    'roosting site': '#14B8A6',
  };

  const getPriorityColor = (priority: string) => {
    return COLORS[priority as keyof typeof COLORS] || '#6B7280';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detection Analytics</h1>
        <p className="text-gray-600">
          Comprehensive analysis of {filteredSites.length} images with {analytics.totalDetections} bird detections
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Camera className="w-10 h-10 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">IMAGES</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{filteredSites.length}</div>
          <div className="text-sm text-gray-600">Analyzed Images</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Bird className="w-10 h-10 text-purple-600" />
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">TOTAL</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{analytics.totalDetections}</div>
          <div className="text-sm text-gray-600">Bird Detections</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-10 h-10 text-green-600" />
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">AVG</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {(analytics.totalDetections / Math.max(filteredSites.length, 1)).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Detections per Image</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-10 h-10 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">AI</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {(analytics.avgConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Avg Confidence</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Detection Count Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Detections per Image</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.detectionDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Confidence Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.confidenceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.confidenceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name.includes('High') ? '#10B981' : entry.name.includes('Medium') ? '#F59E0B' : '#6B7280'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Verification Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.verificationChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.verificationChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#6B7280'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Type Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bird className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Detection Types</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.detectionTypeChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.detectionTypeChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#6B7280'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Width Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Priority Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Detections by Priority Level</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="detections" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                {analytics.priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPriorityColor(entry.name.toLowerCase())} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Habitat Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Detections by Habitat Type</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.habitatChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="detections" fill="#14B8A6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence vs Detection Count Scatter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Confidence vs Detection Count</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                dataKey="detectionCount" 
                name="Detections" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                label={{ value: 'Number of Detections', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
              />
              <YAxis 
                type="number" 
                dataKey="confidence" 
                name="Confidence" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                label={{ value: 'AI Confidence (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <ZAxis type="number" range={[50, 200]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: any, name: string) => {
                  if (name === 'confidence') return [`${value}%`, 'Confidence'];
                  if (name === 'detectionCount') return [value, 'Detections'];
                  return value;
                }}
              />
              <Scatter name="Images" data={analytics.scatterData}>
                {analytics.scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">Low Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
