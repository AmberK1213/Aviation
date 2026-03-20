using Aviation.Application.Dtos.Ai;
using Aviation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Aviation.Api.Controllers;

[ApiController]
[Route("api/sites")]
public class SiteController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    private static readonly Dictionary<string, (double Lat, double Lng)> SiteCoordinates = new()
{
        { "QueenBess",            (29.304305, -89.9592032) },
        { "QueenBessIsland",      (29.304305, -89.9592032) },
        { "HalfMoonIsland",       (30.1375755, -89.4352027) },
        { "FelicityIsland",       (29.2557876, -90.4399986) },
        { "RaccoonIsland",        (29.0504427, -90.9265846) },
        { "EastTimbalierIsland",  (29.076276,  -90.321667) },
    };

    public SiteController(IWebHostEnvironment env)
    {
        _env = env;
}

    // GET /api/sites/surveys — full ecological analysis
    [HttpGet("surveys")]
    public async Task<IActionResult> GetSurveys()
{
        var path = Path.Combine(_env.ContentRootPath, "outputs", "analysis", "final_analysis.json");
        if (!System.IO.File.Exists(path))
            return NotFound("final_analysis.json not found");

        var json = await System.IO.File.ReadAllTextAsync(path);
        var analysis = JsonSerializer.Deserialize<EcologicalAnalysisDto>(json, new JsonSerializerOptions
    {
            PropertyNameCaseInsensitive = true
        });

        return Ok(analysis);
    }

    // GET /api/sites — NestingSite[] for map/gallery/filter views
    [HttpGet]
    public async Task<IActionResult> GetSites()
    {
        var path = Path.Combine(_env.ContentRootPath, "outputs", "analysis", "final_analysis.json");
        if (!System.IO.File.Exists(path))
            return NotFound("final_analysis.json not found");
        
        var json = await System.IO.File.ReadAllTextAsync(path);
        var analysis = JsonSerializer.Deserialize<EcologicalAnalysisDto>(json, new JsonSerializerOptions
            {
            PropertyNameCaseInsensitive = true
        });

        var sites = new List<object>();
        int id = 1;

        foreach (var survey in analysis!.Surveys)
        {
            SiteCoordinates.TryGetValue(survey.SiteName, out var coords);

            foreach (var cls in survey.BirdData.EstimatedClassifications)
            {
                var abundance = (int)(survey.BirdData.TotalCount * cls.EstimatedPercentage / 100.0);

                sites.Add(new
                {
                    Id = id++.ToString(),
                    Lat = coords.Lat,
                    Lng = coords.Lng,
                    SiteName = survey.SiteName,
                    Species = cls.Species,
                    Abundance = abundance,
                    Priority = survey.OverallRiskLevel,
                    Habitat = MapHabitat(survey.HabitatAssessment?.Description),
                    LastSurveyed = survey.SurveyDate,
                    Confidence = MapConfidence(cls.Confidence),
                    VerificationStatus = "needs-review",
                    DetectionType = MapDetectionType(survey.BirdData.PopulationType),
                    ClimateImpact = new
                    {
                        RecentDisturbance = survey.ClimateImpact?.RecentDisturbance,
                        DisturbanceType = survey.ClimateImpact?.DisturbanceType,
                        EstimatedImpact = survey.ClimateImpact?.EstimatedImpactOnPopulation,
                        RecoveryStage = survey.ClimateImpact?.RecoveryStage,
                    },
                    HabitatCondition = survey.HabitatAssessment?.Condition,
                    ErosionRisk = survey.HabitatAssessment?.CoastalErosionRisk,
                    PopulationType = survey.BirdData.PopulationType,
                });
            }
        }

        return Ok(sites);
    }

    // GET /api/sites/detections — one entry per image, with annotated image URL
    [HttpGet("detections")]
    public async Task<IActionResult> GetDetections()
    {
        var jsonDir = Path.Combine(_env.ContentRootPath, "outputs", "json");
        if (!Directory.Exists(jsonDir))
            return NotFound("Detection JSONs not found. Copy Unseen_Results/json/ to Aviation.Api/outputs/json/");

        // Build a date → site map from the analysis so we can label each image
        var analysisPath = Path.Combine(_env.ContentRootPath, "outputs", "analysis", "final_analysis.json");
        var dateSiteMap = new Dictionary<string, string>();
        if (System.IO.File.Exists(analysisPath))
                {
            var analysisJson = await System.IO.File.ReadAllTextAsync(analysisPath);
            var analysis = JsonSerializer.Deserialize<EcologicalAnalysisDto>(analysisJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (analysis?.Surveys != null)
                foreach (var s in analysis.Surveys)
                    dateSiteMap[s.SurveyDate] = s.SiteName;
        }

        var detections = Directory.GetFiles(jsonDir, "*.json")
            .Select((jsonPath, i) =>
            {
                var filename = Path.GetFileNameWithoutExtension(jsonPath);
                var raw = System.IO.File.ReadAllText(jsonPath);
                var items = JsonSerializer.Deserialize<JsonElement[]>(raw) ?? [];
                var date = ParseDateFromFilename(filename);
                dateSiteMap.TryGetValue(date, out var site);
                
                return new
                {
                    Id = (i + 1).ToString(),
                    Filename = filename,
                    BirdCount = items.Length,
                    ImageUrl = $"/outputs/visuals/{filename}.png",
                    SurveyDate = date,
                    SiteName = site ?? "Unknown",
                };
            })
            .OrderByDescending(x => x.BirdCount)
            .ToList();
            
        return Ok(detections);
    }

    // Parses "18May15Camera2-Card5-00163" → "2015-05-18"
    private static string ParseDateFromFilename(string filename)
    {
        var match = Regex.Match(filename, @"^(\d{1,2})([A-Za-z]{3})(\d{2})");
        if (!match.Success) return "Unknown";

        var day = int.Parse(match.Groups[1].Value);
        var monthStr = char.ToUpper(match.Groups[2].Value[0]) + match.Groups[2].Value[1..].ToLower();
        var year = "20" + match.Groups[3].Value;
        
        string[] months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var monthIdx = Array.IndexOf(months, monthStr) + 1;
        return monthIdx == 0 ? "Unknown" : $"{year}-{monthIdx:D2}-{day:D2}";
    }

    private static string MapHabitat(string? description)
        {
        if (description == null) return "Barrier Island";
        var d = description.ToLower();
        if (d.Contains("marsh")) return "Coastal Marsh";
        if (d.Contains("beach") || d.Contains("sand")) return "Sandy Beach";
        if (d.Contains("mangrove")) return "Mangrove";
        if (d.Contains("oyster")) return "Oyster Reef";
        if (d.Contains("tidal")) return "Tidal Flat";
        return "Barrier Island";
    }

    private static double MapConfidence(string confidence) => confidence switch
        {
        "high"   => 0.90,
        "medium" => 0.70,
        "low"    => 0.50,
        _        => 0.60,
        };
        
    private static string MapDetectionType(string populationType) => populationType switch
    {
        "nesting_colony"      => "nest-colony",
        "migratory_stopover"  => "roosting-site",
        "foraging_flock"      => "roosting-site",
        _                     => "nest-colony",
    };
}
