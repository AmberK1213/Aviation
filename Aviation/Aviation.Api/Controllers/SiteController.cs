using Aviation.Application.Dtos.Ai;
using Aviation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Aviation.Api.Controllers;

public class NestingSiteDto
{
    public string Id { get; set; } = default!;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Species { get; set; } = default!;
    public int Abundance { get; set; }
    public string Priority { get; set; } = default!;
    public string Habitat { get; set; } = default!;
    public string LastSurveyed { get; set; } = default!;
    public double Confidence { get; set; }
    public string VerificationStatus { get; set; } = default!;
    public string DetectionType { get; set; } = default!;
    public string? ImageId { get; set; }
    public string? DebugImagePath { get; set; }
    public int DetectionCount { get; set; }
    public List<DetectionInfo> Detections { get; set; } = new();
}

public class DetectionInfo
{
    public string Species { get; set; } = default!;
    public double Confidence { get; set; }
    public BoundingBoxDto BoundingBox { get; set; } = default!;
}

[ApiController]
[Route("api/[controller]")]
public class SiteController : ControllerBase
{
    private readonly IAiDetectionReader _reader;
    private readonly IConfiguration _config;

    public SiteController(IAiDetectionReader reader, IConfiguration config)
    {
        _reader = reader;
        _config = config;
    }

    // GET api/site
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NestingSiteDto>>> GetAll()
    {
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detectionFiles = await _reader.ReadAsync(folderPath);
        
        // Group by image ID - one site per image with all detections
        var sites = detectionFiles
            .Where(file => file.Detections != null && file.Detections.Any())
            .Select(file =>
            {
                var detections = file.Detections.Select(det => new DetectionInfo
                {
                    Species = det.Name ?? "Unidentified Bird",
                    Confidence = det.Confidence,
                    BoundingBox = det.BoundingBox
                }).ToList();

                var avgConfidence = detections.Average(d => d.Confidence);
                
                return new NestingSiteDto
                {
                    Id = file.Image_Id,
                    Lat = file.Image_Center.Lat,
                    Lng = file.Image_Center.Lon,
                    Species = detections.Count == 1 
                        ? detections[0].Species 
                        : $"Multiple Species ({detections.Count} detections)",
                    Abundance = detections.Count,
                    DetectionCount = detections.Count,
                    Detections = detections,
                    Priority = avgConfidence > 0.8 ? "high" : avgConfidence > 0.6 ? "medium" : "low",
                    Habitat = "Coastal Habitat",
                    LastSurveyed = DateTime.Now.ToString("yyyy-MM-dd"),
                    Confidence = avgConfidence,
                    VerificationStatus = avgConfidence > 0.85 ? "verified" : avgConfidence > 0.7 ? "needs-review" : "unverified",
                    DetectionType = detections.Count > 1 ? "nest-colony" : "individual-nests",
                    ImageId = file.Image_Id,
                    DebugImagePath = $"/images/debug/{file.Image_Id}_debug.jpg"
                };
            })
            .ToList();
            
        return Ok(sites);
    }

    // GET api/site/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<NestingSiteDto?>> GetById(string id)
    {
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detectionFiles = await _reader.ReadAsync(folderPath);
        
        var file = detectionFiles.FirstOrDefault(f => f.Image_Id == id);
        if (file == null || file.Detections == null || !file.Detections.Any())
            return NotFound();

        var detections = file.Detections.Select(det => new DetectionInfo
        {
            Species = det.Name ?? "Unidentified Bird",
            Confidence = det.Confidence,
            BoundingBox = det.BoundingBox
        }).ToList();

        var avgConfidence = detections.Average(d => d.Confidence);

        var site = new NestingSiteDto
        {
            Id = file.Image_Id,
            Lat = file.Image_Center.Lat,
            Lng = file.Image_Center.Lon,
            Species = detections.Count == 1 
                ? detections[0].Species 
                : $"Multiple Species ({detections.Count} detections)",
            Abundance = detections.Count,
            DetectionCount = detections.Count,
            Detections = detections,
            Priority = avgConfidence > 0.8 ? "high" : avgConfidence > 0.6 ? "medium" : "low",
            Habitat = "Coastal Habitat",
            LastSurveyed = DateTime.Now.ToString("yyyy-MM-dd"),
            Confidence = avgConfidence,
            VerificationStatus = avgConfidence > 0.85 ? "verified" : avgConfidence > 0.7 ? "needs-review" : "unverified",
            DetectionType = detections.Count > 1 ? "nest-colony" : "individual-nests",
            ImageId = file.Image_Id,
            DebugImagePath = $"/images/debug/{file.Image_Id}_debug.jpg"
        };
        
        return Ok(site);
    }
}
