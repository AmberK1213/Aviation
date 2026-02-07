using Aviation.Domain.Enums;
using Aviation.Domain.ValueObjects;
namespace Aviation.Domain.Entities;
public class Detection
{
    public DetectionType Type { get; set; }
    public float Confidence { get; set; }
    public BoundingBox Box {  get; set; }
}