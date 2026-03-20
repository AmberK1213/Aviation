import { AlertTriangle, CheckCircle, Wind, Waves, Shield } from 'lucide-react';

interface ClimateImpactProps {
  surveyAnalysis: any;
}

const riskColors: Record<string, string> = {
  low:      'text-green-600 bg-green-50 border-green-200',
  medium:   'text-amber-600 bg-amber-50 border-amber-200',
  high:     'text-red-600 bg-red-50 border-red-200',
  critical: 'text-red-800 bg-red-100 border-red-300',
};

const erosionColors: Record<string, string> = {
  low:    'text-green-600',
  medium: 'text-amber-600',
  high:   'text-red-600',
};

const conditionColors: Record<string, string> = {
  healthy:    'text-green-600',
  stressed:   'text-amber-600',
  recovering: 'text-blue-600',
  degraded:   'text-red-600',
};

export function ClimateImpact({ surveyAnalysis }: ClimateImpactProps) {
  const { metadata, surveys } = surveyAnalysis;
  if (!surveys?.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Climate & Ecological Analysis</h2>
        <span className="text-xs text-gray-500">{metadata.generated_by}</span>
      </div>

      {/* Metadata Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metadata.total_birds_detected.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Birds Detected</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metadata.total_images_processed}</p>
          <p className="text-xs text-gray-500 mt-1">Images Processed</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{metadata.average_birds_per_image.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Birds / Image</p>
        </div>
      </div>

      {/* Per Survey Cards */}
      {surveys.map((survey: any, i: number) => (
        <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{survey.site_name}</h3>
              <p className="text-sm text-gray-500">{survey.survey_date}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColors[survey.overall_risk_level] ?? riskColors.medium}`}>
              {survey.overall_risk_level.toUpperCase()} RISK
            </span>
          </div>

          {/* Population */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Population</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {survey.bird_data.population_type.replace(/_/g, ' ')}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-600">{survey.bird_data.total_count.toLocaleString()} birds</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{survey.bird_data.population_type_reasoning}</p>
          </div>

          {/* Species Classifications */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Estimated Species</p>
            <div className="space-y-2">
              {survey.bird_data.estimated_classifications.map((cls: any, j: number) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800">{cls.species}</span>
                      <span className="text-xs text-gray-500">
                        {cls.estimated_percentage}% · {cls.confidence} confidence
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${cls.estimated_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habitat & Climate Row */}
          <div className="grid grid-cols-2 gap-4">

            {/* Habitat */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Habitat</span>
              </div>
              <p className={`text-sm font-semibold capitalize ${conditionColors[survey.habitat_assessment.condition] ?? 'text-gray-900'}`}>
                {survey.habitat_assessment.condition}
              </p>
              <p className="text-xs text-gray-500">{survey.habitat_assessment.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <Waves className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Erosion risk: </span>
                <span className={`text-xs font-medium capitalize ${erosionColors[survey.habitat_assessment.coastal_erosion_risk] ?? 'text-gray-600'}`}>
                  {survey.habitat_assessment.coastal_erosion_risk}
                </span>
              </div>
            </div>

            {/* Climate Impact */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Climate Impact</span>
              </div>
              <div className="flex items-center gap-2">
                {survey.climate_impact.recent_disturbance ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {survey.climate_impact.disturbance_type === 'none'
                    ? 'No recent disturbance'
                    : survey.climate_impact.disturbance_type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500">{survey.climate_impact.impact_reasoning}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">Recovery stage: </span>
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {survey.climate_impact.recovery_stage}
                </span>
              </div>
            </div>
          </div>

          {/* Gemini Notes */}
          {survey.gemini_notes && (
            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3">
              {survey.gemini_notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
