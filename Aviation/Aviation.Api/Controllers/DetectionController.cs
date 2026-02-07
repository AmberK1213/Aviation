using Aviation.Application.Dtos.Ai;
using Aviation.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Aviation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DetectionController : ControllerBase
{
    private readonly IAiDetectionReader _reader;
    private readonly IConfiguration _config;

    public DetectionController(IAiDetectionReader reader, IConfiguration config)
    {
        _reader = reader;
        _config = config;
    }

    // GET api/detection
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ImageDetectionFileDto>>> GetAll()
    {
        // Path can be set in appsettings or hardcoded for now
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detections = await _reader.ReadAsync(folderPath);
        return Ok(detections);
    }

    // GET api/detection/{imageId}
    [HttpGet("{imageId}")]
    public async Task<ActionResult<ImageDetectionFileDto?>> GetByImageId(string imageId)
    {
        var folderPath = _config.GetValue<string>("DetectionFolderPath") ?? "outputs/detections";
        var detections = await _reader.ReadAsync(folderPath);
        var detection = detections.FirstOrDefault(x => x.Image_Id == imageId);
        if (detection == null) return NotFound();
        return Ok(detection);
    }
}
