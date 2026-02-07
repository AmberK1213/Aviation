namespace Aviation.Application.Dtos.Ai;

public class DetectionDto
{
    public string Name { get; set; } = default!;
    public double Confidence { get; set; }
    public BoundingBoxDto BoundingBox { get; set; } = default!;
}