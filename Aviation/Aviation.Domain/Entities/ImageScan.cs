using System.Collections.Generic;
using Aviation.Domain.ValueObjects;

namespace Aviation.Domain.Entities;
public class ImageScan
{
    public string ImageId { get; set; }
    public GeoCoordinate Location { get; set; }

    public List<Detection> Detections { get; set; } = [];
}
