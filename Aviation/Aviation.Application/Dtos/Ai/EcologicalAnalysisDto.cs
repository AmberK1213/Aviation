using System.Text.Json.Serialization;

namespace Aviation.Application.Dtos.Ai;

public class EcologicalAnalysisDto
{
    public MetadataDto Metadata { get; set; } = default!;
    public List<SurveyDto> Surveys { get; set; } = [];
}

public class MetadataDto
{
    [JsonPropertyName("total_images_processed")]
    public int TotalImagesProcessed { get; set; }

    [JsonPropertyName("total_birds_detected")]
    public int TotalBirdsDetected { get; set; }

    [JsonPropertyName("average_birds_per_image")]
    public double AverageBirdsPerImage { get; set; }

    [JsonPropertyName("survey_sessions")]
    public int SurveySessions { get; set; }

    [JsonPropertyName("generated_by")]
    public string GeneratedBy { get; set; } = default!;
}

public class SurveyDto
{
    [JsonPropertyName("survey_date")]
    public string SurveyDate { get; set; } = default!;

    [JsonPropertyName("site_name")]
    public string SiteName { get; set; } = default!;

    [JsonPropertyName("bird_data")]
    public BirdDataDto BirdData { get; set; } = default!;

    [JsonPropertyName("habitat_assessment")]
    public HabitatAssessmentDto HabitatAssessment { get; set; } = default!;

    [JsonPropertyName("climate_impact")]
    public ClimateImpactDto ClimateImpact { get; set; } = default!;

    [JsonPropertyName("overall_risk_level")]
    public string OverallRiskLevel { get; set; } = default!;

    [JsonPropertyName("gemini_notes")]
    public string GeminiNotes { get; set; } = default!;
}

public class BirdDataDto
{
    [JsonPropertyName("total_count")]
    public int TotalCount { get; set; }

    [JsonPropertyName("population_type")]
    public string PopulationType { get; set; } = default!;

    [JsonPropertyName("population_type_reasoning")]
    public string PopulationTypeReasoning { get; set; } = default!;

    [JsonPropertyName("estimated_classifications")]
    public List<SpeciesClassificationDto> EstimatedClassifications { get; set; } = [];
}

public class SpeciesClassificationDto
{
    public string Species { get; set; } = default!;

    [JsonPropertyName("estimated_percentage")]
    public int EstimatedPercentage { get; set; }

    public string Confidence { get; set; } = default!;
    public string Reasoning { get; set; } = default!;
}

public class HabitatAssessmentDto
{
    public string Condition { get; set; } = default!;
    public string Description { get; set; } = default!;

    [JsonPropertyName("coastal_erosion_risk")]
    public string CoastalErosionRisk { get; set; } = default!;
}

public class ClimateImpactDto
{
    [JsonPropertyName("recent_disturbance")]
    public bool RecentDisturbance { get; set; }

    [JsonPropertyName("disturbance_type")]
    public string DisturbanceType { get; set; } = default!;

    [JsonPropertyName("estimated_impact_on_population")]
    public string EstimatedImpactOnPopulation { get; set; } = default!;

    [JsonPropertyName("impact_reasoning")]
    public string ImpactReasoning { get; set; } = default!;

    [JsonPropertyName("recovery_stage")]
    public string RecoveryStage { get; set; } = default!;
}
