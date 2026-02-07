namespace Aviation.Application.Dtos.Ai;

public class ImageDetectionFileDto
{
    public string Image_Id { get; set; } = default!;
    public List<DetectionDto> Detections { get; set; } = [];
    public ImageCenterDto Image_Center { get; set; } = default!;
}