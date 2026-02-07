using Aviation.Application.Dtos.Ai;
using Aviation.Application.Interfaces;
using Aviation.Domain.Entities;
using Aviation.Domain.ValueObjects;
using Aviation.Domain.Enums;
public class LoadImageScans
{
    private readonly IAiDetectionReader _reader;

    public LoadImageScans(IAiDetectionReader reader)
    {
        _reader = reader;
    }

    public async Task<IReadOnlyList<ImageScan>> ExecuteAsync(string folderPath)
    {
        var dtos = await _reader.ReadAsync(folderPath);
        return dtos.Select(MapToDomain).ToList();
    }

    private static ImageScan MapToDomain(ImageDetectionFileDto dto)
    {
        return new ImageScan
        {
            ImageId = dto.Image_Id,
            Location = dto.Image_Center != null
                ? new GeoCoordinate(
                    dto.Image_Center.Lat,
                    dto.Image_Center.Lon
                )
                : null,
            Detections = dto.Detections != null
                ? dto.Detections.Select(d => new Detection
                {
                    Type = DetectionType.AvianPresence,
                    Confidence = (float)d.Confidence,
                    Box = d.BoundingBox != null
                        ? new BoundingBox(
                            (float)d.BoundingBox.Xmin,
                            (float)d.BoundingBox.Ymin,
                            (float)d.BoundingBox.Xmax,
                            (float)d.BoundingBox.Ymax
                        )
                        : default
                }).ToList()
                : new List<Detection>()
        };
    }
}
