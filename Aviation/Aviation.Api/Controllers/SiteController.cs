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

    // GET api/sites
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NestingSiteDto>>> GetAll()
    {
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detectionFiles = await _reader.ReadAsync(folderPath);
        var sites = detectionFiles.SelectMany(file => file.Detections.Select(det => new NestingSiteDto
        {
            Id = file.Image_Id + ":" + det.Name,
            Lat = file.Image_Center.Lat,
            Lng = file.Image_Center.Lon,
            Species = det.Name,
            Abundance = 1, // Prototype: each detection = 1
            Priority = "high", // Prototype: default
            Habitat = "Unknown", // Prototype: default
            LastSurveyed = DateTime.Now.ToString("yyyy-MM-dd"),
            Confidence = det.Confidence,
            VerificationStatus = "unverified", // Prototype: default
            DetectionType = "unknown", // Prototype: default
            ImageId = file.Image_Id
        })).ToList();
        return Ok(sites);
    }

    // GET api/sites/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<NestingSiteDto?>> GetById(string id)
    {
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detectionFiles = await _reader.ReadAsync(folderPath);
        var site = detectionFiles.SelectMany(file => file.Detections.Select(det => new NestingSiteDto
        {
            Id = file.Image_Id + ":" + det.Name,
            Lat = file.Image_Center.Lat,
            Lng = file.Image_Center.Lon,
            Species = det.Name,
            Abundance = 1,
            Priority = "high",
            Habitat = "Unknown",
            LastSurveyed = DateTime.Now.ToString("yyyy-MM-dd"),
            Confidence = det.Confidence,
            VerificationStatus = "unverified",
            DetectionType = "unknown",
            ImageId = file.Image_Id
        })).FirstOrDefault(x => x.Id == id);
        if (site == null) return NotFound();
        return Ok(site);
    }
}
