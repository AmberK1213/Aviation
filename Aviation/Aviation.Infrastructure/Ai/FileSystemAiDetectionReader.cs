using Aviation.Application.Dtos.Ai;
using Aviation.Application.Interfaces;
using System.Text.Json;
namespace Aviation.Infrastructure.Ai;

public class FileSystemAiDetectionReader : IAiDetectionReader
{
    public async Task<IReadOnlyList<ImageDetectionFileDto>> ReadAsync(string folderPath)
    {
        var results = new List<ImageDetectionFileDto>();
        
        foreach(var file in Directory.GetFiles(folderPath, "*.json"))
        {
            var json = await File.ReadAllTextAsync(file);
            var dto = JsonSerializer.Deserialize<ImageDetectionFileDto>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                })!;
            results.Add(dto);
        }
        return results;
    }
}